import type { DetectionMethod, Prediction, RiskLevel } from "./store";

export interface ClassifyResponse {
  prediction: Prediction;
  label: string;
  warning: RiskLevel;
  method: DetectionMethod;
  matched_keyword?: string;
  confidence: { Normal: number; Offensive: number; "Hate Speech": number };
}

// Curated whitelist / keyword lists — mirror the Flask three-layer pipeline
const SAFE_PHRASES = [
  "kill it with fire",
  "killing it",
  "you're killing it",
  "sick beat",
  "sick track",
  "that's insane",
  "dying laughing",
  "dead lol",
  "no offense",
];

const HATE_KEYWORDS = [
  "your kind",
  "go back to",
  "should be banned",
  "don't belong",
  "subhuman",
  "inferior race",
  "get rid of them",
  "exterminate",
];

const OFFENSIVE_KEYWORDS = [
  "idiot",
  "stupid",
  "moron",
  "trash",
  "garbage",
  "loser",
  "shut up",
  "get lost",
  "dumb",
  "pathetic",
];

function mockClassify(text: string): ClassifyResponse {
  const lower = text.toLowerCase().trim();
  if (!lower) {
    return {
      prediction: "Normal",
      label: "Empty input",
      warning: "safe",
      method: "safe_phrase",
      confidence: { Normal: 1, Offensive: 0, "Hate Speech": 0 },
    };
  }
  // Layer 1: safe phrase override
  const safe = SAFE_PHRASES.find((p) => lower.includes(p));
  if (safe) {
    return {
      prediction: "Normal",
      label: "Safe Phrase Override",
      warning: "safe",
      method: "safe_phrase",
      matched_keyword: safe,
      confidence: { Normal: 0.95, Offensive: 0.04, "Hate Speech": 0.01 },
    };
  }
  // Layer 2: hate keyword
  const hate = HATE_KEYWORDS.find((k) => lower.includes(k));
  if (hate) {
    return {
      prediction: "Hate Speech",
      label: "Keyword Match — Hate Speech",
      warning: "high",
      method: "keyword",
      matched_keyword: hate,
      confidence: { Normal: 0.05, Offensive: 0.15, "Hate Speech": 0.8 },
    };
  }
  const offensive = OFFENSIVE_KEYWORDS.find((k) => lower.includes(k));
  if (offensive) {
    return {
      prediction: "Offensive",
      label: "Keyword Match — Offensive",
      warning: "medium",
      method: "keyword",
      matched_keyword: offensive,
      confidence: { Normal: 0.18, Offensive: 0.72, "Hate Speech": 0.1 },
    };
  }
  // Layer 3: pseudo-ML — simple heuristic scoring
  let hateScore = 0,
    offScore = 0;
  const hateSignals = ["hate", "disgusting people", "should die", "worthless"];
  const offSignals = ["hate this", "sucks", "annoying", "ugly", "worst"];
  hateSignals.forEach((s) => lower.includes(s) && (hateScore += 0.28));
  offSignals.forEach((s) => lower.includes(s) && (offScore += 0.22));
  if (lower.includes("!") && lower === lower.toLowerCase()) offScore += 0.05;
  const normalScore = Math.max(0.05, 1 - hateScore - offScore);
  const total = normalScore + offScore + hateScore || 1;
  const conf = {
    Normal: normalScore / total,
    Offensive: offScore / total,
    "Hate Speech": hateScore / total,
  };
  let prediction: Prediction = "Normal";
  let warning: RiskLevel = "safe";
  let label = "Normal Speech";
  if (conf["Hate Speech"] > 0.5) {
    prediction = "Hate Speech";
    warning = "high";
    label = "Hate Speech Detected";
  } else if (conf.Offensive > 0.45) {
    prediction = "Offensive";
    warning = conf.Offensive > 0.6 ? "medium" : "low";
    label = "Offensive Language";
  } else if (conf.Offensive > 0.25) {
    prediction = "Offensive";
    warning = "low";
    label = "Low-Risk Offensive";
  }
  return { prediction, label, warning, method: "ml_model", confidence: conf };
}

export async function classifyText(
  text: string,
  opts: { apiUrl?: string; useMock?: boolean } = {},
): Promise<ClassifyResponse> {
  const { apiUrl, useMock } = opts;
  if (useMock || !apiUrl) return mockClassify(text);
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as ClassifyResponse;
  } catch (e) {
    console.warn("[DiscourseGuard] Live API failed, falling back to mock:", e);
    return mockClassify(text);
  }
}

export async function pingApi(
  apiUrl: string,
): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const t0 = performance.now();
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/health`, { method: "GET" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, latencyMs: Math.round(performance.now() - t0) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
