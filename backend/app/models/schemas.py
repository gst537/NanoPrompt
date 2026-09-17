"""
Pydantic request/response schemas for the NanoPrompt API.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# ─── Request Models ───────────────────────────────────────────────────────────

class CompressRequest(BaseModel):
    """Request body for the compression endpoint."""
    content: str = Field(..., min_length=1, description="The text or code to compress")
    type: Literal["auto", "code", "text", "json", "debug"] = Field(
        default="auto",
        description="Content type. 'auto' enables smart detection.",
    )

class SurgeonRequest(BaseModel):
    """Request body for the Surgeon endpoint."""
    code: str = Field(..., description="The full source code")
    trace: str = Field(..., description="The error stack trace")

class SurgeonResponse(BaseModel):
    """Response from the Surgeon endpoint."""
    sliced_code: str
    target_line: int


# ─── Response Models ──────────────────────────────────────────────────────────

class CompressionStats(BaseModel):
    """Statistics about a single compression operation."""
    original_tokens: int
    compressed_tokens: int
    tokens_saved: int
    compression_ratio: float = Field(
        ..., description="Ratio of compressed to original (e.g., 0.4 means 60% reduction)"
    )
    savings_usd: float = Field(
        ..., description="Estimated USD saved based on GPT-4o input pricing"
    )
    detected_type: str = Field(
        ..., description="The content type that was detected or specified"
    )


class CompressResponse(BaseModel):
    """Response from the compression endpoint."""
    compressed_text: str
    stats: CompressionStats


class AggregateStats(BaseModel):
    """Aggregate statistics across all compression operations."""
    total_compressions: int
    total_original_tokens: int
    total_compressed_tokens: int
    total_tokens_saved: int
    total_savings_usd: float
    average_compression_ratio: float


class CompressionLogResponse(BaseModel):
    """A single compression log entry for the dashboard."""
    id: str
    input_type: str
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    savings_usd: float
    created_at: datetime


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    service: str = "nanoprompt-api"
    version: str = "0.1.0"

class AblationRequest(BaseModel):
    """Request body for ablation test."""
    content: str = Field(..., description="The text to run through the ablation test")

class AblationResult(BaseModel):
    """Ablation result for a specific module."""
    module_name: str
    original_tokens: int
    compressed_tokens: int
    tokens_saved: int
    compression_ratio: float
    savings_usd: float
    compressed_text: str

class AblationResponse(BaseModel):
    """Response containing multiple ablation results."""
    results: list[AblationResult]

