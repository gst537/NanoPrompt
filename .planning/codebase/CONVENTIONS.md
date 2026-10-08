# Coding Conventions

**Analysis Date:** 2026-10-08

## Naming Patterns

**Files:**
- Python modules: `snake_case.py` (e.g., `text_compressor.py`, `token_counter.py`, `file_extractor.py`).
- React components: `PascalCase.tsx` (e.g., `CompressorPane.tsx`, `ProofPane.tsx`, `GlobalOdometer.tsx`).
- React contexts & hooks: `PascalCase.tsx` or `camelCase.ts` (e.g., `SettingsContext.tsx`).
- API & utility modules: `camelCase.ts` (e.g., `api.ts`).
- Extension scripts: `camelCase.js` or `kebab-case.js` (e.g., `background.js`, `content.js`, `ui.js`).

**Functions & Methods:**
- Python: `snake_case` (e.g., `detect_content_type`, `apply_regex_pruning`, `calculate_savings_usd`, `extract_error_slice`).
- TypeScript / JavaScript: `camelCase` (e.g., `compressContent`, `verifyCompression`, `runSurgeon`, `getBarColor`).
- Event handlers: Prefix with `handle` in React (e.g., `handleCompress`, `handleProof`, `handleHeatmap`), prefix with `on` for callback props (`onCompressClick`, `onUndoClick`).

**Variables & Constants:**
- Variables: `snake_case` in Python, `camelCase` in TypeScript/JavaScript.
- Constants / Globals: `UPPER_SNAKE_CASE` (e.g., `PRICE_PER_MILLION_TOKENS`, `ABBREVIATIONS`, `FILLER_PHRASES`, `HAS_LLMLINGUA`, `HAS_SPACY`, `API_BASE`).

**Types & Schemas:**
- Pydantic models: `PascalCase` inheriting from `BaseModel` (e.g., `CompressRequest`, `CompressResponse`, `CompressionStats`, `SurgeonResponse`).
- TypeScript interfaces & types: `PascalCase` (e.g., `CompressionStats`, `CompressResponse`, `VerifyResponse`, `AggregateStats`, `FeatureToggles`).

## Code Style & Formatting

**Python:**
- Style follows PEP 8 standards with 4-space indentation.
- Type hints used in function signatures (`def compress_text(content: str) -> str`, `def run_ablation_test(content: str) -> list[dict]`).
- Module docstrings and function docstrings with brief explanations of inputs, outputs, and intent.

**TypeScript / React:**
- Next.js 16 / React 19 standards.
- 2-space indentation.
- Component structure: `"use client"` directive on all interactive client-side components.
- Tailwind CSS v4 styling with semantic theme variables (`obsidianBg`, `acid`, `surfaceCard`, `surfaceBorder`, `codeBg`, `codeBorder`).
- Bespoke micro-styling utility classes like `.hairline-b`, `.hairline-t` for border hairlines.

## Concurrency & Event Loop Rules (FastAPI)

As enforced in `.agents/AGENTS.md`:

1. **Synchronous Fallback (`def`):**
   - If an endpoint executes synchronous blocking operations (e.g., CPU-bound NLP processing with SpaCy, AST parsing, Torch inference, synchronous DB operations, or synchronous SDK calls like `google-genai` / `groq`), the route handler **MUST** be defined as a standard synchronous function (`def`), **NOT** as `async def`.
   - *Rationale:* Defining as `def` instructs FastAPI to dispatch the handler to an external threadpool, preventing the primary asyncio event loop from hanging.
   - Examples: `def compress(...)`, `def compress_file(...)`, `def verify_compression(...)`, `def ablation_endpoint(...)`, `def surgeon_endpoint(...)`.

2. **Async Consistency (`async def`):**
   - Route handlers **MUST ONLY** use `async def` when all I/O inside is natively non-blocking and properly awaited (e.g., `await db.execute(...)` with `AsyncSession`).
   - Examples: `async def get_stats(...)`, `async def get_history(...)`, `async def root(...)`.

3. **Avoid the Silent Hang:**
   - Never mix blocking code into an `async def` route.

## Defensive Model Loading Pattern

In Python backend services, third-party ML and NLP packages (`llmlingua`, `spacy`, `sentence_transformers`) may be absent, unsupported on certain hardware, or fail during model downloads. A strict defensive loading pattern is used:

```python
try:
    from llmlingua import PromptCompressor
    llm_compressor = PromptCompressor(...)
    HAS_LLMLINGUA = True
except ImportError:
    HAS_LLMLINGUA = False
except Exception as e:
    HAS_LLMLINGUA = False
    print(f"Failed to load LLMLingua: {e}")
```

Every service provides a deterministic, zero-network fallback:
- If `llmlingua` fails: Fall back to `spaCy` + regex abbreviations.
- If `spacy` fails: Fall back to pure regex pruning.
- If cloud APIs (`gemini`, `groq`) fail: Fall back to local regex compressor.

## Import Organization

**Python:**
1. Standard library imports (`os`, `re`, `json`, `ast`, `uuid`, `io`, `typing`)
2. Third-party packages (`fastapi`, `sqlalchemy`, `pydantic`, `tiktoken`, `spacy`, `google.genai`, `groq`)
3. Internal application modules (`from app.db.database import ...`, `from app.services.router import ...`)

**TypeScript:**
1. React & framework imports (`import { useState, useEffect } from "react"`, `import Link from "next/link"`)
2. Third-party UI & animation libraries (`import { motion } from "framer-motion"`, `import ReactMarkdown from "react-markdown"`)
3. Local components (`import Navbar from "@/components/Navbar"`)
4. Local libraries, types, and contexts (`import { compressContent } from "@/lib/api"`)

## Error Handling

**Backend Strategy:**
- Input validation: Return standard FastAPI `HTTPException(status_code=400, detail="...")` for empty or malformed inputs.
- External API calls: Wrap in `try...except Exception as e:` and fall back gracefully to the next cascading provider (e.g., Gemini -> Groq -> Local).
- AST parsing: Catch `SyntaxError` when parsing code; fall back to generic non-Python minification (`jsmin`).

**Frontend Strategy:**
- Async operations wrapped in `try...catch (err: any)`.
- Set user-friendly error banners in state (`setError(err.message)`).
- Clear error states on retry or new operation.

## Logging

- Backend: Informational logging to stdout via standard Python `print()` statements tagged with `NanoPrompt:` prefix (e.g., `print("NanoPrompt: Successfully routed through Groq Llama 3.")`).
- Analytics: Database persistence in `compression_logs` on all successful compressions.
- Frontend: `console.error` for caught API errors.

---

*Convention analysis: 2026-10-08*
*Update when patterns change*
