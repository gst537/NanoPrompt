import io
import os
import fitz  # PyMuPDF
import docx
from PIL import Image
from google import genai
from google.genai import types

def run_gemini_ocr(image_bytes: bytes) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        return "[Diagram Omitted: No Gemini API Key]"

    try:
        client = genai.Client(api_key=api_key)
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        system_prompt = (
            "You are an OCR data extractor. Describe this diagram, chart, or image in detail. "
            "Extract any raw numbers, labels, tables, or exact data points verbatim. "
            "Do not hallucinate. Do not write a summary, extract the raw factual data."
        )

        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=[system_prompt, pil_image],
            config=types.GenerateContentConfig(temperature=0.0)
        )
        return response.text.strip()
    except Exception as e:
        print(f"NanoPrompt: Vision OCR failed: {e}")
        return "[Diagram Omitted: OCR Error]"

def extract_pdf(file_bytes: bytes) -> tuple[str, str]:
    """
    Extracts text and images from a PDF.
    Returns a tuple of (raw_unformatted_text, clean_markdown_text).
    """
    text_blocks = []
    raw_text = []
    
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            # Get raw text for baseline token counting (messy, lots of newlines/spaces)
            raw_text.append(page.get_text("text"))
            
            # 1. Extract Images via Gemini OCR
            image_list = page.get_images()
            for img in image_list:
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                # If image is CMYK or has alpha, convert to RGB for PIL compatibility
                if pix.n - pix.alpha > 3:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                
                img_bytes = pix.tobytes("png")
                ocr_text = run_gemini_ocr(img_bytes)
                text_blocks.append(f"\n[Embedded Diagram/Image: {ocr_text}]\n")
                pix = None

            # 2. Extract Text Blocks for Markdown
            blocks = page.get_text("blocks")
            for b in blocks:
                # blocks is a tuple where b[4] is the text
                text = b[4].strip()
                if text:
                    text_blocks.append(text)
                    
    # Join blocks with double newlines to simulate paragraphs/markdown
    return ("\n".join(raw_text), "\n\n".join(text_blocks))

def extract_docx(file_bytes: bytes) -> tuple[str, str]:
    """
    Extracts text from a DOCX file.
    Returns a tuple of (raw_unformatted_text, clean_markdown_text).
    """
    doc = docx.Document(io.BytesIO(file_bytes))
    
    text_blocks = []
    raw_text = []
    
    # Extract paragraphs
    for para in doc.paragraphs:
        text = para.text.strip()
        # For baseline, we just append everything roughly
        raw_text.append(para.text)
        
        if text:
            # If it's a heading style, format as markdown
            if para.style.name.startswith('Heading'):
                level = para.style.name[-1]
                if level.isdigit():
                    text = f"{'#' * int(level)} {text}"
                else:
                    text = f"# {text}"
            text_blocks.append(text)
            
    # Extract tables (very basically)
    for table in doc.tables:
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            raw_text.append(" ".join(row_data))
            if any(row_data):
                text_blocks.append(" | ".join(row_data))
                
    return ("\n".join(raw_text), "\n\n".join(text_blocks))
