import os
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types
from app.services.text_compressor import compress_text as fallback_compress_text

def get_gemini_client(use_fallback: bool = False):
    """
    Returns a Gemini client. If use_fallback is True, it attempts to use GEMINI_FALLBACK_API_KEY.
    """
    api_key = os.getenv("GEMINI_FALLBACK_API_KEY") if use_fallback else os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "YOUR_API_KEY_HERE":
        return genai.Client(api_key=api_key)
    return None

def semantic_compress(text: str) -> str:
    """
    Compresses text using Gemini to intelligently summarize and abbreviate
    without losing core semantic instructions. Falls back to regex if APIs fail.
    """
    system_prompt = (
        "You are an extreme prompt compressor API. Your ONLY job is to take the user's input "
        "and rewrite it to be as token-dense and short as possible. "
        "Rules: \n"
        "1. Remove all pleasantries (please, thank you, hi).\n"
        "2. Use abbreviations where obvious (e.g., pt for point, w/ for with).\n"
        "3. RETAIN 100% of the core semantic instructions, context, and constraints. Do not omit facts.\n"
        "4. Output ONLY the compressed text, no markdown formatting, no explanations, no 'Here is the compressed version'."
    )

    # 1. Attempt Primary Gemini Key (lite model - less congested)
    client = get_gemini_client(use_fallback=False)
    if client:
        for model in ['gemini-flash-lite-latest', 'gemini-3.8-flash']:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=text,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=0.0,
                        max_output_tokens=2048,
                    )
                )
                compressed = response.text.strip()
                if compressed and len(compressed) > 1:
                    return compressed
            except Exception as e:
                print(f"NanoPrompt: Gemini {model} error: {e}. Trying next...")
                continue
        print("NanoPrompt: Primary key exhausted. Attempting Fallback Gemini Key...")
            
    # 2. Attempt Fallback Gemini Key
    fallback_client = get_gemini_client(use_fallback=True)
    if fallback_client:
        for model in ['gemini-flash-lite-latest', 'gemini-3.8-flash']:
            try:
                response = fallback_client.models.generate_content(
                    model=model,
                    contents=text,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=0.0,
                        max_output_tokens=2048,
                    )
                )
                compressed = response.text.strip()
                if compressed and len(compressed) > 1:
                    print("NanoPrompt: Successfully routed through Fallback Gemini Key.")
                    return compressed
            except Exception as e:
                print(f"NanoPrompt: Fallback Gemini {model} error: {e}. Trying next...")
                continue
            
    # 3. Deterministic Fallback
    print("NanoPrompt: All LLM APIs failed. Falling back to regex compressor.")
    return fallback_compress_text(text)

def run_proof_engine(original_prompt: str, compressed_prompt: str) -> tuple[str, str]:
    """
    Runs both prompts through an LLM to prove they yield semantically identical answers.
    Cascades from Primary Gemini Key to Fallback Gemini Key. Returns (original_answer, compressed_answer).
    """
    # 1. Attempt Primary Gemini Key
    client = get_gemini_client(use_fallback=False)
    if client:
        for model in ['gemini-flash-lite-latest', 'gemini-3.8-flash']:
            try:
                res_orig = client.models.generate_content(
                    model=model,
                    contents=original_prompt,
                    config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=8192)
                )
                ans_orig = res_orig.text.strip()
                res_comp = client.models.generate_content(
                    model=model,
                    contents=compressed_prompt,
                    config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=8192)
                )
                ans_comp = res_comp.text.strip()
                return ans_orig, ans_comp
            except Exception as e:
                primary_error = e
                print(f"NanoPrompt: Primary Gemini Proof Engine {model} failed: {e}. Trying next...")
                continue
        print("NanoPrompt: Primary key exhausted. Attempting Fallback Gemini Key...")
            
    # 2. Attempt Fallback Gemini Key
    fallback_client = get_gemini_client(use_fallback=True)
    if fallback_client:
        for model in ['gemini-flash-lite-latest', 'gemini-3.8-flash']:
            try:
                res_orig = fallback_client.models.generate_content(
                    model=model,
                    contents=original_prompt,
                    config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=8192)
                )
                ans_orig = res_orig.text.strip()
                res_comp = fallback_client.models.generate_content(
                    model=model,
                    contents=compressed_prompt,
                    config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=8192)
                )
                ans_comp = res_comp.text.strip()
                print(f"NanoPrompt: Successfully proved via Fallback Gemini Key ({model}).")
                return ans_orig, ans_comp
            except Exception as e:
                print(f"NanoPrompt: Fallback Gemini Proof Engine {model} failed: {e}")
                continue
        return (f"Error connecting to Gemini: {primary_error if 'primary_error' in locals() else 'all models failed'}",
                f"Error connecting to Gemini: {primary_error if 'primary_error' in locals() else 'all models failed'}")
            
    # 3. No fallback available or both failed
    if 'primary_error' in locals():
        return (f"Error connecting to Gemini: {primary_error}", f"Error connecting to Gemini: {primary_error}")
    
    return ("(Requires LLM API Key for Proof Engine)", "(Requires LLM API Key for Proof Engine)")
