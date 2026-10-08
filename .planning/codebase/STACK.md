# Technology Stack

**Analysis Date:** 2026-10-08

## Languages

**Primary:**
- Python 3.10+ - Backend API, AST parsing and slicing, local NLP engines, ORM models, and ML pipelines (`backend/`)
- TypeScript 5.x - Frontend web dashboard, UI components, API client, and state management (`frontend/`)

**Secondary:**
- JavaScript (ES6+) - Chrome Extension background service worker, content scripts, UI injection, and popup logic (`extension/`); build configs (`frontend/eslint.config.mjs`)
- CSS / PostCSS - Bespoke styling and Tailwind CSS theme definitions (`frontend/src/app/globals.css`, `extension/styles.css`)
- HTML5 - Chrome Extension popup view (`extension/popup.html`)

## Runtime

**Environment:**
- Python 3.10+ Virtual Environment (`backend/venv/`)
- Node.js 18+ (tested with Next.js 16 / React 19)
- Chromium / Chrome Browser Runtime (Manifest V3 extension host)

**Package Manager:**
- `pip` - Python package management (`backend/requirements.txt`)
- `npm` 10.x - Node package management (`frontend/package.json`, `package-lock.json` present)

## Frameworks

**Core:**
- FastAPI 0.1x (Python) - High-performance ASGI web framework providing compression and telemetry endpoints (`backend/app/main.py`)
- Uvicorn (standard) - ASGI server running FastAPI with reload support
- Next.js 16.3.5 (React 19.2.8) - React full-stack framework utilizing App Router (`frontend/src/app/`)

**UI & Styling:**
- Tailwind CSS v4 (`@tailwindcss/postcss`) - Utility-first styling with custom dark theme tokens (`frontend/src/app/globals.css`)
- Framer Motion 13.2.0 - Physics-based UI animations, layout transitions, and micro-interactions (`frontend/src/components/`)
- React Markdown 10.1.0 & remark-gfm 4.0.1 - Markdown rendering for LLM Proof Engine outputs (`frontend/src/components/ProofPane.tsx`)

**Testing:**
- Ad-hoc CLI inspection harnesses (`backend/ablation_test.py`, `backend/test_v2.py`, `backend/test_llm*.py`)
- No formal test runner (pytest/Jest) currently configured

**Build/Dev:**
- Next.js Dev Server (`next dev`) and compiler
- ESLint 9 (`eslint-config-next`)
- TypeScript compiler (`tsc`)

## Key Dependencies

**Critical Backend & NLP:**
- `tiktoken` - Fast BPE token counting using OpenAI `cl100k_base` encoding (`backend/app/services/token_counter.py`)
- `spacy` (`en_core_web_sm`) - Local syntactic token pruning, part-of-speech tagging, and syntactic density scoring (`backend/app/services/text_compressor.py`, `complexity.py`)
- `llmlingua` - CPU neural prompt compressor using `microsoft/llmlingua-2-xlm-roberta-large-meetingbank` (`backend/app/services/text_compressor.py`)
- `sentence-transformers` (`all-MiniLM-L6-v2`) - Local dense vector embeddings for Quantitative Proof Engine cosine similarity (`backend/app/services/similarity.py`)
- `torch` - PyTorch CPU runtime required by HuggingFace and LLMLingua models
- `google-genai` - Google Gemini SDK (`gemini-3.6-flash`) for Proof Engine validation, vision OCR, and fallback compression (`backend/app/services/llm_compressor.py`, `file_extractor.py`)
- `groq` - Groq SDK (`llama3-8b-8192`) for cascading high-availability LLM failover (`backend/app/services/llm_compressor.py`)
- `jsmin` - JavaScript/TypeScript comment and whitespace minification (`backend/app/services/code_compressor.py`)
- `pymupdf` (`fitz`) & `python-docx` - Document parsing and image extraction for PDF/DOCX files (`backend/app/services/file_extractor.py`)
- `pillow` (`PIL`) - Image manipulation and conversion for OCR preprocessing

**Infrastructure & Database:**
- `sqlalchemy` (v2.x) - Python SQL toolkit and ORM (`backend/app/db/models.py`)
- `aiosqlite` - Asynchronous SQLite driver for FastAPI async route telemetry (`backend/app/db/database.py`)
- `python-dotenv` - Environment variable management (`backend/app/db/database.py`, `token_counter.py`, `llm_compressor.py`)
- `pydantic` - Data validation and request/response typing (`backend/app/models/schemas.py`)
- `python-multipart` - Multipart form parsing for file uploads (`backend/app/routers/compress.py`)

## Configuration

**Environment:**
- `backend/.env` (mirrors `backend/.env.example`):
  - `DATABASE_URL` - SQLite connection string (`sqlite+aiosqlite:///./nanoprompt.db`)
  - `PRICE_PER_MILLION_TOKENS` - Reference GPT-4o input cost (default: 2.50)
  - `GEMINI_API_KEY` - API key for Google Gemini
  - `GROQ_API_KEY` - API key for Groq Llama-3 failover
- `frontend/.env.local` (optional):
  - `NEXT_PUBLIC_API_URL` - Backend API base URL (defaults to `http://localhost:8000`)

**Build & Compiler Configurations:**
- `frontend/tsconfig.json` - TypeScript compiler options, path alias `@/*` mapping to `./src/*`
- `frontend/next.config.ts` - Next.js build parameters
- `frontend/postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `frontend/eslint.config.mjs` - ESLint configuration extending `next/core-web-vitals`
- `extension/manifest.json` - Chrome Extension Manifest V3 configuration

## Platform Requirements

**Development:**
- macOS, Linux, or Windows (tested on macOS Darwin)
- Python 3.10+
- Node.js 18+

**Production:**
- Backend: ASGI server (Uvicorn / Gunicorn) running in a container or Linux VM with CPU-optimized PyTorch
- Frontend: Vercel, Node.js server, or static export
- Extension: Chrome Web Store distribution or developer unpacked mode in Chromium browsers

---

*Stack analysis: 2026-10-08*
*Update after major dependency changes*
