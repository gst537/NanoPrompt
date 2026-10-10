"use client";

import { motion } from "framer-motion";
import { type VerifyResponse } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProofPaneProps {
  proof: VerifyResponse;
}

export default function ProofPane({ proof }: ProofPaneProps) {
  
  // Custom markdown components to match our dark mode aesthetic
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline ? (
        <div className="bg-[#0a0c10] border border-codeBorder rounded overflow-hidden my-4">
          <div className="bg-[#111318] px-3 py-1 text-[10px] text-textSecondary uppercase tracking-widest border-b border-codeBorder">
            {match ? match[1] : "code"}
          </div>
          <pre className="p-3 overflow-x-auto text-[12px] leading-relaxed custom-scrollbar">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="bg-[#1a1d24] text-acid px-1.5 py-0.5 rounded text-[12px]" {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }: any) => <p className="mb-4">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-4">{children}</ol>,
    li: ({ children }: any) => <li className="mb-1">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-xl font-bold mb-4 text-textPrimary">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-lg font-bold mb-3 text-textPrimary">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-base font-bold mb-2 text-textPrimary">{children}</h3>,
  };

  // Determine color based on similarity score (0.0 to 1.0)
  const score = proof.similarity_score ?? 1.0;
  let badgeColor = "bg-acid/10 border-acid text-acid";
  let accuracyText = "IDENTICAL LOGIC";
  
  if (score < 0.90) {
    badgeColor = "bg-red-500/10 border-red-500 text-red-500";
    accuracyText = "SEMANTIC DRIFT DETECTED";
  } else if (score < 0.95) {
    badgeColor = "bg-yellow-500/10 border-yellow-500 text-yellow-500";
    accuracyText = "HIGHLY ACCURATE";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mt-12 border-t border-surfaceBorder pt-12"
    >
      <div className="text-center mb-8">
        <h3 className="font-serif italic text-2xl text-textPrimary tracking-tight">
          The Proof Engine
        </h3>
        <p className="font-mono text-[10px] text-textSecondary uppercase tracking-widest mt-2">
          Mathematical Validation of Semantic Equivalence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Pane */}
        <div className="bg-codeBg border border-codeBorder flex flex-col relative opacity-70 hover:opacity-100 transition-opacity">
          <div className="px-4 py-3 bg-surfaceCard hairline-b flex justify-between items-center">
            <span className="text-[11px] font-mono font-semibold text-textSecondary uppercase tracking-widest">
              Standard Output (Full Cost)
            </span>
          </div>
          <div className="w-full h-96 p-6 font-mono text-sm leading-relaxed overflow-y-auto break-words custom-scrollbar text-textSecondary">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
              {proof.original_answer}
            </ReactMarkdown>
          </div>
        </div>

        {/* Compressed Pane */}
        <div className="bg-codeBg border border-acid flex flex-col relative shadow-[0_0_20px_rgba(204,255,0,0.05)]">
          <div className="px-4 py-3 bg-surfaceCard hairline-b flex justify-between items-center">
            <span className={`text-[11px] font-mono font-semibold uppercase tracking-widest ${badgeColor.split(' ')[2]}`}>
              NanoPrompt Output (Optimized)
            </span>
            <div className="flex gap-2 items-center">
              <span className={`text-[9px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 border ${badgeColor}`}>
                ACCURACY: {proof.similarity_percentage}
              </span>
              <span className={`text-[9px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 border ${badgeColor}`}>
                {accuracyText}
              </span>
            </div>
          </div>
          <div className="w-full h-96 p-6 font-mono text-sm leading-relaxed overflow-y-auto break-words custom-scrollbar text-textPrimary">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
              {proof.compressed_answer}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
