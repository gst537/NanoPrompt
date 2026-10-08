# Codebase Concerns

**Analysis Date:** 2026-10-08

## Tech Debt

**Currency and Unit Inconsistency in Savings Calculations:**
- Issue: `backend/app/services/token_counter.py` defines `calculate_savings_usd`, the database column in `backend/app/db/models.py` is named `savings_usd`, but the function multiplies by `83.5` to calculate Indian Rupees (INR `₹`). Frontend comments explicitly note `// Contains INR actually` in `frontend/src/components/GlobalOdometer.tsx`.
- Files: `backend/app/services/token_counter.py` (lines 26-38), `backend/app/db/models.py` (line 21), `frontend/src/components/GlobalOdometer.tsx` (line 8).
- Impact: Confusing naming across backend and frontend models. Risk of currency display bugs if USD pricing is reintroduced or converted elsewhere.
- Fix approach: Rename field and column to `savings_inr` (or preserve both `savings_usd` and `savings_inr` explicitly with clear conversion utility).

**Hardcoded Localhost URLs in Frontend Components:**
- Issue: Several frontend components bypass `process.env.NEXT_PUBLIC_API_URL` and `src/lib/api.ts` to call hardcoded `http://localhost:8000`.
- Files:
  - `frontend/src/app/ablation/page.tsx` (line 29: `fetch("http://localhost:8000/api/v1/ablation", ...)`)
  - `frontend/src/components/GlobalOdometer.tsx` (line 16: `fetch("http://localhost:8000/api/v1/stats")`)
- Impact: Breaks deployment in staging, Docker, or remote hosting environments where the backend is not on `localhost:8000`.
- Fix approach: Refactor all fetch calls to use methods from `frontend/src/lib/api.ts` utilizing `NEXT_PUBLIC_API_URL`.

**Generic Non-Python Minification Using `jsmin`:**
- Issue: In `backend/app/services/code_compressor.py`, when Python AST parsing fails (lines 88-97), the fallback code compressor invokes `jsmin` regardless of whether the input is TypeScript, C++, Java, or Go.
- Files: `backend/app/services/code_compressor.py`
- Impact: `jsmin` is designed strictly for JavaScript. Code with non-standard syntax or raw strings may get corrupted or throw exceptions, falling back to a simplistic line-strip.
- Fix approach: Introduce language-specific parsers or dedicated multi-language tree-sitter bindings for robust cross-language minification.

## Known Bugs & Edge Cases

**Extension Content Script State Loss on Single-Page App (SPA) Navigation:**
- Symptoms: The injected NanoPrompt button row disappears or becomes unresponsive when navigating between chats in ChatGPT or Claude.
- Trigger: React/ProseMirror DOM re-renders destroying the textarea parent nodes where NanoPrompt was attached.
- Files: `extension/content.js` (lines 52-65), `extension/ui.js`
- Workaround: Refreshing the ChatGPT or Claude tab reinstantiates the content script and re-injects the UI.
- Root cause: Dynamic DOM mutations in third-party SPAs teardown injected DOM elements without triggering extension re-injection.
- Fix: Implement a robust `MutationObserver` watching for prompt box re-creation.

## Security Considerations

**API Key Exposure Risk in Backend Environment:**
- Risk: `GEMINI_API_KEY` and `GROQ_API_KEY` stored in plaintext `.env`.
- Files: `backend/.env`, `backend/app/services/llm_compressor.py`
- Current mitigation: `backend/.env` is listed in `.gitignore`.
- Recommendations: Ensure `.env` is never accidentally committed; adopt secret managers for deployed production instances.

**Permissive CORS Origins:**
- Risk: `backend/app/main.py` configures `allow_origins` including `"*"`.
- Files: `backend/app/main.py` (lines 34-45)
- Current mitigation: Development setup convenience.
- Recommendations: In production environments, restrict `allow_origins` strictly to trusted client domains and specific extension IDs.

**Unconstrained File Upload Processing:**
- Risk: `POST /api/v1/compress/file` reads entire uploaded files into memory via `file.file.read()` without maximum file size constraints or virus scanning.
- Files: `backend/app/routers/compress.py` (line 112)
- Current mitigation: None (assumes trusted local developer usage).
- Recommendations: Add file size limits (e.g. 10MB) and streaming chunk processing.

## Performance Bottlenecks

**Sequential Vision OCR Calls on PDF Image Extraction:**
- Problem: PDFs with multiple diagrams execute Gemini Vision OCR sequentially in a synchronous blocking loop (`backend/app/services/file_extractor.py`, lines 48-60).
- Measurement: 2-5 seconds per embedded image depending on Gemini API latency.
- Cause: Iterating through `pixmap` images and awaiting synchronous `client.models.generate_content` calls one at a time.
- Improvement path: Parallelize OCR calls using `asyncio.gather` or a worker pool, or allow users to toggle OCR off for text-only extractions.

**CPU Model Loading and Inference Latency:**
- Problem: First request invoking `PromptCompressor` (LLMLingua-2 XLM-RoBERTa) or `SentenceTransformer` loads heavy neural weights into CPU memory, introducing several seconds of cold-start latency.
- Files: `backend/app/services/text_compressor.py`, `backend/app/services/similarity.py`
- Cause: Large model weights (`~1.5GB`) executed on CPU.
- Improvement path: Warm up models on server startup or provide quantized ONNX runtime variants.

## Fragile Areas

**Third-Party DOM Selectors in Chrome Extension:**
- File: `extension/content.js` (lines 4-11)
- Why fragile: Directly targets `#prompt-textarea` (ChatGPT) and `div[contenteditable="true"].ProseMirror` (Claude).
- Common failures: Any DOM update or class/id rename by OpenAI or Anthropic instantly breaks prompt detection.
- Safe modification: Add fallback selector arrays and configurable DOM selector overrides.

**Regex-Based Abbreviation Collisions:**
- File: `backend/app/services/text_compressor.py` (lines 35-64)
- Why fragile: Word boundaries (`\bfunction\b` -> `fn`) can alter semantics in technical prose where exact terminology matters (e.g., explaining the difference between a mathematical function and a programming function).
- Safe modification: Ensure abbreviations are only applied when code context allows, or provide an "aggressive abbreviations" toggle.

## Scaling Limits

**SQLite Single-File Storage:**
- Current capacity: Suitable for local single-developer workflows.
- Limit: Concurrency write locks during high-throughput multi-user benchmark runs.
- Symptoms at limit: `sqlite3.OperationalError: database is locked`.
- Scaling path: Configure PostgreSQL connection via `DATABASE_URL` if multi-tenant SaaS scaling is required.

## Test Coverage Gaps

**Zero Automated Unit or Integration Test Suite:**
- What's not tested: No automated test suite (pytest/vitest) validating router status codes, compression ratio accuracy, AST slicing correctness, or regression prevention.
- Risk: Breaking changes in compression algorithms or API responses could pass unnoticed until manual testing.
- Priority: High
- Fix: Implement pytest suite covering all `/api/v1` endpoints with mocked LLM responses.

---

*Concerns audit: 2026-10-08*
*Update as issues are fixed or new ones discovered*
