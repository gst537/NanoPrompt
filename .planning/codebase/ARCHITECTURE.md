# Architecture

**Analysis Date:** 2026-10-08

## Pattern Overview

**Overall:** Distributed Multi-Node Local Architecture (Local FastAPI Engine + Next.js App Router UI + Manifest V3 Chrome Extension)

**Key Characteristics:**
- **Offline-First Processing:** The core analysis, AST parsing, token attention heatmaps, and NLP compression operate locally using local Python libraries (`tiktoken`, `spaCy`, `llmlingua`, `ast`) without requiring external network calls.
- **Selective API Usage:** Cloud LLM APIs (Gemini, Groq) are strictly reserved for final output verification (Proof Engine) and visual OCR extraction, never for internal pre-processing or feature extraction.
- **Quantitative Proof Verification:** Semantic matching between original and compressed prompts is measured mathematically via local cosine similarity of sentence embeddings (`all-MiniLM-L6-v2`) rather than qualitative LLM evaluation.
- **FastAPI Concurrency Discipline:** Route handlers invoking synchronous CPU-intensive ML inference or blocking SDKs are defined as standard synchronous functions (`def`) so FastAPI runs them on external threadpools, preserving event loop responsiveness.

## Layers

**1. API Gateway & Router Layer (`backend/app/routers/compress.py`, `backend/app/main.py`):**
- Purpose: HTTP request parsing, input validation, content dispatch, and response formatting.
- Contains: Endpoint definitions (`/compress`, `/compress/file`, `/verify`, `/surgeon`, `/ablation`, `/heatmap`, `/analyze_complexity`, `/stats`, `/history`).
- Depends on: Service layer for business logic, Database layer for session injection.
- Used by: Next.js frontend and Chrome Extension background worker.

**2. Service & Engine Layer (`backend/app/services/`):**
- Purpose: Core compression algorithms, AST manipulations, NLP pipelines, and token calculations.
- Contains:
  - `router.py`: Automatic heuristic content-type detection (`code`, `json`, `text`).
  - `code_compressor.py`: AST-based Python code cleaner (removes docstrings and blank lines) and `jsmin` fallback for JS/TS.
  - `surgeon.py`: Program Slicing engine using AST visitors to isolate bug-reproducing variable dependencies from stack traces.
  - `text_compressor.py`: Multi-stage pipeline: Regex filler pruning -> SpaCy POS syntactic filtering -> LLMLingua neural compression -> technical abbreviations. Also provides safe document pruner and attention heatmap generator.
  - `similarity.py`: SentenceTransformer embedding engine computing cosine similarity.
  - `complexity.py`: Syntactic density analyzer recommending model complexity tier.
  - `token_counter.py`: Tiktoken BPE token counter (`cl100k_base`) and financial savings calculator.
  - `file_extractor.py`: PDF/DOCX text block extractor and Gemini Vision OCR handler for embedded diagrams.
  - `llm_compressor.py`: High-availability cascading LLM client (Gemini Flash -> Groq Llama-3 failover).
- Depends on: Local NLP models, Python standard library `ast`, SQLAlchemy models, external LLM SDKs.
- Used by: API Router layer.

**3. Data Persistence Layer (`backend/app/db/`):**
- Purpose: Relational storage of compression metrics for analytics and telemetry.
- Contains:
  - `database.py`: Dual async (`AsyncSession` via `aiosqlite`) and sync (`Session` via SQLite) session engines.
  - `models.py`: `CompressionLog` ORM model.
- Depends on: SQLite database file `backend/nanoprompt.db`.
- Used by: API Router endpoints.

**4. Frontend Presentation Layer (`frontend/src/app/`, `frontend/src/components/`):**
- Purpose: User interface for prompt optimization, comparative testing, and telemetry.
- Contains:
  - Pages: Main Playground (`src/app/page.tsx`), Telemetry Dashboard (`src/app/dashboard/page.tsx`), Ablation Studio (`src/app/ablation/page.tsx`).
  - Components: `CompressorPane.tsx`, `ProofPane.tsx`, `GlobalOdometer.tsx`, `StatsCard.tsx`, `Navbar.tsx`, `SettingsModal.tsx`.
  - Client Services: `src/lib/api.ts` (API fetch wrappers), `src/lib/SettingsContext.tsx` (feature toggle state).
- Depends on: FastAPI backend API.
- Used by: End users in web browsers.

**5. Browser Extension Client (`extension/`):**
- Purpose: Frictionless prompt compression injected directly into browser chat interfaces.
- Contains:
  - `background.js`: Service worker managing cross-origin API calls, context menus, and keyboard shortcuts (`Cmd+Shift+K`, `Cmd+Shift+X`).
  - `content.js`: DOM observer injecting the NanoPrompt control row into ChatGPT and Claude prompt inputs.
  - `ui.js`: DOM generation for button, heatmap, and toast notification elements.
  - `popup.js`: Extension toolbar settings and scratchpad.

