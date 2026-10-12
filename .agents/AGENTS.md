### Python FastAPI Concurrency & Event Loop Blocking

When writing or modifying FastAPI route handlers (`@app.get`, `@app.post`, etc.):

1. **Synchronous Fallback:** If a route handler needs to call synchronous blocking code (e.g., standard `requests.get`, synchronous database drivers, heavy CPU-bound tasks, or synchronous third-party SDKs like `google-genai`), you **MUST** define the route handler as a standard synchronous function (`def`), NOT as `async def`.
   - *Why:* Defining it as `def` tells FastAPI to execute the route in an external threadpool, preventing the main asyncio event loop from freezing.
2. **Async Consistency:** You may only use `async def` for route handlers if every single IO-bound operation inside the handler is properly awaited using native async libraries (e.g., `httpx.AsyncClient`, `asyncpg`, `motor`).
3. **Avoid the Silent Hang:** Never assume a route should be `async def` by default. Mixing blocking code in an `async def` route will silently hang the server under load without throwing a Python exception.

### NanoPrompt V2 Architectural Constraints

1. **Offline-First Processing**: The core analysis, compression engines, token attention heatmaps, and predictive routing logic MUST operate offline using local NLP models (e.g., SpaCy, `sentence-transformers`, `llmlingua`).
2. **API Usage Restriction**: Cloud LLM APIs (like Gemini, OpenAI, or Groq) are strictly reserved ONLY for final output generation and the Quantitative Proof Engine verification step. Never use a cloud API for text pre-processing, summarization, or feature extraction.
3. **Quantitative over Qualitative**: Verification of semantic matching must use mathematical approaches (e.g., Cosine Similarity of local embeddings) rather than qualitative LLM prompt checking.

### SQLite Configuration for FastAPI

1. **Absolute Path Anchoring**: Never use relative paths like `sqlite:///./nanoprompt.db`. This creates fragmented database files depending on the user's CWD. Always use absolute paths anchored to the project root using `Path(__file__).resolve()`.
2. **Single Engine Strategy**: Do not instantiate both an async engine (`aiosqlite`) and a sync engine (`sqlite3`) pointing to the same SQLite file simultaneously. Standardize on a single database connection strategy across all endpoints to avoid `sqlite3.OperationalError: database is locked`.

### Google Cloud / Gemini API Model Usage

When generating code or configuration that interfaces with the Google Gemini API (via `google-genai` or Vertex):
1. **Model Deprecation**: Do NOT use `gemini-1.5-flash` or `gemini-2.5-flash`. These models have been decommissioned for new users and will throw a 404 error, breaking fallback chains.
2. **Standard Model**: ALWAYS default to `gemini-3.8-flash` for general reasoning and fast inference tasks.
3. **API Key Formats**: Do NOT assume Gemini API keys only begin with `AIza...`. Newer Google AI Studio and Vertex API keys also begin with `AQ.` (or other prefixes). Never invalidate, reject, or flag a user's API key solely based on prefix matching.
4. **Capacity Fallbacks**: If `gemini-3.8-flash` encounters transient `503 UNAVAILABLE` capacity limits on free tiers, ensure fallback chains query lighter tiers (such as `gemini-flash-lite-latest`) before raising errors.

### Uvicorn Environment Variable Reloading

When instructing a user to modify `.env` files for a FastAPI application running via `uvicorn --reload`, you MUST explicitly tell them to kill and restart the server manually in their terminal. `uvicorn --reload` does NOT automatically pick up changes to `.env` files.

### Extension Ghost Overlay Token Highlighting

1. **Selective Highlighting Only**: Only highlight tokens that the AI considers important (key semantic action verbs, domain nouns, technical terms, specific constraints) with subtle green (`rgba(34, 197, 94, 0.28)` and underline).
2. **Never Highlight Non-Essential Tokens**: Conversational filler, stop words, pronouns, and syntactic glue MUST remain completely unhighlighted (clean, transparent text). Never paint non-essential words in red, rose, or amber blocks, as this creates a distracting and overwhelming overlay.
3. **Zero Padding Drift**: Spans in `.nanoprompt-ghost-overlay` must maintain `padding: 0; margin: 0;` to avoid cumulative horizontal drift that misaligns words over multi-line prompt boxes.

### NLP Pruning Whitespace & Punctuation Invariants

1. **Whitespace Inheritance**: When stripping determiners, stop words, or filler tokens in SpaCy or regex pipelines, always preserve `token.whitespace_` on adjacent retained tokens. Never concatenate tokens across deleted boundaries.
2. **Punctuation Normalization**: Always pass pruned text through punctuation collapsing to resolve duplicate or conflicting marks (e.g., `.!` -> `.`, `..` -> `.`).
3. **Post-Punctuation Spacing**: Ensure that any sentence-ending or clause punctuation immediately preceding alphanumeric characters is separated by a single space (`([,\.!\?:;])([A-Za-z0-9])` -> `\1 \2`).

