# Testing Patterns

**Analysis Date:** 2026-10-08

## Current Testing Strategy

The repository currently utilizes **standalone CLI verification scripts**, **NLP ablation benchmarks**, and **runtime functional verification (Proof Engine)** rather than a traditional automated test runner like `pytest` or `Jest`.

There is no formal CI-driven unit testing pipeline configured at this time.

## Test Scripts & Tools

### 1. Standalone Ablation Testing Suite (`backend/ablation_test.py`)
- **Purpose:** Scientifically tests and benchmarks each distinct NLP compression layer (Baseline, Regex + Abbreviations, SpaCy NLP, LLMLingua Neural, and full NanoPrompt Compound pipeline) on a target text file.
- **Output:** Uses `rich.table` to output a terminal comparison table showing Original Tokens, Compressed Tokens, Tokens Saved, Compression Ratio, and Estimated Savings ($).
- **Run Command:**
```bash
cd backend
source venv/bin/activate
python ablation_test.py test_prompt.txt
```

### 2. Service Verification Script (`backend/test_v2.py`)
- **Purpose:** Verifies offline execution of:
  - Cosine semantic similarity (`calculate_similarity`) using `SentenceTransformer` embeddings.
  - Syntactic density analysis (`analyze_complexity`) using `spaCy`.
  - Token attention heatmap generation (`generate_heatmap`).
- **Run Command:**
```bash
cd backend
source venv/bin/activate
python test_v2.py
```

### 3. LLMLingua Diagnostic Probes (`backend/test_llm.py`, `backend/test_llm_2.py`, `backend/test_llm_3.py`)
- **Purpose:** Tests integration details with the `microsoft/llmlingua-2-xlm-roberta-large-meetingbank` model, including token probabilities and word label attributes (`fn_labeled_original_prompt`).
- **Run Command:**
```bash
cd backend
source venv/bin/activate
python test_llm_3.py
```

## The Proof Engine (Runtime Verification)

In addition to static scripts, the system incorporates an integrated **Quantitative Proof Engine**:
- **Endpoint:** `POST /api/v1/verify` (invoked via `frontend/src/components/ProofPane.tsx`).
- **Mechanism:**
  1. Executes the uncompressed original prompt through an LLM (`gemini-3.6-flash` or Groq `llama3-8b-8192`).
  2. Executes the NanoPrompt-compressed prompt through the same LLM.
  3. Uses local sentence embeddings (`all-MiniLM-L6-v2`) to compute cosine similarity between the two outputs.
  4. Returns `is_equivalent: true` if cosine similarity >= 0.90 (90%).

## Frontend Quality Checks

- **Linting:** Configured with ESLint 9 (`eslint.config.mjs`) extending `next/core-web-vitals`.
- **Run Command:**
```bash
cd frontend
npm run lint
```
- **Type Checking:** TypeScript compiler runs during build.
```bash
cd frontend
npm run build
```

## Coverage & Gaps

- **Unit Test Runner Missing:** No `pytest` or `unittest` configuration exists for `backend/app/services/` or `backend/app/routers/`.
- **Integration Tests Missing:** No automated tests verify endpoint contracts or database interactions.
- **Frontend Component Tests:** No component testing library (Vitest, React Testing Library) is installed.
- **E2E / Browser Tests:** No automated Playwright tests verify Chrome Extension injection or web app flows end-to-end.

## Recommended Test Implementation

To establish proper test coverage, the following patterns should be adopted:

**Backend (pytest):**
```bash
# Recommended future packages:
pip install pytest pytest-asyncio httpx
```

```python
# tests/test_compression.py pattern
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_compress_code():
    res = client.post("/api/v1/compress", json={"content": "def foo():\n    '''doc'''\n    pass\n", "type": "code"})
    assert res.status_code == 200
    assert "doc" not in res.json()["compressed_text"]
```

---

*Testing analysis: 2026-10-08*
*Update when test patterns change*
