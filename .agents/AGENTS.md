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
