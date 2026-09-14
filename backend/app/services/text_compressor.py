"""
Local NLP Rule-based text compressor for prose and natural language content.
Uses SpaCy for grammatical pruning and a custom technical abbreviation dictionary.
"""

import re
import json

try:
    import spacy
    # Load small english model. If not available, we'll fall back to regex only.
    nlp = spacy.load("en_core_web_sm")
    HAS_SPACY = True
except ImportError:
    HAS_SPACY = False

# ─── Technical Abbreviation Dictionary ────────────────────────────────────────
ABBREVIATIONS = {
    r"\bfunction\b": "fn",
    r"\bfunctions\b": "fns",
    r"\bparameter\b": "param",
    r"\bparameters\b": "params",
    r"\bargument\b": "arg",
    r"\barguments\b": "args",
    r"\bpython\b": "py",
    r"\bjavascript\b": "js",
    r"\btypescript\b": "ts",
    r"\bdatabase\b": "db",
    r"\bconfiguration\b": "config",
    r"\bmessage\b": "msg",
    r"\bwithout\b": "w/o",
    r"\bwith\b": "w/",
    r"\bmaximum\b": "max",
    r"\bminimum\b": "min",
    r"\bgenerate\b": "gen",
    r"\bgenerator\b": "gen",
    r"\bsequence\b": "seq",
    r"\bapplication\b": "app",
    r"\binformation\b": "info",
    r"\binitialize\b": "init",
    r"\bvariable\b": "var",
    r"\bstring\b": "str",
    r"\binteger\b": "int",
    r"\bboolean\b": "bool",
    r"\bmemory-efficient\b": "mem-efficient",
    r"\bmemory efficient\b": "mem-efficient",
}

# ─── Filler phrases that add no semantic value for LLMs ───────────────────────
FILLER_PHRASES = [
    r"\bhello there\b",
    r"\bhi there\b",
    r"\bhello\b",
    r"\bI hope you are having a wonderful day so far\b",
    r"\bI hope you are having a wonderful day\b",
    r"\bI am currently working on a very important computer science assignment for my university class\b",
    r"\bI am currently working on a very important assignment\b",
    r"\band I was wondering if you could please help me out with it\b",
    r"\bI was wondering if you could please help me out with it\b",
    r"\bI was wondering if you could please help me\b",
    r"\bI need you to\b",
    r"\bBut here is the specific catch\b",
    r"\bhere is the specific catch\b",
    r"\bplease make sure\b",
    r"\bbecause I want to make sure it is extremely\b",
    r"\bbecause I want to make sure\b",
    r"\bAlso, if you wouldn't mind\b",
    r"\bif you wouldn't mind\b",
    r"\bcould you please\b",
    r"\bThank you so much in advance for your time and assistance\b",
    r"\bThank you so much in advance for your time\b",
    r"\bThank you so much\b",
    r"\bI really appreciate it\b",
    r"\bplease\b",
    r"\bkindly\b",
]

def apply_regex_pruning(text: str) -> str:
    """Applies basic regex removal of common conversational fluff."""
    result = text
    for pattern in sorted(FILLER_PHRASES, key=len, reverse=True):
        result = re.sub(pattern, "", result, flags=re.IGNORECASE)
    
    # Clean up punctuation left behind (like lone commas or periods)
    result = re.sub(r"^[,\.!\?\s]+", "", result) # leading
    result = re.sub(r"\s+[,\.!\?]\s+", " ", result) # middle orphans
    result = re.sub(r"  +", " ", result) # multiple spaces
    return result.strip()

def apply_spacy_pruning(text: str) -> str:
    """Uses SpaCy to intelligently drop syntactic fluff (determiners, polite verbs)."""
    if not HAS_SPACY:
        return text
        
    doc = nlp(text)
    retained_tokens = []
    
    for token in doc:
        # Drop determiners like 'a', 'an', 'the'
        if token.pos_ == "DET":
            continue
            
        # Drop punctuation that isn't crucial for code
        if token.is_punct and token.text not in [":", "{", "}", "(", ")", "[", "]", "=", "<", ">", "/", "-"]:
            continue
            
        retained_tokens.append(token.text_with_ws)
        
    return "".join(retained_tokens).strip()

def apply_abbreviations(text: str) -> str:
    """Applies technical abbreviations to save characters."""
    result = text
    for pattern, replacement in ABBREVIATIONS.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result

def compress_text(content: str) -> str:
    """
    Compress natural language text locally using NLP and rules.
    """
    result = content

    # 1. Strip massive conversational phrases
    result = apply_regex_pruning(result)
    
    # 2. Use NLP to drop grammatical fluff (a, an, the)
    result = apply_spacy_pruning(result)
    
    # 3. Abbreviate
    result = apply_abbreviations(result)
    
    # 4. Clean up spaces
    result = re.sub(r"  +", " ", result)
    
    return result.strip()

def compress_json(content: str) -> str:
    """
    Compress JSON by minifying it.
    """
    try:
        parsed = json.loads(content)
        return json.dumps(parsed, separators=(",", ":"), ensure_ascii=False)
    except (json.JSONDecodeError, ValueError):
        return compress_text(content)
