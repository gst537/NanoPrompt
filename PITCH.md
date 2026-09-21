# NanoPrompt: Pitch & Architecture Guide

This document serves a dual purpose. **Part 1** is a high-level reading document suitable for sharing with judges, guides, or investors to quickly understand the technical architecture and value proposition of NanoPrompt. **Part 2** is a slide-by-slide speaker script based on our presentation structure.

---

## Part 1: Executive Summary & Architecture

### The Problem
Modern AI models (like ChatGPT and Claude) charge based on the number of tokens processed. Users frequently paste repetitive, overly detailed, or unoptimized text and code, unknowingly inflating their API costs and slowing down response times. Existing solutions like LLMLingua are complex Python libraries designed for developers, not regular users.

### The Solution: NanoPrompt
NanoPrompt is a universal AI token optimizer. It acts as a middleware layer that shrinks the size of the payload sent to AI models without altering its fundamental meaning. This ensures the same quality of output at a significantly lower cost (40-70% savings).

### Core Architecture
NanoPrompt utilizes a **Dual-Node Architecture** with a high-speed Python FastAPI backend and a Next.js web dashboard. 

- **Code Minification (The Surgeon Algorithm & AST):** 
  - *How it works:* Instead of using brittle regex rules to clean code, NanoPrompt parses the raw code into an **Abstract Syntax Tree (AST)**. An AST is a tree representation of the abstract syntactic structure of source code, where each node denotes a construct occurring in the code (like variable declarations or function calls).
  - *Program Slicing:* When provided with a stack trace error, our "Surgeon Algorithm" traverses this AST to extract the exact dependency graph of variables involved in the error. By navigating the tree structure, we can safely prune away entirely unrelated branches of logic, docstrings, and dead code, isolating the bug without destroying the code's valid syntax.
- **Semantic Text Pruning (SpaCy NLP):** 
  - *How it works:* We use local SpaCy Natural Language Processing pipelines to perform Part-of-Speech (POS) tagging and Dependency Parsing on the user's prompt. 
  - *Execution:* By breaking sentences down into syntactic trees, the engine identifies and strips out redundant determiners (e.g., "a", "the") and conversational fluff ("Could you please help me with...") while mathematically protecting critical semantic nodes like negations, nouns, and verbs. This happens locally and deterministically.
- **Deep Neural Compression (LLMLingua):** 
  - *How it works:* For deeper compression on raw text, we integrate LLMLingua using a pre-trained `XLM-RoBERTa` MeetingBank model. It calculates the perplexity (information entropy) of every token in the prompt. Tokens with low perplexity are highly predictable and therefore deleted, compressing the prompt aggressively while retaining its core semantic meaning.
- **Cascading Multi-API Fallback:** 
  - *How it works:* Built into the FastAPI backend, this acts as a high-availability router. If the primary Gemini API throws a `429 Too Many Requests` or quota error, the exception handler catches it and seamlessly reroutes the exact same payload to Groq's Llama-3 inference endpoints, guaranteeing uninterrupted service.
- **Browser Integration:** 
  - *How it works:* A Manifest V3 Chrome Extension injects a `MutationObserver` directly into the DOM of ChatGPT and Claude. It monitors the user's chat input area and intercepts the submit event, sending the payload to our local compression engine before the LLM vendor processes it.

---

## Part 2: Presenter Script (Slide-by-Slide)

*Use these talking points to guide your presentation. Keep a steady pace and emphasize the problem-solution dynamic.*

### Slide 1 – Title Slide
**Speaker Notes:**
> "Good morning everyone. Our project is NanoPrompt: A Universal AI Token Optimizer. My name is [Your Name], and I am joined by my partners [Partner Names]. We are presenting under the guidance of [Guide Name]."

### Slide 2 – Agenda
**Speaker Notes:**
> "Today we'll walk you through the core problem of AI token waste, look at existing literature, identify the research gap we are targeting, and then break down our system architecture and the results of our initial implementation."

### Slide 3 – Introduction
**Speaker Notes:**
> "We've all noticed that AI usage is getting expensive. Models charge per token. The reality is that when users copy-paste long prompts or messy code, a huge percentage of those tokens are completely useless to the AI. NanoPrompt is our solution. It acts as a filter that aggressively shrinks your prompt before it hits the AI, saving you money while getting the exact same answer."

### Slide 4 – Literature Survey
**Speaker Notes:**
> "In our research, we looked heavily into Microsoft Research's LLMLingua, which uses smaller AI models to remove unimportant words. Studies on LongLLMLingua and Selective Context prove that up to 50% of a prompt's tokens can be removed with almost zero drop in output quality because many tokens are just conversational fluff."

### Slide 5 – Challenges & Research Gap
**Speaker Notes:**
> "However, there is a major gap. Tools like LLMLingua are built for developers to use inside complex data pipelines. There is no simple, direct tool for a regular user or student to quickly compress a block of code before pasting it into ChatGPT. Our challenge was bringing this advanced NLP pipeline directly to the end-user without disrupting their normal workflow."

