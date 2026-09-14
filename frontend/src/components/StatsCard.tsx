"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  accentColor: string;
  delay?: number;
}

export default function StatsCard({
  icon,
  label,
  value,
  subtitle,
  accentColor,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-surfaceCard p-4 hairline-b hairline-r hairline-l hairline-t"
    >
      <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-textMuted uppercase tracking-wider">
        <span className="opacity-80">{icon}</span>
        {label}
      </div>
      <div 
        className="font-mono text-2xl font-bold tracking-tight mb-1"
        style={{ color: accentColor.includes("var") ? accentColor.replace("var(--accent-cyan)", "#38bdf8").replace("var(--accent-acid)", "#ccff00").replace("var(--text-primary)", "#f3f4f6").replace("var(--text-secondary)", "#9ca3af") : accentColor }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] font-mono text-textMuted lowercase">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
