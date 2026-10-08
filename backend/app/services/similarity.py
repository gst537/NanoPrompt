"""
Local Semantic Similarity engine for Quantitative Proof.
"""

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    print("Loading sentence-transformers model (all-MiniLM-L6-v2) for Proof Engine...")
    model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
    HAS_SENTENCE_TRANSFORMERS = True
    print("sentence-transformers loaded successfully!")
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
    print("sentence-transformers not installed. Similarity scoring disabled.")
except Exception as e:
    HAS_SENTENCE_TRANSFORMERS = False
    print(f"Failed to load sentence-transformers: {e}")

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculates the cosine similarity between two text strings using local embeddings.
    Returns a float between 0.0 and 1.0 representing percentage overlap.
    """
    if not HAS_SENTENCE_TRANSFORMERS:
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
