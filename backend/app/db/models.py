"""
SQLAlchemy ORM models for NanoPrompt.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum as SAEnum
from app.db.database import Base


class CompressionLog(Base):
    """Tracks every compression operation for analytics."""

    __tablename__ = "compression_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    input_type = Column(String, nullable=False)  # "code", "text", "json", "unknown"
    original_tokens = Column(Integer, nullable=False)
    compressed_tokens = Column(Integer, nullable=False)
    compression_ratio = Column(Float, nullable=False)  # e.g., 0.62 means 62% of original
    savings_usd = Column(Float, nullable=False, default=0.0)
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return (
            f"<CompressionLog(id={self.id}, type={self.input_type}, "
            f"{self.original_tokens}→{self.compressed_tokens} tokens, "
            f"saved ${self.savings_usd:.4f})>"
        )
