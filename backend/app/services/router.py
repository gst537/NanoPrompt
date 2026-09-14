"""
Content-type detection router.
Analyzes input text and routes it to the appropriate compression engine.
"""

import re
import json


def detect_content_type(content: str) -> str:
    """
    Detect whether the input is code, JSON, or prose.
    Returns: "code", "json", "text"
    """
    stripped = content.strip()

    # ─── Try JSON first (cheapest check) ──────────────────────────────────────
    if _is_json(stripped):
        return "json"

    # ─── Check for code patterns ──────────────────────────────────────────────
    if _is_code(stripped):
        return "code"

    # ─── Default: treat as prose/text ─────────────────────────────────────────
    return "text"


def _is_json(text: str) -> bool:
    """Check if the input is valid JSON."""
    if not (text.startswith("{") or text.startswith("[")):
        return False
    try:
        json.loads(text)
        return True
    except (json.JSONDecodeError, ValueError):
        return False


def _is_code(text: str) -> bool:
    """
    Heuristic check for code content.
    Looks for common programming patterns across Python, JS, TS, Java, etc.
    """
    lines = text.split("\n")
    code_indicators = 0
    total_lines = len(lines)

    if total_lines == 0:
        return False

    # Strong indicators (any one of these is enough)
    strong_patterns = [
        r"^\s*(def |class |import |from .+ import |async def )",  # Python
        r"^\s*(function |const |let |var |export |import .+ from)",  # JS/TS
        r"^\s*(public |private |protected |static |void |int |String )",  # Java/C#
        r"^\s*#include\s*<",  # C/C++
        r"^\s*(if __name__\s*==\s*)",  # Python main guard
    ]

    for line in lines:
        for pattern in strong_patterns:
            if re.match(pattern, line):
                return True

    # Weak indicators (need multiple)
    weak_patterns = [
        r"[{}\[\]();]",  # Brackets and semicolons
        r"^\s*#",  # Comments (Python, shell)
        r"^\s*//",  # Comments (JS, C, Java)
        r"^\s*\*/",  # Block comment end
        r"=\s*['\"]",  # Assignment with strings
        r"\w+\.\w+\(",  # Method calls (obj.method())
        r"^\s*return\s",  # Return statements
        r"^\s*for\s.+in\s",  # For loops
        r"^\s*while\s",  # While loops
        r"^\s*try:",  # Try blocks
        r"^\s*except\s",  # Except blocks
    ]

    for line in lines:
        for pattern in weak_patterns:
            if re.search(pattern, line):
                code_indicators += 1

    # If more than 30% of lines look like code, it's probably code
    code_ratio = code_indicators / total_lines
    return code_ratio > 0.3
