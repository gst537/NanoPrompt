import os
from google import genai
from google.genai import types
from app.services.text_compressor import compress_text as fallback_compress_text

def semantic_compress(text: str) -> str:
    """
    Compresses text using an LLM (Gemini) to intelligently summarize and abbreviate
    without losing core semantic instructions. Falls back to regex if no API key is set.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        print("NanoPrompt: GEMINI_API_KEY not found. Falling back to regex compressor.")
        return fallback_compress_text(text)

    try:
        client = genai.Client(api_key=api_key)
        
        system_prompt = (
            "You are an extreme prompt compressor API. Your ONLY job is to take the user's input "
            "and rewrite it to be as token-dense and short as possible. "
            "Rules: \n"
            "1. Remove all pleasantries (please, thank you, hi).\n"
            "2. Use abbreviations where obvious (e.g., pt for point, w/ for with).\n"
            "3. RETAIN 100% of the core semantic instructions, context, and constraints. Do not omit facts.\n"
            "4. Output ONLY the compressed text, no markdown formatting, no explanations, no 'Here is the compressed version'."
        )

        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=text,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.0,
                max_output_tokens=2048,
            )
        )
        
        compressed = response.text.strip()
        
        # Safety check: if the LLM hallucinated an empty string or something weird, use fallback
        if not compressed or len(compressed) < 2:
            return fallback_compress_text(text)
            
        return compressed
        
    except Exception as e:
        print(f"NanoPrompt: Gemini API error: {e}")
        return fallback_compress_text(text)

def run_proof_engine(original_prompt: str, compressed_prompt: str) -> tuple[str, str]:
    """
    Runs both prompts through Gemini to prove they yield semantically identical answers.
    Returns (original_answer, compressed_answer).
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        return ("(Requires Gemini API Key)", "(Requires Gemini API Key)")
        
    try:
        client = genai.Client(api_key=api_key)
        
        # Call for original
        res_orig = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=original_prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,
                max_output_tokens=1024,
            )
        )
        ans_orig = res_orig.text.strip()

        # Call for compressed
        res_comp = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=compressed_prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,
                max_output_tokens=1024,
            )
        )
        ans_comp = res_comp.text.strip()
        
        return ans_orig, ans_comp
        
    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "exhausted" in error_str or "quota" in error_str or "too many requests" in error_str:
            print(f"NanoPrompt: Proof Engine Rate Limited: {e}")
            return ("[RATE_LIMIT_EXCEEDED]", "[RATE_LIMIT_EXCEEDED]")
        else:
            print(f"NanoPrompt: Proof Engine Error: {e}")
            return (f"Error connecting to Gemini: {e}", f"Error connecting to Gemini: {e}")
