"""
Predictive Complexity Routing engine.
"""

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    HAS_SPACY = True
except ImportError:
    HAS_SPACY = False

def analyze_complexity(text: str) -> dict:
    """
    Analyzes syntactic density and code blocks to recommend a model.
    Returns a dict with 'density_score' and 'suggested_model'.
    """
    if not HAS_SPACY or not text.strip():
        return {"density_score": 0.0, "suggested_model": "gemini-3.8-flash-lite", "reason": "No SpaCy available or empty text"}
    
    # Check for code blocks
    code_blocks = text.count("```")
    if code_blocks >= 2:
        return {"density_score": 1.0, "suggested_model": "gemini-3.8-flash", "reason": "Code block detected"}
        
    doc = nlp(text)
    total_tokens = len(doc)
    
    if total_tokens == 0:
        return {"density_score": 0.0, "suggested_model": "gemini-3.8-flash-lite", "reason": "Empty text"}
        
    # Count nouns, proper nouns, and verbs
    dense_tokens = sum(1 for token in doc if token.pos_ in ["NOUN", "PROPN", "VERB", "SYM"])
    density_score = dense_tokens / total_tokens
    
    # High density usually means complex, detailed instructions
    if density_score > 0.35: 
        suggested_model = "gemini-3.8-flash"
    else:
        suggested_model = "gemini-3.8-flash-lite"
        
    return {
        "density_score": round(density_score, 2),
        "suggested_model": suggested_model,
        "reason": f"Syntactic density: {round(density_score, 2)}"
    }
