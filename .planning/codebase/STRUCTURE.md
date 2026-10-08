# Codebase Structure

**Analysis Date:** 2026-10-08

## Directory Layout

```
nanoprompt/
├── .agents/                 # AI pair programming guidelines and architectural constraints
├── backend/                 # Python FastAPI backend service and ML pipelines
│   ├── app/                 # Application source package
│   │   ├── db/              # Database engine, session helpers, and ORM models
│   │   ├── models/          # Pydantic schemas for requests and responses
│   │   ├── routers/         # FastAPI route handlers
│   │   └── services/        # Core compression algorithms, AST surgeon, NLP engines
│   ├── ablation_test.py     # Standalone CLI tool for ablation testing
│   ├── test_v2.py           # Verification script for local NLP and similarity
│   ├── test_llm*.py         # Exploratory test harnesses for LLMLingua
│   └── requirements.txt     # Python backend dependencies
├── frontend/                # Next.js 16 web application
│   ├── public/              # Static SVG icons and assets
│   ├── src/                 # Application source
│   │   ├── app/             # App Router pages (Home, Dashboard, Ablation)
│   │   ├── components/      # Reusable React UI components
│   │   └── lib/             # API client, TypeScript types, and context providers
│   ├── package.json         # Node.js dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   └── next.config.ts       # Next.js configuration
├── extension/               # Chrome Extension (Manifest V3)
│   ├── background.js        # Background service worker
│   ├── content.js           # DOM content script for ChatGPT/Claude injection
│   ├── ui.js                # DOM component generator for injected controls
│   ├── popup.html           # Extension settings and scratchpad UI
│   ├── popup.js             # Extension popup controller
│   ├── styles.css           # Styling for injected controls
│   └── manifest.json        # Chrome Manifest V3 descriptor
├── PITCH.md                 # Product pitch, problem statement, and benchmarks
├── README.md                # Main project documentation and quickstart
└── presentation_structure.md # Presentation outline and deck architecture
```

## Directory Purposes

