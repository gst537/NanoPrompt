import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.similarity import calculate_similarity
from app.services.complexity import analyze_complexity
from app.services.text_compressor import generate_heatmap

def test_v2():
    print("--- Testing Similarity ---")
    score = calculate_similarity("This is exactly the same.", "This is exactly the same.")
    print(f"Exact match score: {score}")
    score2 = calculate_similarity("I love apples.", "Cars are fast.")
    print(f"Different match score: {score2}")
    
    print("\n--- Testing Complexity ---")
    c1 = analyze_complexity("Can you please summarize this email for me? It's about a meeting tomorrow.")
    print(f"Simple prompt: {c1}")
    c2 = analyze_complexity("Write a python script that connects to sqlite and uses pandas to merge dataframes. Here is the code: ```python\nimport pandas\n```")
    print(f"Complex prompt: {c2}")
    
    print("\n--- Testing Heatmap ---")
    h = generate_heatmap("Please calculate the exact numbers.")
    for token in h:
        print(f"{token['word'].strip()}: {token['weight']}")

if __name__ == "__main__":
    test_v2()
