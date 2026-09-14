"""
NanoPrompt API — FastAPI Application Entry Point.

A hybrid compression engine that sits between users and LLMs,
reducing token usage by 40-70% without sacrificing output quality.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
from app.routers.compress import router as compress_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    await init_db()
    yield


app = FastAPI(
    title="NanoPrompt API",
    description="Universal AI Token Optimizer — Compress prompts and code to save LLM costs.",
    version="0.1.0",
    lifespan=lifespan,
)

# ─── CORS Configuration ──────────────────────────────────────────────────────
# Allow the Next.js frontend and Chrome extension to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Next.js dev server
        "http://127.0.0.1:3000",
        "chrome-extension://*",        # Chrome extension
        "https://chatgpt.com",         # ChatGPT
        "https://claude.ai",           # Claude
        "*"                            # Fallback for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mount Routers ────────────────────────────────────────────────────────────
app.include_router(compress_router)


@app.get("/")
async def root():
    """Root endpoint — API info."""
    return {
        "service": "NanoPrompt API",
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "compress": "POST /api/v1/compress",
            "stats": "GET /api/v1/stats",
            "history": "GET /api/v1/history",
            "health": "GET /api/v1/health",
        },
    }
