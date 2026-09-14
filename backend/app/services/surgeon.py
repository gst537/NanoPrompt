"""
The AST Surgeon Engine.
Mathematically isolates a Python error by extracting its Abstract Syntax Tree dependencies.
"""
import ast
import re

class DependencyVisitor(ast.NodeVisitor):
    def __init__(self, target_line):
        self.target_line = target_line
        self.target_vars = set()
        self.target_nodes = []
        
    def visit(self, node):
        # Check if this node is on or contains the target line
        if hasattr(node, 'lineno'):
            end_lineno = getattr(node, 'end_lineno', node.lineno)
            if node.lineno <= self.target_line <= end_lineno:
                self.target_nodes.append(node)
                # If we are precisely inside the target bounds, look for variables being loaded
                if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                    self.target_vars.add(node.id)
        self.generic_visit(node)


class DefinitionVisitor(ast.NodeVisitor):
    def __init__(self, target_vars, max_line):
        self.target_vars = target_vars
        self.max_line = max_line
        self.definition_lines = set()
        
    def visit_Assign(self, node):
        if hasattr(node, 'lineno') and node.lineno < self.max_line:
            # Check if any target var is assigned here
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in self.target_vars:
                    self._add_lines(node)
        self.generic_visit(node)
        
    def visit_FunctionDef(self, node):
        if hasattr(node, 'lineno') and node.lineno < self.max_line:
            # Check function arguments
            for arg in node.args.args:
                if arg.arg in self.target_vars:
                    self.definition_lines.add(node.lineno)
        self.generic_visit(node)
        
    def _add_lines(self, node):
        start = node.lineno
        end = getattr(node, 'end_lineno', start)
        for i in range(start, end + 1):
            self.definition_lines.add(i)

def parse_stack_trace(trace: str) -> int:
    """Extract the lowest (most recent) line number from a stack trace."""
    # Find all "line X" or "Line X" in the stack trace
    matches = re.findall(r'line\s+(\d+)', trace, re.IGNORECASE)
    if not matches:
        return -1
    # Typically the last line number in a traceback is the deepest frame (the actual error)
    return int(matches[-1])

def extract_error_slice(source_code: str, target_line: int) -> str:
    """
    Given a source code string and a target line (where an error occurred),
    extract the exact AST dependencies (variable definitions) needed to reproduce the error.
    """
    try:
        tree = ast.parse(source_code)
    except SyntaxError:
        return "ERROR: Invalid Python syntax."
        
    # 1. Find variables used on the target line
    dep_visitor = DependencyVisitor(target_line)
    dep_visitor.visit(tree)
    
    # 2. Find where those variables were defined before the target line
    def_visitor = DefinitionVisitor(dep_visitor.target_vars, target_line)
    if dep_visitor.target_vars:
        def_visitor.visit(tree)
    
    # 3. Collect lines
    lines_to_keep = set(def_visitor.definition_lines)
    lines_to_keep.add(target_line) # Always keep the error line
    
    # Add surrounding context for the error line (1 line above/below) for readability
    lines_to_keep.add(target_line - 1)
    lines_to_keep.add(target_line + 1)
    
    lines = source_code.split("\n")
    result = []
    
    for i, line in enumerate(lines, 1):
        if i in lines_to_keep:
            result.append(f"L{i}: {line}")
            
    return "\n".join(result)
