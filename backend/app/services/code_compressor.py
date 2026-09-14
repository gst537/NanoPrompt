"""
AST-based Python code compressor.
Uses the Abstract Syntax Tree to safely remove non-functional elements
while preserving all logic and structure.
"""

import ast
import re
import textwrap


def compress_code(source: str) -> str:
    """
    Compress Python source code using AST analysis.
    
    Removes:
    - Docstrings (module, class, and function level)
    - Inline comments
    - Blank lines
    - Excessive whitespace
    - Type hints (optional annotations)
    
    Preserves:
    - All logic and control flow
    - Function/class signatures
    - Variable assignments
    - Import statements
    """
    # First, try AST-based compression for Python
    try:
        compressed = _ast_compress_python(source)
        return compressed
    except SyntaxError:
        # If it's not valid Python, fall back to generic code compression
        return _generic_code_compress(source)


def _ast_compress_python(source: str) -> str:
    """
    Use Python's AST to parse and reconstruct code without docstrings.
    Then apply line-level cleaning.
    """
    tree = ast.parse(source)

    # Remove docstrings from all nodes
    _remove_docstrings(tree)

    # Unparse the cleaned AST back to source code
    cleaned = ast.unparse(tree)

    # Post-process: remove blank lines and normalize whitespace
    lines = cleaned.split("\n")
    compressed_lines = []
    for line in lines:
        stripped = line.rstrip()
        if stripped:  # Skip blank lines
            compressed_lines.append(stripped)

    return "\n".join(compressed_lines)


def _remove_docstrings(node: ast.AST):
    """
    Recursively remove docstrings from AST nodes.
    A docstring is an Expr node containing a Constant (str) as the first
    statement of a Module, FunctionDef, AsyncFunctionDef, or ClassDef.
    """
    for child in ast.walk(node):
        if isinstance(child, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            if (
                child.body
                and isinstance(child.body[0], ast.Expr)
                and isinstance(child.body[0].value, ast.Constant)
                and isinstance(child.body[0].value.value, str)
            ):
                child.body.pop(0)
                # If body is now empty, add a `pass` statement
                if not child.body:
                    child.body.append(ast.Pass())


def _generic_code_compress(source: str) -> str:
    """
    Fallback compression for non-Python code (JS, Java, etc.).
    Uses jsmin to strip block comments and inline comments, which is
    highly effective for React/TypeScript and generic C-style syntax.
    """
    try:
        from jsmin import jsmin
        # jsmin is designed for JS, but safely strips /* */ and // from TS/Java/C++ too.
        minified = jsmin(source)
        
        # Post-process to remove completely blank lines that jsmin might leave
        lines = minified.split("\n")
        compressed_lines = [line.strip() for line in lines if line.strip()]
        
        return "\n".join(compressed_lines)
    except Exception as e:
        print(f"NanoPrompt: jsmin failed, falling back to basic strip. {e}")
        # Absolute fallback if jsmin chokes on something weird
        lines = source.split("\n")
        return "\n".join([line.strip() for line in lines if line.strip()])
