# External Integrations

**Analysis Date:** 2026-10-08

## APIs & External Services

**Google Gemini API:**
- Provider: Google (`google-genai` Python SDK)
- Model: `gemini-3.6-flash`
- Auth: `GEMINI_API_KEY` environment variable in `backend/.env`
- Uses:
  - **Proof Engine:** Executes prompts through Gemini Flash to verify output parity between original and compressed variants (`backend/app/services/llm_compressor.py`).
  - **Document Vision OCR:** Extracts tabular and textual data from diagrams embedded within uploaded PDF documents (`backend/app/services/file_extractor.py`).
  - **Semantic Compression Fallback:** Optional cloud-assisted prompt compression when local NLP pipelines need supplementary summarization.

**Groq Cloud API:**
- Provider: Groq (`groq` Python SDK)
- Model: `llama3-8b-8192`
- Auth: `GROQ_API_KEY` environment variable in `backend/.env`
- Uses:
  - **High-Availability Fallback:** Intercepts rate limits (429) or service outages (503) from Gemini, rerouting verification and compression requests to Groq without UI interruption (`backend/app/services/llm_compressor.py`).

## Data Storage

**Databases:**
- SQLite (Local File Database)
  - Location: `backend/nanoprompt.db`
  - Connection Strings:
    - Async: `sqlite+aiosqlite:///./nanoprompt.db` via `backend/app/db/database.py`
    - Sync: `sqlite:///./nanoprompt.db` via `backend/app/db/database.py`
  - Client / ORM: SQLAlchemy v2 (`backend/app/db/models.py`)
  - Schema / Tables:
    - `compression_logs`: Stores record ID, input type (`code`, `text`, `json`, `file`), original token count, compressed token count, compression ratio, savings calculated, and timestamp.
  - Initialization: Automatic table creation via `init_db()` during FastAPI startup lifespan (`backend/app/main.py`).

**Local & Browser State Storage:**
- `chrome.storage.sync` (Chrome Extension):
  - Stores configured API endpoint URL (`apiUrl`, defaulting to `http://localhost:8000/api/v1/compress`).
- `localStorage` (Next.js Web UI):
  - Key: `nanoprompt_features`
  - Stores toggle states for feature flags (`enableAblation`, `enableFileMode`, `enableDebugMode`, `enableDashboard`) managed in `frontend/src/lib/SettingsContext.tsx`.

## Authentication & Identity

**Auth Provider:**
- None: Currently runs as an open single-tenant local optimization tool and self-hosted API. No API tokens or user session authentication are enforced on the FastAPI router.

## Monitoring & Observability

**Telemetry & Metrics:**
- In-Database Telemetry:
  - `GET /api/v1/stats`: Aggregates total compression operations, tokens saved, average compression ratio, and total monetary savings across all clients (`backend/app/routers/compress.py`).
  - `GET /api/v1/history`: Returns paginated records of recent compression operations for the UI telemetry dashboard.
- Real-time Polling:
  - `frontend/src/components/GlobalOdometer.tsx`: Polls `/api/v1/stats` on a 10-second interval to update global savings metrics live.

**Logs:**
- Standard output (`stdout`/`stderr`) handled by Uvicorn and FastAPI.
- Console error reporting in Chrome Extension background scripts and React error handlers.

## Client-to-Backend Integrations

**Frontend to Backend:**
- Base URL: Configured via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- Endpoints consumed by `frontend/src/lib/api.ts`:
  - `POST /api/v1/compress` - General text, code, and JSON compression
  - `POST /api/v1/compress/file` - Multipart PDF/DOCX upload and extraction
  - `POST /api/v1/verify` - LLM Proof Engine semantic equivalence verification
  - `POST /api/v1/surgeon` - AST program slicing for error traces
  - `POST /api/v1/ablation` - Multi-pipeline ablation comparison
  - `POST /api/v1/heatmap` - Token importance attention weights
  - `POST /api/v1/analyze_complexity` - Syntactic density model recommendation
  - `GET /api/v1/stats` - Odometer and aggregate stats
  - `GET /api/v1/history` - Historical compression log table

**Chrome Extension to Host Web Apps:**
- Manifest Permissions: `activeTab`, `scripting`, `storage`, `contextMenus`, `clipboardWrite`
- Target Injected Hosts:
  - `https://chatgpt.com/*` - Injects compression trigger below `#prompt-textarea`
  - `https://claude.ai/*` - Injects compression trigger below `div[contenteditable="true"].ProseMirror`
- Text Insertion Mechanism:
  - Uses `document.execCommand('insertText')` to dispatch synthetic input events that cleanly update React and ProseMirror internal state trees without UI corruption.

## Environment Configuration

**Development:**
- Required backend env vars:
  - `GEMINI_API_KEY` (required for Proof Engine and vision OCR)
  - `GROQ_API_KEY` (recommended for fallback failover)
  - `DATABASE_URL` (defaults to local SQLite)
  - `PRICE_PER_MILLION_TOKENS` (defaults to 2.50)
- Secrets location: `backend/.env` (gitignored)

**Production:**
- Secrets management: Environment variables passed via Docker runtime or hosting platform configuration.

## Webhooks & Callbacks

- Incoming: None
- Outgoing: None (direct synchronous HTTP request-response pattern)

---

*Integration audit: 2026-10-08*
*Update when adding/removing external services*
