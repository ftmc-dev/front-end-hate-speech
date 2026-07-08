import { useState } from "react";
import { Play, Loader2, Zap, Layers, Cpu, ArrowRight, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { classifyText, type ClassifyResponse } from "@/lib/api";
import { store, useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBars } from "@/components/ConfidenceBars";
import { RiskBadge } from "@/components/RiskBadge";

const PRESETS = [
  { label: "Safe phrase (idiom)", text: "This project is amazing, kill it with fire team!" },
  { label: "Clear hate keyword", text: "Your kind doesn't belong on this platform, leave" },
  { label: "Offensive tone", text: "This is such a stupid idea, worst thing I've read" },
  { label: "Neutral message", text: "Thanks for the review, the ML pipeline looks solid" },
  { label: "Ambiguous", text: "I really hate when threads devolve into arguments" },
];

export default function ApiTesterPage() {
  const settings = useStore((s) => s.settings);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (!text.trim()) return toast.error("Enter a message first");
    setLoading(true);
    const t0 = performance.now();
    const res = await classifyText(text, { apiUrl: settings.apiUrl, useMock: settings.useMockApi });
    setLatency(Math.round(performance.now() - t0));
    setResult(res);
    setLoading(false);
  };

  const saveToQueue = () => {
    if (!result) return;
    store.addMessage({
      id: `m${Date.now()}`,
      content: text,
      author: "manual_test",
      channel: "#api-tester",
      platform: "Manual",
      createdAt: Date.now(),
      prediction: result.prediction,
      label: result.label,
      warning: result.warning,
      method: result.method,
      matchedKeyword: result.matched_keyword,
      confidence: result.confidence,
      action:
        result.warning === "high" ? "deleted" : result.warning === "medium" ? "warned" : "logged",
      reviewed: false,
    });
    toast.success("Added to moderation queue");
  };

  const copyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const methodIcon =
    result?.method === "safe_phrase" ? Zap : result?.method === "keyword" ? Layers : Cpu;
  const MethodIcon = methodIcon;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
      <header>
        <div className="text-xs font-semibold text-primary uppercase tracking-widest">
          Developer
        </div>
        <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">API Tester</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Send text through the three-layer pipeline.{" "}
          {settings.useMockApi
            ? "Currently using the built-in mock classifier."
            : `Live endpoint: ${settings.apiUrl}`}
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-6 border-border/60 shadow-card-soft space-y-4">
          <div>
            <label className="text-xs font-semibold mb-2 block">Message to classify</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste any user message..."
              rows={5}
              className="font-mono text-sm"
            />
          </div>
          <div>
            <div className="text-xs font-semibold mb-2">Presets</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setText(p.text)}
                  className="text-[11px] px-2.5 py-1 rounded-md border border-border/60 bg-muted/50 hover:bg-primary/10 hover:border-primary/40 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={submit}
              disabled={loading}
              className="bg-gradient-primary shadow-elegant"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Classify
            </Button>
            {result && (
              <Button variant="outline" onClick={saveToQueue}>
                Send to queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 border-border/60 shadow-card-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Response</h3>
            {latency !== null && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {latency}ms
              </Badge>
            )}
          </div>
          {!result && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Run a classification to see the response.
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <RiskBadge level={result.warning} size="md" />
                <Badge variant="outline" className="gap-1">
                  <MethodIcon className="w-3 h-3" /> {result.method}
                </Badge>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Prediction
                </div>
                <div className="text-lg font-display font-bold">{result.prediction}</div>
                <div className="text-xs text-muted-foreground">{result.label}</div>
              </div>
              {result.matched_keyword && (
                <div className="p-2.5 rounded-lg bg-muted border border-border/60">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Matched
                  </div>
                  <div className="text-sm font-mono">"{result.matched_keyword}"</div>
                </div>
              )}
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                  Confidence
                </div>
                <ConfidenceBars confidence={result.confidence} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {result && (
        <Card className="p-0 border-border/60 shadow-card-soft overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/40">
            <div className="text-xs font-mono text-muted-foreground">
              POST {settings.useMockApi ? "mock://classify" : `${settings.apiUrl}/classify`}
            </div>
            <Button variant="ghost" size="sm" onClick={copyJson}>
              {copied ? (
                <Check className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 mr-1" />
              )}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto text-foreground/85 leading-relaxed">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}

      <Card className="p-6 border-border/60 shadow-card-soft">
        <h3 className="font-semibold mb-4">How the pipeline decides</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              i: Zap,
              t: "1 · Safe-phrase override",
              d: 'Whitelist idioms like "kill it with fire" return safe immediately.',
            },
            {
              i: Layers,
              t: "2 · Keyword rule layer",
              d: "Curated hate/offensive terms — fast and interpretable.",
            },
            {
              i: Cpu,
              t: "3 · ML model",
              d: "Logistic Regression + SMOTE returns per-class confidence.",
            },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="w-9 h-9 rounded-lg bg-gradient-shield grid place-items-center mb-3">
                <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-sm font-semibold">{t}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