**backend/app/routers/**:
- Purpose: HTTP endpoint routing and request handling.
- Contains: `compress.py` defining API endpoints under `/api/v1`.
- Key files: `compress.py` (handles `/compress`, `/surgeon`, `/verify`, `/stats`, etc.).

**backend/app/services/**:
- Purpose: Pure business logic, NLP compression pipelines, AST operations, and LLM integrations.
- Contains: Python modules implementing modular token reduction strategies.
- Key files:
  - `code_compressor.py` - AST Python minification and JS fallback.
  - `text_compressor.py` - Multi-tier text pipeline (Regex, SpaCy, LLMLingua, abbreviations).
  - `surgeon.py` - AST program slicing for error isolation.
  - `llm_compressor.py` - Cascaded Gemini and Groq API calls.
  - `similarity.py` - Local SentenceTransformer cosine similarity engine.
  - `token_counter.py` - Tiktoken BPE calculations.
  - `file_extractor.py` - PDF/DOCX parsing and OCR.

**backend/app/db/**:
- Purpose: Database configuration and ORM models.
- Contains: Engine definitions, dual sync/async session factories, and database models.
- Key files: `database.py`, `models.py`.

**backend/app/models/**:
- Purpose: Data validation and API request/response typing.
- Contains: Pydantic v2 models.
- Key files: `schemas.py`.

**frontend/src/app/**:
- Purpose: Next.js App Router route hierarchy and pages.
- Contains:
  - `page.tsx` - Main compression playground and hero section.
  - `dashboard/page.tsx` - Telemetry dashboard with charts and historical logs.
  - `ablation/page.tsx` - Scientific ablation comparison studio.
  - `layout.tsx` - Root layout with fonts, metadata, and settings provider.
  - `globals.css` - Tailwind theme tokens and custom styling.

**frontend/src/components/**:
- Purpose: Reusable, animated UI components.
- Key files:
  - `CompressorPane.tsx` - Primary input/output interactive workspace.
  - `ProofPane.tsx` - Side-by-side LLM Proof Engine comparison.
  - `GlobalOdometer.tsx` - Live polling counter of tokens and money saved.
  - `StatsCard.tsx` - Metric display card.
  - `Navbar.tsx` - Global navigation header.
  - `SettingsModal.tsx` - Settings dialog.

**frontend/src/lib/**:
- Purpose: Shared client libraries, API clients, and context state.
- Key files:
  - `api.ts` - Fetch wrappers for all backend endpoints.
  - `SettingsContext.tsx` - Feature flag state manager backed by localStorage.

**extension/**:
- Purpose: Browser extension for direct in-browser prompt optimization.
- Key files:
  - `manifest.json` - Manifest V3 declaration.
  - `background.js` - Background service worker.
  - `content.js` - Injected DOM controller for ChatGPT and Claude.
  - `ui.js` - Injected DOM elements creation.
  - `popup.html` / `popup.js` - Toolbar scratchpad.

## Key File Locations

**Entry Points:**
- `backend/app/main.py`: FastAPI server initialization and middleware setup.
- `frontend/src/app/page.tsx`: Next.js frontend root page.
- `extension/background.js`: Chrome extension service worker entry.
- `extension/content.js`: Chrome extension content script entry.

**Configuration:**
- `backend/.env`: Local backend secrets and configuration (copied from `backend/.env.example`).
- `frontend/next.config.ts`: Next.js compiler settings.
- `frontend/tsconfig.json`: TypeScript configuration and path aliases (`@/*`).
- `frontend/postcss.config.mjs`: PostCSS configuration for Tailwind CSS v4.
- `extension/manifest.json`: Chrome extension permissions and content script patterns.

**Core Logic:**
- `backend/app/services/text_compressor.py`: Primary natural language pruning and ablation pipeline.
- `backend/app/services/surgeon.py`: Program slicing AST visitor implementation.
- `backend/app/services/llm_compressor.py`: Multi-API cascading failover logic.
- `frontend/src/lib/api.ts`: Centralized frontend HTTP client for backend endpoints.

**Testing & Diagnostics:**
- `backend/ablation_test.py`: Standalone CLI ablation tool.
- `backend/test_v2.py`: Offline NLP service verification script.

**Documentation:**
- `README.md`: Developer guide and project overview.
- `PITCH.md`: Benchmark data and design rationale.
- `.agents/AGENTS.md`: Agent coding rules and architectural invariants.

## Naming Conventions

**Files:**
- Python: `snake_case.py` for all modules (`text_compressor.py`, `token_counter.py`).
- TypeScript React: `PascalCase.tsx` for components (`CompressorPane.tsx`, `ProofPane.tsx`).
- TypeScript Utilities: `camelCase.ts` or `PascalCase.tsx` for contexts (`api.ts`, `SettingsContext.tsx`).
- JavaScript: `camelCase.js` or `kebab-case.js` (`background.js`, `content.js`, `ui.js`).
- Styles & HTML: `kebab-case` or lowercase (`globals.css`, `styles.css`, `popup.html`).

**Directories:**
- Lowercase / `kebab-case` (`backend/`, `frontend/`, `extension/`, `components/`, `services/`, `db/`).

**Special Patterns:**
- Next.js route conventions: `page.tsx`, `layout.tsx`.
- Schema models: `PascalCase` classes inheriting from `BaseModel` or `Base`.

## Where to Add New Code

**New Compression Pipeline or Algorithm:**
- Implementation: Add function/module in `backend/app/services/{new_engine}.py`.
- Integration: Import into `backend/app/routers/compress.py` and invoke from `compress()` or a new sub-route.
- Ablation: Add a step in `run_ablation_test()` in `backend/app/services/text_compressor.py`.
- Frontend wiring: Add response fields to `frontend/src/lib/api.ts` and UI in `frontend/src/components/CompressorPane.tsx`.

**New UI Page or Studio View:**
- Page: Create `frontend/src/app/{view-name}/page.tsx`.
- Navigation: Add route link in `frontend/src/components/Navbar.tsx`.
- Feature Flag: Add toggle in `frontend/src/lib/SettingsContext.tsx` if conditional.

**New API Endpoint:**
- Router: Add route in `backend/app/routers/compress.py`.
- Schema: Define request/response models in `backend/app/models/schemas.py`.
- Client wrapper: Add function in `frontend/src/lib/api.ts`.

**New Database Entity / Metric:**
- Model: Define SQLAlchemy model in `backend/app/db/models.py`.
- Migration/Init: `Base.metadata.create_all` in `backend/app/db/database.py` automatically initializes tables on startup.

## Special Directories

**backend/venv/**:
- Purpose: Python virtual environment containing installed packages.
- Committed: No (in `.gitignore`).

**frontend/node_modules/**:
- Purpose: Node.js dependency installations.
- Committed: No (in `.gitignore`).

**.planning/**:
- Purpose: GSD workflow planning, codebase maps, and phase state documents.
- Committed: Tracked for project reference.

---

*Structure analysis: 2026-10-08*
*Update when directory structure changes*
