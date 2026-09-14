"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { getStats, getHistory, type AggregateStats, type CompressionLog } from "@/lib/api";

import GlobalOdometer from "@/components/GlobalOdometer";

export default function DashboardPage() {
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [history, setHistory] = useState<CompressionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, historyData] = await Promise.all([
          getStats(),
          getHistory(15),
        ]);
        setStats(statsData);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-10 pt-32 pb-16">
        
        {/* Inject Global Odometer Component Here! */}
        <GlobalOdometer />

        {/* Header */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 pb-8 hairline-b"
        >
          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-textMuted mb-3">
            <span>Telemetry · Global</span>
            <span className="text-acid">STATUS: ACTIVE</span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-[40px] font-normal leading-[1.08] tracking-tight text-textPrimary mb-4">
            Savings Architecture.
          </h1>
          <p className="font-serif italic text-lg text-textSecondary max-w-2xl font-light leading-relaxed">
            Real-time introspection of token reduction metrics and API cost savings.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-textMuted font-mono text-sm tracking-widest uppercase">
            Fetching Telemetry...
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatsCard
                icon="OPS"
                label="Total Cycles"
                value={stats?.total_compressions.toLocaleString() || "0"}
                accentColor="var(--text-primary)"
                delay={0}
              />
              <StatsCard
                icon="VOL"
                label="Tokens Saved"
                value={stats?.total_tokens_saved.toLocaleString() || "0"}
                subtitle={`of ${stats?.total_original_tokens.toLocaleString() || "0"} total`}
                accentColor="var(--accent-acid)"
                delay={0.1}
              />
              <StatsCard
                icon="CAP"
                label="Capital Retained"
                value={`₹${stats?.total_savings_usd.toFixed(4) || "0.0000"}`}
                subtitle="at GPT-4o pricing"
                accentColor="var(--accent-cyan)"
                delay={0.2}
              />
              <StatsCard
                icon="EFF"
                label="Avg. Reduction"
                value={`${Math.round((1 - (stats?.average_compression_ratio || 1)) * 100)}%`}
                subtitle="average yield"
                accentColor="var(--text-secondary)"
                delay={0.3}
              />
            </div>

            {/* Odometer / Big Number */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-10 bg-surfaceCard border border-surfaceBorder mb-12 relative overflow-hidden hidden"
            >
              <div className="text-[11px] font-mono font-semibold text-textSecondary uppercase tracking-widest mb-4">
                Aggregate Token Evaporation
              </div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8, delay: 0.5 }}
                className="text-6xl sm:text-7xl font-bold font-mono tracking-tighter text-acid"
                style={{ textShadow: "0 0 30px rgba(204,255,0,0.3)" }}
              >
                {stats?.total_tokens_saved.toLocaleString() || "0"}
              </motion.div>
              <div className="text-xs font-mono text-textMuted mt-4 uppercase tracking-widest">
                Cumulative tokens removed across all active nodes
              </div>
            </motion.div>

            {/* History Table */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-codeBg border border-codeBorder"
            >
              <div className="px-6 py-4 bg-surfaceCard hairline-b flex justify-between items-center">
                <span className="text-[11px] font-mono font-semibold text-textSecondary uppercase tracking-widest">
                  Recent Artifacts
                </span>
                <span className="text-[10px] font-mono text-textMuted">
                  {history.length} entries
                </span>
              </div>

              {history.length === 0 ? (
                <div className="p-16 text-center text-textMuted font-mono text-sm">
                  No compression artifacts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px] font-mono text-left">
                    <thead>
                      <tr className="hairline-b text-textMuted tracking-widest">
                        <th className="p-4 font-semibold">TYPE</th>
                        <th className="p-4 font-semibold">ORIGINAL</th>
                        <th className="p-4 font-semibold">COMPRESSED</th>
                        <th className="p-4 font-semibold">DELTA</th>
                        <th className="p-4 font-semibold">REDUCTION</th>
                        <th className="p-4 font-semibold">SAVED</th>
                        <th className="p-4 font-semibold">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          className="hairline-b hover:bg-surfaceCard/50 transition-colors"
                        >
                          <td className="p-4">
                            <span className="px-2 py-1 bg-surfaceCardAlt border border-surfaceBorder text-cyanAccent uppercase tracking-widest font-semibold text-[10px]">
                              {log.input_type}
                            </span>
                          </td>
                          <td className="p-4 text-textSecondary">
                            {log.original_tokens.toLocaleString()}
                          </td>
                          <td className="p-4 text-textPrimary">
                            {log.compressed_tokens.toLocaleString()}
                          </td>
                          <td className="p-4 text-acid font-semibold">
                            -{(log.original_tokens - log.compressed_tokens).toLocaleString()}
                          </td>
                          <td className="p-4 text-textPrimary font-semibold">
                            {Math.round((1 - log.compression_ratio) * 100)}%
                          </td>
                          <td className="p-4 text-cyanAccent">
                            ₹{log.savings_usd.toFixed(4)}
                          </td>
                          <td className="p-4 text-textMuted text-[10px]">
                            {formatDate(log.created_at)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