## Data Flow

### 1. Natural Language Prompt Compression Flow
1. User enters text in UI or ChatGPT prompt box.
2. Content Router (`backend/app/services/router.py`) identifies type (`text`).
3. Regex Pruner (`apply_regex_pruning` in `text_compressor.py`) strips conversational greetings and polite filler.
4. SpaCy Pruner (`apply_spacy_pruning`) parses POS tags and drops non-essential determiners (`DET`) and punctuation.
5. Neural Compressor (`llmlingua-2` model) performs semantic token pruning at a 0.7 retention rate on CPU.
6. Technical Abbreviation Dictionary applies token substitutions (e.g., `function` -> `fn`, `parameters` -> `params`).
7. Token Counter (`token_counter.py`) counts original and compressed tokens using `tiktoken` (`cl100k_base`).
8. Compression Log is written to SQLite (`compression_logs` table).
9. Compressed prompt and savings telemetry returned to client.

### 2. AST Surgeon (Program Slicing) Flow
1. User supplies full source code and a terminal stack trace.
2. Trace Parser (`parse_stack_trace` in `surgeon.py`) extracts the failing line number.
3. `DependencyVisitor` traverses the Python AST to find all variable names read on the target line.
4. `DefinitionVisitor` walks backward through the AST to find assignments and function arguments defining those variables.
5. Code slice is constructed including only definition lines and the target line with context.
6. Result is returned as annotated code lines (`L{n}: {code}`).

### 3. Proof Engine Verification Flow
1. Client submits both original prompt and compressed prompt.
2. Primary LLM (`gemini-3.6-flash`) generates completions for both prompts concurrently.
3. If Gemini fails with rate limits or errors, Groq (`llama3-8b-8192`) completes the failover run.
4. Outputs are passed to `calculate_similarity` in `backend/app/services/similarity.py`.
5. Local `SentenceTransformer` (`all-MiniLM-L6-v2`) computes vector embeddings on CPU.
6. Cosine similarity score determines whether equivalence threshold (>= 90%) is achieved.
7. Both outputs, similarity score, and equivalence flag are returned to client.

## Key Abstractions

**AST Visitors (`DependencyVisitor`, `DefinitionVisitor` in `backend/app/services/surgeon.py`):**
- Purpose: Abstract syntax tree traversal for variable dependency extraction.
- Pattern: Visitor pattern implementing Python's standard `ast.NodeVisitor`.

**Dual Session Management (`backend/app/db/database.py`):**
- Purpose: Supplies `AsyncSession` for non-blocking telemetry endpoints and `Session` for synchronous routes.
- Pattern: Dependency Injection via FastAPI `Depends(get_db)` and `Depends(get_sync_db)`.

**Cascading Failover Client (`backend/app/services/llm_compressor.py`):**
- Purpose: Resilient LLM routing across multiple cloud providers.
- Pattern: Chain of Responsibility / Circuit Fallback (Gemini Flash -> Groq Llama-3 -> Local Fallback).

**Feature Flag Context (`frontend/src/lib/SettingsContext.tsx`):**
- Purpose: Local client-side feature toggling persisted to `localStorage`.
- Pattern: React Context & Provider pattern.

## Entry Points

**Backend Service:**
- Location: `backend/app/main.py`
- Invocation: `uvicorn app.main:app --reload --port 8000`
- Responsibilities: DB table initialization via async lifespan, CORS middleware registration, router mounting.

**Frontend Web Application:**
- Location: `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`
- Invocation: `npm run dev`
- Responsibilities: Client initialization, font loading, dark theme provider, layout rendering.

**Chrome Extension:**
- Location: `extension/manifest.json`, `extension/background.js`, `extension/content.js`
- Invocation: Extension loading in browser, URL navigation to ChatGPT/Claude, or keyboard shortcut triggers.

## Error Handling

**Strategy:**
- Backend routes catch missing inputs and return standard HTTP status codes (`HTTPException(status_code=400, detail=...)`).
- Cloud LLM API exceptions are caught locally within `llm_compressor.py` to allow silent failover to Groq or deterministic regex fallbacks.
- Optional ML libraries (`llmlingua`, `spacy`, `sentence_transformers`) use defensive import guards with module-level booleans (`HAS_LLMLINGUA`, `HAS_SPACY`, `HAS_SENTENCE_TRANSFORMERS`), falling back to heuristic or regex implementations when models or packages are absent.

## Cross-Cutting Concerns

**Logging:**
- Compression events are persisted to SQLite table `compression_logs` on every `/compress` and `/compress/file` execution.
- Operational messages output to Uvicorn stdout.

**Concurrency & Thread Safety:**
- CPU-heavy ML operations (AST parsing, SpaCy tokenization, Torch inference) are kept in standard synchronous `def` routes to allow execution in threadpools without blocking FastAPI's asyncio event loop.

---

*Architecture analysis: 2026-10-08*
*Update when major patterns change*
