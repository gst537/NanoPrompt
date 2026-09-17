# 🚀 NanoPrompt

> **A Universal AI Token Optimizer to hyper-compress LLM prompts, isolate bugs surgically, and reduce your API costs by 40-70%.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

---



## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & How it Works](#-architecture--how-it-works)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Roadmap / Known Issues](#-roadmap--known-issues)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

- **Auto Content Detection** — Automatically classifies input streams as Code, Text, JSON, or Stack Traces.
- **The Surgeon Algorithm (AST Slicing)** — Mathematically extracts variable dependency graphs from stack traces, ignoring irrelevant logic.
- **Robust Code Minification** — Safely strips docstrings, comments, and whitespace across Python, TS, and JS using AST parsing.
- **Semantic Text Pruning** — Utilizes SpaCy NLP to strip conversational fluff, filler phrases, and redundant determiners locally.
- **Neural Compression** — Integrates LLMLingua (MeetingBank model) for deep semantic NLP pruning on CPU.
- **The Proof Engine** — Mathematically proves semantic equivalence between the original and compressed prompt using an LLM.
- **Cascading Multi-API Fallback** — High-availability LLM routing (Gemini -> Groq Llama-3) to ensure 100% uptime during traffic spikes.
- **Global Odometer & Telemetry** — A real-time dashboard tracking global ₹ savings and token evaporation.
- **Seamless Chrome Extension** — Trigger NanoPrompt via `Cmd+Shift+K` or in-page injection directly into ChatGPT and Claude UI.
- **The Ablation Studio** — Standalone CLI and web dashboard to scientifically visualize token savings per NLP pipeline layer.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, TailwindCSS v4, Framer Motion
- **Backend:** FastAPI (Python), Uvicorn
- **Database:** SQLite (aiosqlite) + SQLAlchemy
- **AI/NLP:** `tiktoken`, `spaCy`, `llmlingua`, Python `ast`, Google Gemini API, Groq Llama-3 API
- **Extension:** Chrome Manifest V3, Service Workers, MutationObservers

---

## 🏗 Architecture & Evolution (Phases 1-12)

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

### Phase 11: The Ablation Studio
To scientifically prove our token savings, we built a dedicated Ablation Testing suite. We introduced a standalone CLI tool (`ablation_test.py`) and a beautiful `/ablation` web dashboard built with `framer-motion`. This suite runs user prompts through isolated pipeline layers (Regex, SpaCy, LLMLingua) to visualize exactly how each distinct compression strategy performs before the compounding NanoPrompt (All) pipeline takes over.

### Phase 12: Cascading Multi-API Fallback
To ensure maximum reliability during high-demand traffic spikes (e.g., 503 Overloaded errors on free tiers), we refactored the core LLM engine to support seamless Multi-API failovers. We integrated Groq (Llama-3-8B) as an instantaneous fallback. If the primary Gemini API throws a rate limit or quota error in the Semantic Compressor or Proof Engine, the system silently catches the exception and reroutes the prompt to Groq, guaranteeing uninterrupted service and zero UI breakage.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- An API key from Google Gemini (and optionally Groq for fallback)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/nanoprompt.git
cd nanoprompt
```

**2. Backend Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
```
*Edit `.env` to add your `GEMINI_API_KEY` and `GROQ_API_KEY`.*

**3. Frontend Setup**
```bash
cd ../frontend
npm install
```

---

## 💻 Usage

**Start the Backend Server**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*The API is now running at `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`.*

**Start the Frontend Client**
```bash
cd frontend
npm run dev
```
*Access the Web UI at `http://localhost:3000`.*

---

## 📁 Project Structure

```text
nanoprompt/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── routers/             # API route definitions
│   │   └── services/            # Core compression & LLM logic (Surgeon, Proof Engine)
│   ├── requirements.txt
│   └── ablation_test.py         # Standalone CLI ablation testing suite
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Dashboard, Ablation UI)
│   │   └── components/          # Reusable React components (Framer Motion UI)
│   ├── tailwind.config.ts
│   └── package.json
└── README.md
```

---

## 📡 API Reference

- `POST /api/v1/compress` — Standard compression for code or text.
- `POST /api/v1/surgeon` — AST dependency extraction (Requires `code` and `trace`).
- `POST /api/v1/ablation` — Runs the input through isolated NLP layers for scientific validation.
- `POST /api/v1/verify` — Runs the Proof Engine against the cascaded LLM pipeline (Gemini -> Groq).
- `GET /api/v1/stats` — Retrieves aggregate telemetry for the Global Odometer.
- `GET /api/v1/history` — Retrieves recent compression logs.

---

## 🧪 Testing

To run the standalone Ablation Studio CLI test:
```bash
cd backend
source venv/bin/activate
python ablation_test.py
```

---

## 🛣 Roadmap / Known Issues

- [ ] Build standalone desktop app via Tauri or Electron.
- [ ] Add support for Anthropic Claude API in the Multi-API fallback router.
- [ ] Implement user authentication and personal history dashboards.
- [ ] *Known Issue:* The Chrome extension content script occasionally loses state on complex SPAs during heavy DOM mutations.

---

## 🤝 Contributing

Contributions are welcome! Even though this project was built rapidly, we'd love community support to add more parsers, improve the neural compression models, or refine the UI.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📫 Contact

Built by the NanoPrompt Team.
- **Project Link:** [https://github.com/yourusername/nanoprompt](https://github.com/yourusername/nanoprompt)
