"""
Local Semantic Similarity engine for Quantitative Proof.
"""

import numpy as np

try:
    # Just check if it's available without loading the heavy model yet
    import sentence_transformers
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
    print("sentence-transformers not installed. Similarity scoring disabled.")

_model = None

def get_similarity_model():
    global _model
    if _model is None and HAS_SENTENCE_TRANSFORMERS:
        try:
            from sentence_transformers import SentenceTransformer
            print("Loading sentence-transformers model (all-MiniLM-L6-v2) for Proof Engine...")
            _model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
            print("sentence-transformers loaded successfully!")
        except Exception as e:
            print(f"Failed to load sentence-transformers: {e}")
            return None
    return _model

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculates the cosine similarity between two text strings using local embeddings.
    Returns a float between 0.0 and 1.0 representing percentage overlap.
    """
    if not HAS_SENTENCE_TRANSFORMERS:
        return 0.0
        
    model = get_similarity_model()
    if not model:
        return 0.0
    
    # Get embeddings
    embeddings = model.encode([text1, text2])
    vec1, vec2 = embeddings[0], embeddings[1]
    
    # Calculate cosine similarity
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    similarity = dot_product / (norm1 * norm2)
    # Clip to handle potential floating point errors outside [-1, 1]
    return max(0.0, min(1.0, float(similarity)))