### Slide 6 – Project Objectives
**Speaker Notes:**
> "Our objectives are clear: 
> 1. We want semantic text pruning to strip filler. 
> 2. We want code minification that removes comments and whitespace without breaking execution.
> 3. We want to show users exactly how much money they saved in real-time.
> 4. We must mathematically prove that the compressed prompt yields the same quality response from the LLM."

### Slide 7 – Proposed Methodology & System Architecture
**Speaker Notes:**
> "To achieve this, we built a dual-node system. We have a Next.js premium dashboard for analytics, powered by a high-speed Python FastAPI backend handling AST parsing and Neural NLP. 
> We are also building a Chrome Extension to inject this engine directly into the browser. 
> For code, we use what we call the 'Surgeon Algorithm'—it uses AST slicing to extract only the code relevant to a bug. For text, we layer local SpaCy models with LLMLingua. Lastly, to prevent crashes, we built a Multi-API fallback that cascades from Gemini to Groq instantly if a rate limit is hit."

### Slide 8 – Results / Initial Implementation
**Speaker Notes:**
> "As for our progress, we are well past the 20% mark. The core Next.js and FastAPI engines are actively communicating. We've scaffolded our Chrome Extension. Our basic pruning pipelines using AST and SpaCy are live, and we have fully functioning REST APIs backed by a local SQLite database tracking our token savings in real-time. 
> Thank you, and we'd love to take any questions."

---

## Part 3: Anticipated Q&A (Defending the Project)

**Q: There are already extensions in the market that do prompt optimization (like MetaPrompt). What makes NanoPrompt better?**

**A:** You can answer this by highlighting our **three major architectural advantages** that typical extensions lack:

1. **Deep Mathematical/Syntactic Compression (Not just Regex):** Most extensions use simple keyword matching or regex to shorten text. NanoPrompt is entirely different. For code, our **"Surgeon Algorithm"** actually parses code into an Abstract Syntax Tree (AST) to perfectly extract only the variable dependencies causing a bug. For text, we use local SpaCy pipelines and LLMLingua neural compression. It truly understands the syntax, preventing broken code or lost context.
2. **The Proof Engine (Quality Assurance):** Other tools compress your prompt, but you never know if they accidentally deleted important context until the LLM gives you a bad answer. NanoPrompt includes a **Proof Engine** that mathematically tests semantic equivalence between the original and compressed prompt to guarantee quality isn't lost. 
3. **Scientific Ablation & Telemetry:** We aren't a black box. NanoPrompt ships with an **Ablation Studio** that scientifically isolates each pipeline layer (Regex vs SpaCy vs LLMLingua) so users can exactly see how tokens are being saved. Plus, our Global Odometer gamifies the experience by tracking real-time API cost savings in INR/USD.

---

## Part 4: Simple Explanations & Analogies (For Q&A)

*If a judge asks you to explain the complex technical terms in "plain English", use these analogies:*

### 1. AST (Abstract Syntax Tree)
**The Analogy: Sentence Diagramming**
When you read a sentence like "The fast dog ran," you instinctively know that "dog" is the noun and "ran" is the verb. An AST does exactly this, but for code. Instead of looking at code as just a block of text, it breaks it down into a "grammar tree." This allows NanoPrompt to understand the actual structure of the code (what is a variable, what is a function, what is just a comment) rather than just guessing.

### 2. The Surgeon Algorithm & Program Slicing
**The Analogy: The Frosting Recipe**
Imagine you have a massive 10-page recipe book for baking a cake, but you only want to know how to make the frosting. "Program Slicing" is like a surgeon who carefully cuts out *only* the frosting instructions and throws the rest of the book away, without ruining the steps. When your code crashes with a bug, our algorithm acts like that surgeon—it extracts only the exact lines of code related to the crash, and deletes everything else to save space.

### 3. SpaCy NLP Pipelines (Semantic Text Pruning)
**The Analogy: The Strict Editor**
Think of how you talk in a formal email: *"Hello there, I was wondering if you could please send me the report."* Now think of how you text a friend: *"Send report."* SpaCy acts like a strict editor. It reads your prompt, identifies the core meaning (the important nouns and verbs), and safely deletes all the polite "fluff" and filler words ("could you please", "the", "a") without changing the actual request.

### 4. Neural NLP & LLMLingua (Information Entropy)
**The Analogy: Fill in the Blanks**
If I say the phrase *"The sky is..."*, you almost certainly know the next word is *"blue"*. Because the word "blue" is so predictable in that sentence, it has low "entropy" (it's not surprising). LLMLingua is a neural network that reads your text and deletes all the highly predictable, obvious words. The AI on the receiving end (like ChatGPT) is smart enough to fill in the blanks on its own, meaning you can send it a much shorter, compressed message and it still understands you perfectly.
