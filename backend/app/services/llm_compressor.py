import os
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types
from groq import Groq
from app.services.text_compressor import compress_text as fallback_compress_text

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if api_key and api_key != "YOUR_API_KEY_HERE":
        return Groq(api_key=api_key)
    return None

def semantic_compress(text: str) -> str:
    """
    Compresses text using an LLM (Gemini -> Groq) to intelligently summarize and abbreviate
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

    api_key = os.getenv("GEMINI_API_KEY")
    
    # 1. Attempt Gemini 
    if api_key and api_key != "YOUR_API_KEY_HERE":
        try:
            client = genai.Client(api_key=api_key)
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
            if compressed and len(compressed) > 1:
                return compressed
        except Exception as e:
            print(f"NanoPrompt: Gemini API error: {e}. Attempting Groq fallback...")
            
    # 2. Attempt Groq Fallback
    groq_client = get_groq_client()
    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                max_tokens=2048,
            )
            compressed = chat_completion.choices[0].message.content.strip()
            if compressed and len(compressed) > 1:
                print("NanoPrompt: Successfully routed through Groq Llama 3.")
                return compressed
        except Exception as e:
            print(f"NanoPrompt: Groq API error: {e}.")
            
    # 3. Deterministic Fallback
    print("NanoPrompt: All LLM APIs failed. Falling back to regex compressor.")
    return fallback_compress_text(text)

def run_proof_engine(original_prompt: str, compressed_prompt: str) -> tuple[str, str]:
    """
    Runs both prompts through an LLM to prove they yield semantically identical answers.
    Cascades from Gemini to Groq. Returns (original_answer, compressed_answer).
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    # 1. Attempt Gemini
    if api_key and api_key != "YOUR_API_KEY_HERE":
        try:
            client = genai.Client(api_key=api_key)
            
            res_orig = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=original_prompt,
                config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=8192)
            )
            ans_orig = res_orig.text.strip()

            res_comp = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=compressed_prompt,
                config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=8192)
            )
            ans_comp = res_comp.text.strip()
            
            return ans_orig, ans_comp
        except Exception as e:
            print(f"NanoPrompt: Gemini Proof Engine failed: {e}. Attempting Groq fallback...")
            
    # 2. Attempt Groq
    groq_client = get_groq_client()
    if groq_client:
        try:
            res_orig = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": original_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                max_tokens=8192,
            )
            ans_orig = res_orig.choices[0].message.content.strip()
            
            res_comp = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": compressed_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                max_tokens=8192,
            )
            ans_comp = res_comp.choices[0].message.content.strip()
            
            print("NanoPrompt: Successfully proved via Groq Llama 3.")
            return ans_orig, ans_comp
        except Exception as e:
            print(f"NanoPrompt: Groq Proof Engine failed: {e}")
            return (f"Error connecting to Groq: {e}", f"Error connecting to Groq: {e}")
            
    # 3. No APIs available
    return ("(Requires LLM API Key for Proof Engine)", "(Requires LLM API Key for Proof Engine)")
