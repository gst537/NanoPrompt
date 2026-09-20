"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/SettingsContext";

export default function Navbar() {
  const pathname = usePathname();
  const { features } = useSettings();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-obsidianBg/90 backdrop-blur-md hairline-b px-4 sm:px-8 h-16 flex items-center justify-between transition-all">
      <div className="flex items-baseline gap-3">
        <Link href="/" className="font-serif italic text-xl tracking-tight text-textPrimary font-semibold hover:text-acid transition-colors">
          NanoPrompt.
        </Link>
        <span className="text-[10px] font-mono tracking-widest text-textMuted uppercase hidden sm:inline">
          Architectural Intelligence
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-surfaceBorder bg-surfaceCard/80 text-textPrimary">
          <span className="w-1.5 h-1.5 rounded-full bg-cyanAccent"></span>
          <span className="font-medium tracking-tight">ENGINE: ACTIVE</span>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              pathname === "/"
                ? "border-acid bg-acid text-obsidianBg font-bold"
                : "border-surfaceBorder hover:border-textSecondary/50 bg-surfaceCard/60 text-textPrimary"
            }`}
          >
            <span className="text-[10px] font-mono tracking-wider uppercase">COMPRESS</span>
          </Link>
          {features.enableDashboard && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                pathname === "/dashboard"
                  ? "border-acid bg-acid text-obsidianBg font-bold"
                  : "border-surfaceBorder hover:border-textSecondary/50 bg-surfaceCard/60 text-textPrimary"
              }`}
            >
              <span className="text-[10px] font-mono tracking-wider uppercase">DASHBOARD</span>
            </Link>
          )}
          {features.enableAblation && (
            <Link
              href="/ablation"
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                pathname === "/ablation"
                  ? "border-acid bg-acid text-obsidianBg font-bold"
                  : "border-surfaceBorder hover:border-textSecondary/50 bg-surfaceCard/60 text-textPrimary"
              }`}
            >
              <span className="text-[10px] font-mono tracking-wider uppercase">ABLATION</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
