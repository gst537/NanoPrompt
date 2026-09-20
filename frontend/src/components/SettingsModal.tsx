"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/lib/SettingsContext";

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { features, toggleFeature } = useSettings();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+Shift+H (Mac) or Ctrl+Shift+H (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleOptions = [
    { key: "enableAblation" as const, label: "Enable Ablation Mode" },
    { key: "enableDashboard" as const, label: "Enable Dashboard" },
    { key: "enableFileMode" as const, label: "Enable File Upload Compressor" },
    { key: "enableDebugMode" as const, label: "Enable AST Debug Compressor" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidianBg/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-codeBg border border-surfaceBorder max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 bg-surfaceCard hairline-b flex justify-between items-center">
          <span className="text-sm font-mono font-bold text-textPrimary uppercase tracking-widest">
            Hidden Settings
          </span>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-textMuted hover:text-acid transition-colors font-mono text-xs uppercase"
          >
            [Close]
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs font-mono text-textMuted mb-2">
            Toggle features on or off. Settings are saved locally.
          </p>

          {toggleOptions.map((opt) => (
            <div key={opt.key} className="flex justify-between items-center p-3 border border-surfaceBorder bg-surfaceCardAlt">
              <span className="font-mono text-sm text-textPrimary">{opt.label}</span>
              <button
                onClick={() => toggleFeature(opt.key)}
                className={`w-12 h-6 flex items-center p-1 cursor-pointer transition-colors ${
                  features[opt.key] ? "bg-acid" : "bg-surfaceBorder"
                }`}
              >
                <div 
                  className={`w-4 h-4 bg-obsidianBg transition-transform ${
                    features[opt.key] ? "translate-x-6" : "translate-x-0"
                  }`} 
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
