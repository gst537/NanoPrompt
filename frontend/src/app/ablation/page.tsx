"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

interface AblationResult {
  module_name: string;
  original_tokens: number;
  compressed_tokens: number;
  tokens_saved: number;
  compression_ratio: number;
  savings_usd: number;
  compressed_text: string;
}

export default function AblationStudio() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AblationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAblation = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ablation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to run ablation study.");
      const data = await res.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (name: string) => {
    if (name === "Baseline") return "bg-surfaceBorder";
    if (name.includes("Regex")) return "bg-blue-500/80";
    if (name.includes("SpaCy")) return "bg-purple-500/80";
    if (name.includes("LLMLingua")) return "bg-orange-500/80";
    return "bg-acid";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
        <h1 className="text-3xl font-serif italic mb-2 tracking-tight">Ablation Studio</h1>
        <p className="text-textMuted font-mono text-xs">
          Isolate and measure the mathematical token savings of each NLP compression layer.
        </p>
      </div>

      <div className="bg-codeBg border border-codeBorder flex flex-col relative h-96 mb-8">
        <div className="px-4 py-3 bg-surfaceCard hairline-b flex justify-between items-center">
          <span className="text-[11px] font-mono font-semibold text-textSecondary uppercase tracking-widest">
            Input Context
          </span>
          <span className="text-[10px] font-mono text-textMuted">
            {content.length} chars
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste a large prompt, system instruction, or document here to test..."
          className="w-full h-full p-5 bg-transparent text-textPrimary border-none font-mono text-sm leading-relaxed focus:ring-0 resize-none outline-none custom-scrollbar"
          spellCheck="false"
        />
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={runAblation}
          disabled={loading || !content.trim()}
          className={`px-8 py-3 rounded-none font-mono text-sm tracking-widest uppercase font-bold transition-all border ${
            loading || !content.trim()
              ? "bg-surfaceCard border-surfaceBorder text-textMuted cursor-not-allowed"
              : "bg-acid border-acid text-obsidianBg hover:bg-white hover:border-white shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer"
          }`}
        >
          {loading ? "RUNNING STUDY..." : "RUN ABLATION"}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-xs rounded-xl">
          [ERROR] {error}
        </div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {(() => {
              const baseline = results.find(r => r.module_name === "Baseline");
              const modules = results.filter(r => r.module_name !== "Baseline");
              const maxTokens = baseline ? baseline.original_tokens : (results[0]?.original_tokens || 1);

              return (
                <>
                  {baseline && (
                    <div className="p-6 bg-codeBg border border-surfaceBorder rounded-xl flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-surfaceBorder" />
                      <div>
                        <h3 className="font-mono text-lg font-bold text-textPrimary tracking-tight">Original Baseline</h3>
                        <p className="font-mono text-xs text-textMuted mt-1">Starting token count before compression.</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-4xl tracking-tighter text-textPrimary">
                          {baseline.original_tokens.toLocaleString()}
                        </span>
                        <span className="font-mono text-[10px] text-textMuted ml-1 uppercase block text-right mt-1 tracking-widest">Tokens</span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {modules.map((res, i) => {
                      const widthPct = (res.compressed_tokens / maxTokens) * 100;

                      return (
                        <div key={i} className="p-5 bg-surfaceCard border border-surfaceBorder rounded-xl relative overflow-hidden group hover:border-textSecondary/30 transition-all">
                          <div className="flex justify-between items-end mb-4 relative z-10">
                            <div>
                              <h3 className="font-mono text-sm font-bold text-textPrimary mb-1.5 flex items-center gap-2">
                                {res.module_name}
                              </h3>
                              <p className="font-mono text-xs text-textMuted">
                                Tokens Saved: <span className="text-acid">{res.tokens_saved}</span> | 
                                Compression: {((1 - res.compression_ratio) * 100).toFixed(1)}% | 
                                Saved: <span className="text-cyanAccent">${res.savings_usd.toFixed(6)}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-2xl tracking-tighter text-textPrimary">
                                {res.compressed_tokens.toLocaleString()}
                              </span>
                              <span className="font-mono text-[10px] text-textMuted ml-1 uppercase">Tokens</span>
                            </div>
                          </div>
                          
                          <div className="w-full bg-obsidianBg h-3 rounded-full overflow-hidden border border-surfaceBorder relative z-10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPct}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full ${getBarColor(res.module_name)} relative`}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full skeleton-shine"></div>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}
