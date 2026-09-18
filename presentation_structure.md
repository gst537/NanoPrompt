# NanoPrompt (AI Token Optimizer) - Review-I Presentation

## Slide 1 – Title Slide
- **Project Title:** NanoPrompt: A Universal AI Token Optimizer
- **Student Details:** [Insert Student Names and ID/Roll Numbers]
- **Guide Details:** [Insert Guide Name and Designation]

## Slide 2 – Agenda
- Introduction & Problem Statement
- Literature Survey
- Challenges & Research Gap
- Project Objectives
- Proposed Methodology & System Architecture
- Results & Initial Implementation

## Slide 3 – Introduction
- **The Core Problem:** AI models (ChatGPT, Claude, etc.) charge based on the number of tokens processed. Longer prompts, messy code, and large data files cost more and take longer to execute.
- **The Reality:** Users frequently paste repetitive, overly detailed, or unoptimized text, unknowingly inflating costs.
- **The Solution:** NanoPrompt is a tool designed to shrink the size of the payload sent to AI models without altering its fundamental meaning, ensuring the same quality of output at a significantly lower cost.

## Slide 4 – Literature Survey
- **LLMLingua (Microsoft Research):** A tool that uses a smaller helper AI model to remove unimportant words, shrinking prompts by up to 20 times while preserving answer quality.
- **LongLLMLingua:** An advanced iteration designed for extensive prompts (e.g., long documents), which improves answer quality by approximately 17% while utilizing only a quarter of the original tokens by eliminating distracting context.
- **Selective Context:** An earlier methodology demonstrating that around half of a prompt's tokens can be removed with almost no drop in quality, as many tokens simply repeat or add minimal new information.

## Slide 5 – Challenges & Research Gap
- **Developer-Centric Ecosystem:** Existing compression tools (like LLMLingua) function primarily as add-on Python libraries meant for developers building complex AI pipelines.
- **The Gap:** There is a significant lack of simple, direct, and accessible tools aimed at regular users, students, or standard developers who just want to quickly compress a prompt, code file, or data file before pasting it into a chat interface.
- **Integration Challenge:** Seamlessly integrating these complex NLP pipelines into a daily workflow (like directly inside a browser via a Chrome Extension) without disrupting the user experience.

## Slide 6 – Project Objectives
- **Semantic Text Pruning:** Build a tool that reduces the token count in a prompt without altering its meaning (stripping filler, repeated sentences, etc.).
- **Code Minification:** Shrink code files by removing comments, blank lines, and extraneous spacing without breaking the code's execution logic.
- **Document Compression:** Convert data files (like JSON) and documents into smaller, more cost-effective formats prior to LLM submission.
- **Cost Transparency:** Display clear before-and-after token counts alongside estimated cost savings for every processed input.
- **Quality Assurance:** Validate that the shortened version still elicits the exact same quality of response from the LLM as the original prompt.

## Slide 7 – Proposed Methodology & System Architecture
- **Dual-Node Architecture:** 
  - **Frontend:** A Next.js web dashboard with a premium UI (TailwindCSS, Framer Motion) for tracking global telemetry and ablation testing.
  - **Backend:** A high-speed FastAPI Python backend handling tokenization (`tiktoken`), AST parsing, and Neural NLP.
- **Browser Integration (Manifest V3):** A Chrome Extension that injects seamlessly into ChatGPT and Claude, intercepting and compressing user inputs natively.
- **Compression Pipelines:**
  - *Code:* The "Surgeon Algorithm" utilizes AST Slicing to extract precise variable dependency graphs, stripping out irrelevant code.
  - *Text:* Local SpaCy pipelines for stripping deterministic conversational fluff, layered with LLMLingua for deep neural compression.
- **Multi-API Fallback:** Cascading logic that falls back from primary APIs (like Gemini) to alternatives (like Groq Llama-3) to prevent rate-limit crashes during heavy traffic.

## Slide 8 – Results / Initial Implementation (minimum 20% completion)
- **Core Engine Initialized:** The Next.js frontend and Python FastAPI backend have been scaffolded and successfully communicate.
- **Chrome Extension Foundation:** The base architecture for the Chrome Extension (Manifest V3) is established, including Service Workers and MutationObservers for DOM injection.
- **Basic Pruning Pipelines Implemented:** 
  - Initial integration of `tiktoken` for accurate token counting and cost estimation.
  - Implementation of AST-based code minification to safely strip docstrings and whitespace.
  - Basic SpaCy integration for initial natural language filler removal.
- **REST API Interface:** Built and tested core FastAPI routes (`/api/v1/compress`, `/api/v1/surgeon`, etc.) to handle processing requests.
- **Database & Telemetry Setup:** SQLite and SQLAlchemy configured to log asynchronous compressions and track token savings.
