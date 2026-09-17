# 🚀 NanoPrompt

> **A Universal AI Token Optimizer to hyper-compress LLM prompts, isolate bugs surgically, and reduce your API costs by 40-70%.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

---

## 📸 Demo

*(Insert GIF or Screenshot of the NanoPrompt UI / Dashboard here)*

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

## 🏗 Architecture & How it Works

NanoPrompt operates on a dual-node architecture consisting of a high-speed Python FastAPI backend and a premium Next.js frontend. 

When text is submitted, NanoPrompt routes it through a specialized pipeline:
1. **Code:** Parsed via `ast` (Python) or `jsmin` (JS/TS) to strip non-functional tokens.
2. **Natural Language:** Passes through a chained NLP pipeline: 
   - **Regex** (Drops deterministic filler)
   - **SpaCy** (Surgically drops determiners while protecting nouns/verbs/negations)
   - **LLMLingua** (Deep neural semantic pruning)
3. **Validation:** The Proof Engine simultaneously queries both the uncompressed and compressed prompts to a cloud LLM (Gemini with Groq failover) to prove the output is semantically identical.

All savings are calculated locally via `tiktoken` (cl100k_base) and logged asynchronously to a SQLite database for the Global Telemetry Dashboard.

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
