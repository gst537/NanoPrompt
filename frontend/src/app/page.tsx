"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CompressorPane from "@/components/CompressorPane";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center pt-32 pb-12 px-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-acid/10 text-acid font-mono text-[10px] uppercase tracking-wider font-semibold rounded-sm shadow-[0_0_20px_rgba(204,255,0,0.15)] border border-acid/30 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse"></span>
            Save 40-70% on LLM Token Costs
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif italic text-4xl sm:text-5xl lg:text-[56px] font-normal leading-[1.08] tracking-tight text-textPrimary mb-6 max-w-4xl mx-auto"
        >
          Architectural Intelligence for Your Prompts.
        </motion.h1>

        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-lg sm:text-xl text-textSecondary max-w-2xl font-light leading-relaxed mx-auto mb-12"
        >
          NanoPrompt uses AST parsing and semantic pruning to aggressively compress your
          prompts and code before they hit the LLM. Same quality. Fraction of the cost.
        </motion.p>
      </section>

      {/* Compressor */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-10 pb-16">
        <CompressorPane />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-textMuted text-xs font-mono tracking-widest uppercase hairline-t mt-auto">
        Built by NanoPrompt &middot; Editorial Haute Code Edition
      </footer>
    </div>
  );
}
