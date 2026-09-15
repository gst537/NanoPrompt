"""
API routes for NanoPrompt compression and statistics.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.db.models import CompressionLog
from app.models.schemas import (
    CompressRequest,
    CompressResponse,
    CompressionStats,
    AggregateStats,
    CompressionLogResponse,
    HealthResponse,
    SurgeonRequest,
    SurgeonResponse,
)
from app.services.router import detect_content_type
from app.services.code_compressor import compress_code
from app.services.text_compressor import compress_text, compress_json
from app.services.llm_compressor import run_proof_engine
from app.services.token_counter import count_tokens, calculate_savings_usd, get_compression_ratio
from app.services.surgeon import extract_error_slice, parse_stack_trace
from app.services.file_extractor import extract_pdf, extract_docx

from typing import List, Dict

router = APIRouter(prefix="/api/v1", tags=["compression"])

# ─── Health Check ─────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse()

# ─── Compression Endpoint ────────────────────────────────────────────────────

@router.post("/compress", response_model=CompressResponse)
async def compress(request: CompressRequest, db: AsyncSession = Depends(get_db)):
    """
    Compress input text or code.
    """
    content = request.content

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    if request.type == "auto":
        detected_type = detect_content_type(content)
    else:
        detected_type = request.type

    original_tokens = count_tokens(content)

    if detected_type == "code":
        compressed = compress_code(content)
    elif detected_type == "json":
        compressed = compress_json(content)
    else:
        compressed = compress_text(content)

    compressed_tokens = count_tokens(compressed)

    compression_ratio = get_compression_ratio(original_tokens, compressed_tokens)
    savings_usd = calculate_savings_usd(original_tokens, compressed_tokens)
    tokens_saved = original_tokens - compressed_tokens

    log_entry = CompressionLog(
        input_type=detected_type,
        original_tokens=original_tokens,
        compressed_tokens=compressed_tokens,
        compression_ratio=compression_ratio,
        savings_usd=savings_usd,
    )
    db.add(log_entry)
    await db.commit()

    return CompressResponse(
        compressed_text=compressed,
        stats=CompressionStats(
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            tokens_saved=tokens_saved,
            compression_ratio=compression_ratio,
            savings_usd=savings_usd,
            detected_type=detected_type,
        ),
    )

@router.post("/compress/file", response_model=CompressResponse)
async def compress_file(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """
    Extract text from a PDF or DOCX file and compress it.
    """
    content_type = file.content_type
    filename = file.filename or ""
    
    file_bytes = await file.read()
    
    if content_type == "application/pdf" or filename.lower().endswith('.pdf'):
        raw_text, extracted_text = extract_pdf(file_bytes)
    elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or filename.lower().endswith('.docx'):
        raw_text, extracted_text = extract_docx(file_bytes)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")
        
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the file.")

    # The original tokens should reflect the raw uncompressed messy PDF text.
    original_tokens = count_tokens(raw_text)
    
    # Bypass deep semantic ML compression for documents to perfectly preserve grammar and claims.
    # We only apply safe regex, whitespace pruning, and basic abbreviations.
    from app.services.text_compressor import compress_document
    compressed = compress_document(extracted_text)
    compressed_tokens = count_tokens(compressed)
    
    compression_ratio = get_compression_ratio(original_tokens, compressed_tokens)
    savings_usd = calculate_savings_usd(original_tokens, compressed_tokens)
    tokens_saved = original_tokens - compressed_tokens

    log_entry = CompressionLog(
        input_type="file",
        original_tokens=original_tokens,
        compressed_tokens=compressed_tokens,
        compression_ratio=compression_ratio,
        savings_usd=savings_usd,
    )
    db.add(log_entry)
    await db.commit()

    return CompressResponse(
        compressed_text=compressed,
        stats=CompressionStats(
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            tokens_saved=tokens_saved,
            compression_ratio=compression_ratio,
            savings_usd=savings_usd,
            detected_type="file",
        ),
    )


# ─── Proof Engine Endpoint ───────────────────────────────────────────────────

@router.post("/verify")
async def verify_compression(request: Dict[str, str]):
    """
    Runs original and compressed prompts through Groq to verify semantic equivalence.
    Body expects: {"original": "...", "compressed": "..."}
    """
    original = request.get("original", "")
    compressed = request.get("compressed", "")
    
    if not original or not compressed:
        raise HTTPException(status_code=400, detail="Must provide original and compressed text")
        
    ans_orig, ans_comp = run_proof_engine(original, compressed)
    
    return {
        "original_answer": ans_orig,
        "compressed_answer": ans_comp,
        "is_equivalent": None # Could add LLM judge here later
    }


@router.post("/surgeon", response_model=SurgeonResponse)
async def surgeon_endpoint(request: SurgeonRequest):
    """
    Extract AST slice based on stack trace.
    """
    target_line = parse_stack_trace(request.trace)
    if target_line <= 0:
        raise HTTPException(status_code=400, detail="Could not parse line number from stack trace.")
        
    sliced_code = extract_error_slice(request.code, target_line)
    return SurgeonResponse(sliced_code=sliced_code, target_line=target_line)

# ─── Statistics Endpoints ────────────────────────────────────────────────────

@router.get("/stats", response_model=AggregateStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get aggregate compression statistics."""
    result = await db.execute(
        select(
            func.count(CompressionLog.id).label("total_compressions"),
            func.coalesce(func.sum(CompressionLog.original_tokens), 0).label("total_original_tokens"),
            func.coalesce(func.sum(CompressionLog.compressed_tokens), 0).label("total_compressed_tokens"),
            func.coalesce(func.sum(CompressionLog.savings_usd), 0.0).label("total_savings_usd"),
            func.coalesce(func.avg(CompressionLog.compression_ratio), 1.0).label("average_compression_ratio"),
        )
    )
    row = result.first()

    total_original = row.total_original_tokens or 0
    total_compressed = row.total_compressed_tokens or 0

    return AggregateStats(
        total_compressions=row.total_compressions or 0,
        total_original_tokens=total_original,
        total_compressed_tokens=total_compressed,
        total_tokens_saved=total_original - total_compressed,
        total_savings_usd=round(float(row.total_savings_usd or 0), 6),
        average_compression_ratio=round(float(row.average_compression_ratio or 1.0), 4),
    )


@router.get("/history", response_model=List[CompressionLogResponse])
async def get_history(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """Get recent compression history."""
    result = await db.execute(
        select(CompressionLog)
        .order_by(CompressionLog.created_at.desc())
        .limit(limit)
    )
    logs = result.scalars().all()

    return [
        CompressionLogResponse(
            id=log.id,
            input_type=log.input_type,
            original_tokens=log.original_tokens,
            compressed_tokens=log.compressed_tokens,
            compression_ratio=log.compression_ratio,
            savings_usd=log.savings_usd,
            created_at=log.created_at,
        )
        for log in logs
    ]
