"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { compressContent, compressFile, verifyCompression, runSurgeon, generateHeatmap, analyzeComplexity, type CompressResponse, type VerifyResponse, type HeatmapResponse, type ComplexityResponse } from "@/lib/api";
import StatsCard from "./StatsCard";
import ProofPane from "./ProofPane";
import { useSettings } from "@/lib/SettingsContext";

type ContentType = "auto" | "code" | "text" | "json" | "debug" | "file";

export default function CompressorPane() {
  const { features } = useSettings();
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CompressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Proof Engine State
  const [proof, setProof] = useState<VerifyResponse | null>(null);
  const [proving, setProving] = useState(false);
  const [trace, setTrace] = useState(""); // Stack trace for debug mode
  const [surgeonResult, setSurgeonResult] = useState<{sliced_code: string, target_line: number} | null>(null);

  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [complexity, setComplexity] = useState<ComplexityResponse | null>(null);
  const [analyzingComplexity, setAnalyzingComplexity] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>("auto");
  const [copied, setCopied] = useState(false);

  const handleCompress = async () => {
    if (contentType !== "file" && !input.trim()) return;
    if (contentType === "file" && !file) return;
    
    setLoading(true);
    setError(null);
    setProof(null); // Reset proof on new compression
    setSurgeonResult(null);

    try {
      if (contentType === "file") {
        const response = await compressFile(file!);
        setResult(response);
      } else if (contentType === "debug") {
        if (!trace.trim()) {
          throw new Error("Stack trace is required for AST Surgeon.");
        }
        const response = await runSurgeon(input, trace);
        setSurgeonResult(response);
      } else {
        const response = await compressContent(input, contentType);
        setResult(response);
      }
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProof = async () => {
    if (!input.trim() || !result) return;
    setProving(true);
    setError(null);

    try {
      const response = await verifyCompression(input, result.compressed_text);
      if (response.original_answer === "[RATE_LIMIT_EXCEEDED]") {
        setError("Gemini API Rate Limit Exceeded! Please wait a moment and try again.");
      } else {
        setProof(response);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setProving(false);
    }
  };

  const handleHeatmap = async () => {
    if (!input.trim()) return;
    setLoadingHeatmap(true);
    setError(null);
    try {
      const response = await generateHeatmap(input);
      setHeatmap(response);
    } catch (err: any) {
      setError(err.message || "Heatmap failed");
    } finally {
      setLoadingHeatmap(false);
    }
  };

  const handleComplexity = async () => {
    if (!input.trim()) return;
    setAnalyzingComplexity(true);
    setError(null);
    try {
      const response = await analyzeComplexity(input);
      setComplexity(response);
    } catch (err: any) {
      setError(err.message || "Complexity analysis failed");
    } finally {
      setAnalyzingComplexity(false);
    }
  };

  const handleCopy = async () => {
    if (surgeonResult) {
      await navigator.clipboard.writeText(surgeonResult.sliced_code);
    } else if (result) {
      await navigator.clipboard.writeText(result.compressed_text);
    } else {
      return;
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setFile(null);
    setTrace("");
    setResult(null);
    setSurgeonResult(null);
    setProof(null);
    setHeatmap(null);
    setComplexity(null);
    setError(null);
  };

  const typeOptions: { value: ContentType; label: string; icon: string }[] = [
    { value: "auto", label: "Auto Detect", icon: "🔍" },
    { value: "code", label: "Code", icon: "💻" },
    { value: "text", label: "Text", icon: "📝" },
    { value: "json", label: "JSON", icon: "📦" },
    ...(features.enableDebugMode ? [{ value: "debug" as ContentType, label: "Debug (AST)", icon: "🔬" }] : []),
    ...(features.enableFileMode ? [{ value: "file" as ContentType, label: "File", icon: "📄" }] : []),
  ];

  return (
    <div className="w-full">
      {/* Type Selector */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 justify-center mb-6 flex-wrap"
      >
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setContentType(opt.value)}
            className={`px-4 py-1.5 text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 ${
              contentType === opt.value
                ? "bg-acid text-obsidianBg font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "bg-surfaceCard border border-surfaceBorder text-textSecondary hover:border-acid hover:text-acid"
            }`}
          >
            <span>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Split Pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Input Pane */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 h-full"
        >
          {contentType === "debug" && (
            <div className="bg-codeBg border border-red-500/30 flex flex-col relative h-32">
              <div className="px-4 py-2 bg-red-950/20 hairline-b flex justify-between items-center">
                <span className="text-[11px] font-mono font-semibold text-red-400 uppercase tracking-widest">
                  Stack Trace (Error)
                </span>
              </div>
              <textarea
                value={trace}
                onChange={(e) => setTrace(e.target.value)}
                placeholder="Paste the terminal error here (e.g. 'line 42')..."
                className="w-full h-full p-3 bg-transparent text-red-300 border-none font-mono text-xs leading-relaxed focus:ring-0 resize-none outline-none custom-scrollbar"
                spellCheck="false"
              />
            </div>
          )}
          {contentType === "file" ? (
            <div className="bg-codeBg border border-codeBorder flex flex-col relative h-96 justify-center items-center">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer p-10 border-2 border-dashed border-surfaceBorder hover:border-acid transition-all group"
              >
                <span className="text-4xl mb-4 group-hover:text-acid text-textSecondary transition-all">📄</span>
                <span className="text-sm font-mono font-bold text-textPrimary uppercase tracking-widest mb-2 group-hover:text-acid transition-all">
                  Upload PDF or DOCX
                </span>
                <span className="text-xs font-mono text-textMuted text-center max-w-[200px]">
                  {file ? file.name : "Click or drag file to extract & compress"}
                </span>
              </label>
            </div>
          ) : (
            <div className="bg-codeBg border border-codeBorder flex flex-col relative flex-1 min-h-[384px]">
              <div className="px-4 py-3 bg-surfaceCard hairline-b flex justify-between items-center">
                <span className="text-[11px] font-mono font-semibold text-textSecondary uppercase tracking-widest">
                  {contentType === "debug" ? "Full Source Code" : "Input Context"}
                </span>
                <span className="text-[10px] font-mono text-textMuted">
                  {input.length} chars
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your prompt, code, or context here..."
                className="w-full h-full p-5 bg-transparent text-textPrimary border-none font-mono text-sm leading-relaxed focus:ring-0 resize-none outline-none custom-scrollbar"
                spellCheck="false"
              />
            </div>
          )}
        </motion.div>

        {/* Output Pane */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`flex flex-col relative h-full bg-codeBg border transition-colors ${
            result || surgeonResult ? "border-acid" : "border-codeBorder"
          }`}
        >
          <div className="px-4 py-3 bg-surfaceCard hairline-b flex justify-between items-center">
            <span className={`text-[11px] font-mono font-semibold uppercase tracking-widest ${result || surgeonResult ? 'text-acid' : 'text-textSecondary'}`}>
              {surgeonResult ? "Extracted Sliced Logic" : (result ? "Compressed Output" : "Idle Output")}
            </span>
            {(result || surgeonResult) && (
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 rounded-none bg-surfaceCardAlt border border-surfaceBorder hover:border-acid hover:text-acid text-[10px] font-mono uppercase tracking-widest text-textSecondary transition-all"
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            )}
          </div>
          <div className={`flex-1 w-full p-5 font-mono text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap break-words custom-scrollbar ${result || surgeonResult ? 'text-textPrimary' : 'text-textMuted'}`}>
            {surgeonResult 
              ? (
                <>
                  <div className="text-red-400 font-bold mb-4 text-xs tracking-widest uppercase">Target Line: {surgeonResult.target_line}</div>
                  {surgeonResult.sliced_code}
                </>
              )
              : (result ? result.compressed_text : "Compressed artifact will render here...")
            }
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-4 mb-8 flex-wrap"
      >
        <button
          onClick={handleCompress}
          disabled={loading || (contentType === "file" ? !file : !input.trim()) || (contentType === "debug" && !trace.trim())}
          className={`px-8 py-3 rounded-none font-mono text-sm tracking-widest uppercase font-bold transition-all border ${
            loading || (contentType === "file" ? !file : !input.trim()) || (contentType === "debug" && !trace.trim())
              ? "bg-surfaceCard border-surfaceBorder text-textMuted cursor-not-allowed"
              : "bg-acid border-acid text-obsidianBg hover:bg-white hover:border-white shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer"
          }`}
        >
          {loading ? "PROCESSING..." : (contentType === "debug" ? "RUN SURGEON (AST)" : "COMPILE & COMPRESS")}
        </button>

        {result && (
          <button
            onClick={handleProof}
            disabled={proving}
            className={`px-6 py-3 rounded-none font-mono text-sm tracking-widest uppercase font-bold transition-all border ${
              proving
                ? "bg-surfaceCard border-surfaceBorder text-textMuted cursor-not-allowed"
                : "bg-transparent border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer"
            }`}
          >
            {proving ? "VERIFYING LLM..." : "🔬 PROVE IT"}
          </button>
        )}

        {input.trim() && contentType !== "file" && (
          <>
            <button
              onClick={handleHeatmap}
              disabled={loadingHeatmap}
              className="px-6 py-3 rounded-none font-mono text-sm tracking-widest uppercase font-bold transition-all border bg-transparent border-orange-400 text-orange-400 hover:bg-orange-400/10 cursor-pointer"
            >
              {loadingHeatmap ? "LOADING..." : "🔥 HEATMAP"}
            </button>
            <button
              onClick={handleComplexity}
              disabled={analyzingComplexity}
              className="px-6 py-3 rounded-none font-mono text-sm tracking-widest uppercase font-bold transition-all border bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400/10 cursor-pointer"
            >
              {analyzingComplexity ? "ANALYZING..." : "🧠 ROUTING"}
            </button>
          </>
        )}

        <button
          onClick={handleClear}
          className="px-6 py-3 rounded-none border border-surfaceBorder bg-surfaceCardAlt text-textSecondary font-mono text-sm tracking-widest uppercase hover:border-textSecondary transition-all cursor-pointer"
        >
          CLEAR
        </button>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="p-4 bg-red-950/30 border border-red-500/50 text-red-400 font-mono text-sm text-center mb-8"
          >
            ERR: {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compression Stats Bar */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatsCard
              icon="SAVED"
              label="Tokens"
              value={result.stats.tokens_saved.toLocaleString()}
              subtitle={`${result.stats.original_tokens} → ${result.stats.compressed_tokens}`}
              accentColor="var(--accent-acid)"
              delay={0}
            />
            <StatsCard
              icon="EFFICIENCY"
              label="Reduction"
              value={`${Math.round((1 - result.stats.compression_ratio) * 100)}%`}
              subtitle="of tokens removed"
              accentColor="var(--accent-cyan)"
              delay={0.1}
            />
            <StatsCard
              icon="ROI"
              label="INR Saved"
              value={`₹${result.stats.savings_usd.toFixed(4)}`}
              subtitle="at API input cost"
              accentColor="var(--text-primary)"
              delay={0.2}
            />
            <StatsCard
              icon="NODE"
              label="Type"
              value={result.stats.detected_type.toUpperCase()}
              subtitle="auto-classified parser"
              accentColor="var(--text-secondary)"
              delay={0.3}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Engine Rendering */}
      <AnimatePresence>
        {proof && <ProofPane proof={proof} />}
      </AnimatePresence>

      <AnimatePresence>
        {heatmap && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="p-8 border border-orange-500/30 bg-orange-950/10 mb-8 w-full rounded-sm"
          >
            <div className="mb-6 border-b border-orange-500/20 pb-4">
              <h3 className="text-orange-400 font-mono font-bold mb-2 uppercase text-lg tracking-widest flex items-center gap-2">
                <span>🔥</span> Token Attention Heatmap
              </h3>
              <p className="text-textMuted font-mono text-sm leading-relaxed max-w-3xl">
                This visualizes how the AI "reads" your prompt before compression. Tokens highlighted in bright orange have high information entropy (meaning they are critical for the AI to understand your request). Tokens with dark backgrounds are highly predictable or conversational fluff, meaning they can be safely deleted to save API costs without degrading the output quality.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5 font-mono text-sm">
               {heatmap.tokens.map((t, i) => (
                 <span key={i} className="px-2 py-1 rounded shadow-sm transition-colors" style={{ backgroundColor: `rgba(255, 165, 0, ${t.weight})`, color: t.weight > 0.5 ? '#000000' : 'var(--text-secondary)' }}>
                   {t.word.trim() || "\u00A0"}
                 </span>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {complexity && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="p-8 border border-purple-500/30 bg-purple-950/10 mb-8 w-full rounded-sm"
          >
            <div className="mb-6 border-b border-purple-500/20 pb-4">
              <h3 className="text-purple-400 font-mono font-bold mb-2 uppercase text-lg tracking-widest flex items-center gap-2">
                <span>🧠</span> Predictive Routing
              </h3>
              <p className="text-textMuted font-mono text-sm leading-relaxed max-w-3xl">
                Instead of sending every request to an expensive flagship model, NanoPrompt analyzes your prompt's "syntactic density". If it detects complex code or highly dense logical instructions, it routes to a powerful model (like Gemini 1.5 Pro). If it detects simple chatter, it dynamically routes to a faster, cheaper model (like Llama 3) to maximize your cost ROI.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <div className="p-6 bg-obsidianBg border border-purple-500/20 rounded-sm hover:border-purple-500/50 transition-colors">
                <div className="text-[11px] uppercase text-purple-400 tracking-widest mb-3 flex items-center gap-2"><span>📊</span> Density Score</div>
                <div className="text-3xl font-bold text-white">{complexity.density_score}</div>
              </div>
              <div className="p-6 bg-obsidianBg border border-purple-500/20 rounded-sm hover:border-purple-500/50 transition-colors">
                <div className="text-[11px] uppercase text-purple-400 tracking-widest mb-3 flex items-center gap-2"><span>🎯</span> Suggested Model</div>
                <div className="text-xl font-bold text-acid">{complexity.suggested_model}</div>
              </div>
              <div className="p-6 bg-obsidianBg border border-purple-500/20 rounded-sm hover:border-purple-500/50 transition-colors">
                <div className="text-[11px] uppercase text-purple-400 tracking-widest mb-3 flex items-center gap-2"><span>💡</span> Reasoning</div>
                <div className="text-sm text-textMuted leading-relaxed">{complexity.reason}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
