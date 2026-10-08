import sys
try:
    from llmlingua import PromptCompressor
    llm = PromptCompressor(model_name="microsoft/llmlingua-2-xlm-roberta-large-meetingbank", use_llmlingua2=True, device_map="cpu")
    print("METHODS:")
    print([m for m in dir(llm) if not m.startswith('_')])
    
    # check return value of compress_prompt when return_word_label=True
    res = llm.compress_prompt("Hello this is a test.", rate=0.5, return_word_label=True)
    if 'fn_labeled_original_prompt' in res:
        print("fn_labeled_original_prompt format:")
        print(type(res['fn_labeled_original_prompt']))
        print(res['fn_labeled_original_prompt'])
except Exception as e:
    print(e)
