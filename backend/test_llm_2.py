import sys
try:
    from llmlingua import PromptCompressor
    llm = PromptCompressor(model_name="microsoft/llmlingua-2-xlm-roberta-large-meetingbank", use_llmlingua2=True, device_map="cpu")
    res = llm.compress_prompt("Hello this is a test prompt to see what keys are returned.", rate=0.5, return_word_label=True)
    print(res.keys())
    if 'word_label' in res: print("HAS WORD LABEL")
    # try getting probabilities directly
except Exception as e:
    print(e)
