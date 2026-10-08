import sys
try:
    from llmlingua import PromptCompressor
    llm = PromptCompressor(model_name="microsoft/llmlingua-2-xlm-roberta-large-meetingbank", use_llmlingua2=True, device_map="cpu")
    res = llm.compress_prompt("Hello this is a test prompt to see what keys are returned.", rate=0.5)
    print(res.keys())
    # print token info if exists
    if 'tokens' in res: print(res['tokens'])
    if 'token_prob_list' in res: print(res['token_prob_list']) # this might be it?
except Exception as e:
    print(e)
