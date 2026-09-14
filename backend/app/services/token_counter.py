"""
Token counting service using OpenAI's tiktoken library.
Uses the cl100k_base encoding (GPT-4, GPT-4o, GPT-3.5-turbo).
"""

import os
import tiktoken
from dotenv import load_dotenv

load_dotenv()

# GPT-4o input pricing: $2.50 per 1M tokens
PRICE_PER_MILLION_TOKENS = float(os.getenv("PRICE_PER_MILLION_TOKENS", "2.50"))

# Use cl100k_base — the encoding for GPT-4, GPT-4o, and GPT-3.5-turbo
_encoder = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    """Count the number of tokens in a string using cl100k_base encoding."""
    if not text:
        return 0
    return len(_encoder.encode(text))


def calculate_savings_usd(original_tokens: int, compressed_tokens: int) -> float:
    """
    Calculate the estimated USD savings from compression.
    Based on GPT-4o input token pricing.
    """
    tokens_saved = original_tokens - compressed_tokens
    if tokens_saved <= 0:
        return 0.0
    # $2.50 USD per 1M tokens * 83.5 INR/USD = 208.75 INR per 1M tokens
    usd_savings = (tokens_saved / 1_000_000) * PRICE_PER_MILLION_TOKENS
    inr_savings = usd_savings * 83.5
    return round(inr_savings, 6)


def get_compression_ratio(original_tokens: int, compressed_tokens: int) -> float:
    """
    Calculate compression ratio.
    Returns the fraction of tokens remaining (e.g., 0.4 means 60% reduction).
    """
    if original_tokens == 0:
        return 1.0
    return round(compressed_tokens / original_tokens, 4)
