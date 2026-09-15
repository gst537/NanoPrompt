const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CompressionStats {
  original_tokens: number;
  compressed_tokens: number;
  tokens_saved: number;
  compression_ratio: number;
  savings_usd: number;
  detected_type: string;
}

export interface CompressResponse {
  compressed_text: string;
  stats: CompressionStats;
}

export interface VerifyResponse {
  original_answer: string;
  compressed_answer: string;
  is_equivalent: boolean | null;
}

export interface AggregateStats {
  total_compressions: number;
  total_original_tokens: number;
  total_compressed_tokens: number;
  total_tokens_saved: number;
  total_savings_usd: number;
  average_compression_ratio: number;
}

export interface CompressionLog {
  id: string;
  input_type: string;
  original_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
  savings_usd: number;
  created_at: string;
}

/**
 * Compress text or code via the NanoPrompt API.
 */
export async function compressContent(
  content: string,
  type: "auto" | "code" | "text" | "json" = "auto"
): Promise<CompressResponse> {
  const res = await fetch(`${API_BASE}/api/v1/compress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, type }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Compression failed" }));
    throw new Error(err.detail || "Compression failed");
  }

  return res.json();
}

/**
 * Compress a PDF or DOCX file via the NanoPrompt API.
 */
export async function compressFile(file: File): Promise<CompressResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/compress/file`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "File compression failed" }));
    throw new Error(err.detail || "File compression failed");
  }

  return res.json();
}

/**
 * Get aggregate compression statistics.
 */
export async function getStats(): Promise<AggregateStats> {
  const res = await fetch(`${API_BASE}/api/v1/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

/**
 * Get compression history.
 */
export async function getHistory(limit = 20): Promise<CompressionLog[]> {
  const res = await fetch(`${API_BASE}/api/v1/history?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

/**
 * Run the Proof Engine to verify semantic equivalence.
 */
export async function verifyCompression(original: string, compressed: string): Promise<VerifyResponse> {
  const res = await fetch(`${API_BASE}/api/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original, compressed }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Verification failed" }));
    throw new Error(err.detail || "Verification failed");
  }

  return res.json();
}

export interface SurgeonResponse {
  sliced_code: string;
  target_line: number;
}

/**
 * Run the Surgeon Algorithm to extract AST dependencies.
 */
export async function runSurgeon(code: string, trace: string): Promise<SurgeonResponse> {
  const res = await fetch(`${API_BASE}/api/v1/surgeon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, trace }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Surgeon failed" }));
    throw new Error(err.detail || "Surgeon failed");
  }

  return res.json();
}
