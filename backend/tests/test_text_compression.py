import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import re
from app.services.text_compressor import compress_text, apply_spacy_pruning, apply_regex_pruning

def test_user_screenshot_prompt_no_merged_words():
    """
    Directly tests the prompt from the user's issue:
    'I hope you are having a wonderful day today. Write a python script that connects to a sqlite database. Ensure that your response is detailed and explains perfectly.'
    Ensures words like 'today' and 'write', or 'database' and 'your' never merge into 'todaywrite' or 'databaseyour'.
    """
    raw_prompt = (
        "I hope you are having a wonderful day today. "
        "Write a python script that connects to a sqlite database. "
        "Ensure that your response is detailed and explains perfectly."
    )
    compressed = compress_text(raw_prompt)
    
    # 1. Negative assertions: merged words must NOT exist
    assert "todaywrite" not in compressed.lower(), f"Unexpected merged word 'todaywrite' found in: {compressed}"
    assert "databaseyour" not in compressed.lower(), f"Unexpected merged word 'databaseyour' found in: {compressed}"
    assert "dbyour" not in compressed.lower(), f"Unexpected merged word 'dbyour' found in: {compressed}"
    
    # 2. Positive assertions: words must be properly delimited
    # 'today' and 'write' (or 'py') must be separated by space/punct
    assert re.search(r"\btoday\b.*?\b(write|py)\b", compressed, re.IGNORECASE), f"Expected 'today' and 'write/py' to be separated: {compressed}"
    
    # 3. Technical abbreviations should work because boundaries are preserved
    # 'python' should be 'py'
    assert "py" in compressed.lower()
    # 'database' should be 'db'
    assert "db" in compressed.lower()

def test_no_concatenated_words_general():
    """
    Checks that dropping punctuation and determiners across multiple sentences
    does not glue adjacent words together.
    """
    text = (
        "Hello! I hope you are having a wonderful day today. "
        "Can you please create a function that takes a parameter and returns a boolean? "
        "Thank you so much in advance for your time and assistance."
    )
    compressed = compress_text(text)
    
    # Check that any word in compressed output consists of valid characters and isn't a known glued token
    assert "todaycan" not in compressed.lower()
    assert "booleanthank" not in compressed.lower()
    assert "paramreturns" not in compressed.lower()
    
    # Abbreviation check: function -> fn, parameter -> param, boolean -> bool
    assert "fn" in compressed.lower()
    assert "param" in compressed.lower()
    assert "bool" in compressed.lower()

def test_punctuation_spacing_normalized():
    """
    Ensures sentence-separating punctuation is followed by a space and not glued to following word.
    """
    text = "First sentence. Second sentence! Third question? Fourth clause, continues."
    compressed = compress_text(text)
    
    # Verify no word directly follows punctuation without a space, e.g. "sentence.Second"
    glued_punct = re.findall(r'[A-Za-z0-9][\.\,\!\?][A-Za-z0-9]', compressed)
    assert not glued_punct, f"Punctuation is missing space after it: {glued_punct}"

def test_spacy_pruning_whitespace_inheritance():
    """
    Unit test for apply_spacy_pruning specifically.
    """
    text = "today. Write a python script"
    pruned = apply_spacy_pruning(text)
    assert "todaywrite" not in pruned.lower()
    assert re.search(r"today[\.\s]+Write", pruned, re.IGNORECASE)

def test_repeated_and_conflicting_punctuation():
    """
    Verifies that repeated or conflicting punctuation marks like '.!', '..', ',.', '??'
    are collapsed into a single clean punctuation mark.
    """
    prompt = "write py script connects to sqlite db. response detailed explains perfectly.!"
    compressed = compress_text(prompt)
    assert ".!" not in compressed, f"'.!' found in output: {compressed}"
    assert not re.search(r'[,\.!\?:;]{2,}', compressed), f"Repeated punctuation found in: {compressed}"

    # Also test '..', '??', '!.', ',.'
    assert ".." not in compress_text("Testing double periods.. now.")
    assert "??" not in compress_text("Is this working??")
    assert ",." not in compress_text("Clause,. next sentence.")

if __name__ == "__main__":
    print("Running test_user_screenshot_prompt_no_merged_words...")
    test_user_screenshot_prompt_no_merged_words()
    print("✓ test_user_screenshot_prompt_no_merged_words passed")
    
    print("Running test_no_concatenated_words_general...")
    test_no_concatenated_words_general()
    print("✓ test_no_concatenated_words_general passed")
    
    print("Running test_punctuation_spacing_normalized...")
    test_punctuation_spacing_normalized()
    print("✓ test_punctuation_spacing_normalized passed")
    
    print("Running test_spacy_pruning_whitespace_inheritance...")
    test_spacy_pruning_whitespace_inheritance()
    print("✓ test_spacy_pruning_whitespace_inheritance passed")

    print("Running test_repeated_and_conflicting_punctuation...")
    test_repeated_and_conflicting_punctuation()
    print("✓ test_repeated_and_conflicting_punctuation passed")
    
    print("\nAll text compression spacing and punctuation tests passed successfully! 🎉")

