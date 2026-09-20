# 🚀 NanoPrompt — Universal AI Token Optimizer

> **Hyper-compress your LLM prompts, isolate bugs surgically, and reduce your API costs by 40-70%.**

NanoPrompt is a production-grade hybrid compression engine that sits between you and any Large Language Model. By combining mathematical **AST program slicing** for code and **Semantic NLP pruning** for natural language, NanoPrompt locally strips away tokens that LLMs don't need, drastically reducing context bloat before you ever hit a cloud server.

---

## ⚡ Core Capabilities

- 🔍 **Auto Content Detection** — Automatically classifies input streams as Code, Text, JSON, or Stack Traces.
- 🔬 **The Surgeon Algorithm (AST Slicing)** — Input a stack trace and a broken script; the Surgeon engine mathematically extracts the specific variable dependency graph, ignoring hundreds of lines of irrelevant logic.
- 🌳 **Robust Code Minification** — Safely strips docstrings, comments, and whitespace across Python, TS, and JS using `ast` and `jsmin`.
- ✂️ **Semantic Text Pruning** — Utilizes `spaCy` NLP to strip conversational fluff, filler phrases, and redundant determiners locally.
- 🧪 **The Proof Engine** — Queries the original prompt and the compressed prompt against an LLM in parallel to mathematically prove semantic equivalence without quality loss, beautifully rendered in Markdown.
- 💰 **Global Odometer & Telemetry** — A centralized real-time dashboard powered by SQLite that tracks global `₹` savings and token evaporation across all client nodes.
- 🧩 **Native Chrome Extension** — Trigger NanoPrompt from anywhere on the web using `Cmd+Shift+K` or the right-click context menu, dumping the compressed payload straight to your clipboard.

---

## 🛠 Tech Stack

| Layer       | Technology                          | Role                                      |
|-------------|-------------------------------------|-------------------------------------------|
| **Frontend** | Next.js 16, React, TypeScript       | Core application and Telemetry Dashboard  |
| **UI/UX**    | TailwindCSS v4, Framer Motion       | "Editorial Haute Code" design philosophy  |
| **Backend**  | FastAPI (Python), Uvicorn           | High-throughput compression APIs          |
| **Database** | SQLAlchemy + SQLite                 | Persistent telemetry & Global Odometer    |
| **AI/NLP**   | `tiktoken`, `spaCy`, Python `ast`   | Offline text pruning and program slicing  |
| **Extension**| Chrome Manifest V3, Service Workers | Cross-origin bypassing & global shortcuts |

---

## 🏗 Architecture & Evolution (Phases 1-8)

NanoPrompt was built iteratively to solve the massive token-waste problem in modern AI development.

### Phase 1: The Core Engine
We established the dual-node architecture: a Next.js frontend communicating with a high-speed Python FastAPI backend. The backend uses `tiktoken` (cl100k_base) to calculate exact token counts and cost reductions. All compressions are asynchronously logged to a local SQLite database via SQLAlchemy.

### Phase 2: Chrome Extension Integration
We built a Manifest V3 Chrome Extension that allows users to access the compression engine anywhere. By utilizing background service workers, the extension bypasses CORS restrictions to query the local FastAPI server directly, copying the optimized prompt to the clipboard.

### Phase 3: "Editorial Haute Code" UI
The entire frontend was overhauled into a premium, hyper-modern aesthetic. We utilized Obsidian backgrounds (`#0a0c10`), Acid Green accents (`#ccff00`), sharp geometric hairlines, and smooth `framer-motion` micro-interactions.

### Phase 4: Local NLP Pipeline
We integrated `spaCy` into the backend for intelligent natural language compression. Instead of simple regex, the engine analyzes sentence structure to drop determiners and polite conversational filler that LLMs do not need, saving up to 30% on chat prompts.

### Phase 5: Code Minification Hardening
We replaced brittle regex code-stripping with robust AST parsers (`ast` for Python) and `jsmin` for JavaScript/TypeScript, ensuring logic and control flow are never compromised during compression.

### Phase 6: Proof Engine Polish
We integrated `react-markdown` and `remark-gfm` to elegantly render the LLM output in the Proof Engine. We also built strict rate-limit interceptors (`[RATE_LIMIT_EXCEEDED]`) to gracefully handle Gemini/OpenAI API throttling on free tiers.

### Phase 7: Global Gamification & INR Pricing
We localized the economics to Indian Rupees (`₹`). We built the massive real-time `GlobalOdometer` component that sits at the top of the dashboard, constantly polling the SQLite database to show the aggregate tokens and capital saved across all active nodes.

### Phase 8: The Surgeon Algorithm
We introduced advanced **Program Slicing**. By splitting the UI into "Stack Trace" and "Source Code", the backend `ASTSurgeon` parses terminal errors, locates the breaking line, and walks backwards through the syntax tree to extract *only* the variable definitions necessary to reproduce the bug.

### Phase 9: Deep Document Compression & Native LLMLingua
Integrated `microsoft/llmlingua-2-xlm-roberta-large-meetingbank` for deep neural NLP compression on raw text, running entirely locally on CPU. To handle complex documents (PDF/DOCX) without destroying technical claims, we bypassed the neural net and built an offline `spaCy` "Telegram-style" pruner that surgically strips filler while mathematically protecting negations, nouns, and verbs.

### Phase 10: Seamless Chrome In-Page Injection
The Chrome Extension was upgraded from a simple popup to a full content script injection. The NanoPrompt UI now injects seamlessly below the prompt box inside ChatGPT and Claude. We utilized `MutationObservers` to elegantly manage UI state (Undo/Compress) in complex React/ProseMirror environments, bypassing Manifest V3 ServiceWorker timeouts and keeping the workflow frictionless.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file and add your GEMINI_API_KEY for the Proof Engine
cp .env.example .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

### Frontend Setup

```bash
cd frontend
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📡 API Reference

### `POST /api/v1/compress`
Standard compression for code or text.
**Request:** `{ "content": "string", "type": "auto" }`

### `POST /api/v1/surgeon`
AST dependency extraction.
**Request:** `{ "code": "full script", "trace": "terminal stack trace" }`
**Response:** `{ "sliced_code": "extracted dependencies", "target_line": 42 }`

### `POST /api/v1/verify`
Runs the Proof Engine against the Gemini API.

### `GET /api/v1/stats`
Retrieves aggregate telemetry for the Global Odometer.

---

## 📄 License

MIT
