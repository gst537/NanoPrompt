"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GlobalStats {
  total_tokens_saved: number;
  total_savings_usd: number; // Contains INR actually
}

export default function GlobalOdometer() {
  const [stats, setStats] = useState<GlobalStats | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch global stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 10 seconds to keep the odometer "live"
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full bg-[#111318] border border-codeBorder p-6 flex flex-col md:flex-row items-center justify-center gap-8 mb-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="text-center md:text-right">
        <div className="text-[10px] font-mono font-semibold text-textSecondary uppercase tracking-widest mb-1">
          Global Tokens Saved
        </div>
        <div className="font-mono text-3xl md:text-4xl text-acid font-bold">
          {stats.total_tokens_saved.toLocaleString()}
        </div>
      </div>
      
      <div className="hidden md:block w-px h-12 bg-surfaceBorder"></div>
      
      <div className="text-center md:text-left">
        <div className="text-[10px] font-mono font-semibold text-textSecondary uppercase tracking-widest mb-1">
          Total Money Saved
        </div>
        <div className="font-mono text-3xl md:text-4xl text-white font-bold">
          ₹{stats.total_savings_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </motion.div>
  );
}
