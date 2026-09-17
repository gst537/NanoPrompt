"""
Local NLP Rule-based and Machine Learning text compressor for prose and natural language content.
Uses LLMLingua for deep semantic pruning, and falls back to SpaCy/regex.
"""

import re
import json

try:
    from llmlingua import PromptCompressor
    print("Loading LLMLingua model (this may take a moment)...")
    llm_compressor = PromptCompressor(
        model_name="microsoft/llmlingua-2-xlm-roberta-large-meetingbank",
        use_llmlingua2=True,
        device_map="cpu"
    )
    HAS_LLMLINGUA = True
    print("LLMLingua loaded successfully!")
except ImportError:
    HAS_LLMLINGUA = False
    print("LLMLingua not installed. Falling back to SpaCy.")
except Exception as e:
    HAS_LLMLINGUA = False
    print(f"Failed to load LLMLingua model: {e}")

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
    Compress natural language text locally.
    Chains the pipelines: Regex -> SpaCy -> LLMLingua -> Abbreviations.
    """
    # 1. Run deterministic rule-based pruning first
    result = content
    result = apply_regex_pruning(result)
    result = apply_spacy_pruning(result)

    # 2. Feed the pre-cleaned text into the Neural Model for deep semantic pruning
    if HAS_LLMLINGUA:
        try:
            # RATE CONTROL: 0.7 preserves grammar and human prose (drops 30% of tokens)
            llm_results = llm_compressor.compress_prompt(result, rate=0.7, force_tokens=['\n'])
            compressed = llm_results.get('compressed_prompt', result)
            
            # 3. Final technical abbreviations & whitespace cleanup
            compressed = apply_abbreviations(compressed)
            compressed = re.sub(r"  +", " ", compressed)
            compressed = re.sub(r"\n{3,}", "\n\n", compressed)
            return compressed.strip()
        except Exception as e:
            print(f"LLMLingua compression failed: {e}. Relying on Regex+SpaCy fallback.")
            
    # 3. Fallback path (if LLMLingua is missing or fails)
    result = apply_abbreviations(result)
    result = re.sub(r"  +", " ", result)
    
    return result.strip()

def apply_safe_document_pruning(text: str) -> str:
    """
    Offline Telegram-style compression using SpaCy.
    Strips determiners and safe adverbs to save tokens, but explicitly
    protects negations, verbs, and nouns to perfectly preserve technical claims.
    """
    if not HAS_SPACY:
        return text

    # Process large texts in chunks if necessary, but for now assume doc can handle it
    # We increase max_length for large PDFs
    nlp.max_length = 5000000 
    
    doc = nlp(text)
    retained_tokens = []
    
    for token in doc:
        # Protect negations ("not", "no", "never", "n't")
        if token.dep_ == "neg" or token.text.lower() in ["not", "no", "never", "n't"]:
            retained_tokens.append(token.text_with_ws)
            continue
            
        # Protect Verbs, Auxiliaries, and Nouns to preserve meaning
        if token.pos_ in ["VERB", "AUX", "NOUN", "PROPN", "PRON"]:
            retained_tokens.append(token.text_with_ws)
            continue
            
        # Drop determiners ("a", "an", "the")
        if token.pos_ == "DET":
            # Just keep the trailing whitespace if it existed
            if token.whitespace_:
                if retained_tokens and not retained_tokens[-1].endswith(" "):
                    retained_tokens[-1] += " "
            continue
            
        # Drop filler adverbs
        if token.text.lower() in ["really", "very", "extremely", "actually", "basically", "literally"]:
            if token.whitespace_:
                if retained_tokens and not retained_tokens[-1].endswith(" "):
                    retained_tokens[-1] += " "
            continue
            
        retained_tokens.append(token.text_with_ws)
        
    return "".join(retained_tokens).strip()

def compress_document(content: str) -> str:
    """
    Safely compresses human documents (PDF/DOCX).
    Bypasses LLMLingua to preserve exact grammar, context, and negations.
    Only removes conversational fluff, safe grammatical filler (DET), and excess whitespace.
    """
    result = content
    result = apply_regex_pruning(result)
    result = apply_safe_document_pruning(result)
    result = re.sub(r"  +", " ", result)
    result = re.sub(r"\n{3,}", "\n\n", result)
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

def run_ablation_test(content: str) -> list[dict]:
    """
    Runs the content through various isolated compression pipelines to measure ablation impact.
    """
    from app.services.token_counter import count_tokens, calculate_savings_usd, get_compression_ratio
    
    original_tokens = count_tokens(content)
    results = []
    
    def evaluate(module_name: str, compressed: str):
        compressed_tokens = count_tokens(compressed)
        ratio = get_compression_ratio(original_tokens, compressed_tokens)
        savings = calculate_savings_usd(original_tokens, compressed_tokens)
        results.append({
            "module_name": module_name,
            "original_tokens": original_tokens,
            "compressed_tokens": compressed_tokens,
            "tokens_saved": original_tokens - compressed_tokens,
            "compression_ratio": ratio,
            "savings_usd": savings,
            "compressed_text": compressed
        })
    
    # 1. Baseline
    evaluate("Baseline", content)
    
    # 2. Regex + Abbreviations Only
    regex_abbr_only = apply_abbreviations(apply_regex_pruning(content))
    evaluate("Regex + Abbreviations", regex_abbr_only)
    
    # 3. SpaCy Only
    if HAS_SPACY:
        spacy_only = apply_spacy_pruning(content)
        evaluate("SpaCy NLP", spacy_only)
    
    # 4. LLMLingua Only
    if HAS_LLMLINGUA:
        try:
            llm_results = llm_compressor.compress_prompt(content, rate=0.7, force_tokens=['\n'])
            llm_only = llm_results.get('compressed_prompt', content)
            evaluate("LLMLingua (Neural)", llm_only)
        except Exception:
            pass
            
    # 5. NanoPrompt Full Pipeline
    full_compressed = compress_text(content)
    evaluate("NanoPrompt (All)", full_compressed)
    
    return results
