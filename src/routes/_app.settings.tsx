import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, RotateCcw, CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { store, useStore } from "@/lib/store";
import { pingApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · DiscourseGuard" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);
  const [useMock, setUseMock] = useState(settings.useMockApi);
  const [autoModerate, setAutoModerate] = useState(settings.autoModerate);
  const [strikeLimit, setStrikeLimit] = useState(settings.strikeLimit);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs?: number; error?: string } | null>(null);

  const save = () => {
    store.setSettings({ apiUrl, useMockApi: useMock, autoModerate, strikeLimit });
    toast.success("Settings saved");
  };

  const ping = async () => {
    setPinging(true);
    setPingResult(null);
    const r = await pingApi(apiUrl);
    setPingResult(r);
    setPinging(false);
    if (r.ok) toast.success(`API reachable in ${r.latencyMs}ms`);
    else toast.error(`API unreachable: ${r.error}`);
  };

  const reset = () => {
    if (!confirm("Reset all data (messages, users, settings)?")) return;
    store.resetAll();
    toast.success("All data reset to defaults");
  };

  const clearMessages = () => {
    if (!confirm("Clear all messages from the queue?")) return;
    store.clearMessages();
    toast.success("Queue cleared");
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <header>
        <div className="text-xs font-semibold text-primary uppercase tracking-widest">Configuration</div>
        <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Point the dashboard at your live Flask API on Railway, or use the built-in mock for demos.
        </p>
      </header>

      <Card className="p-6 border-border/60 shadow-card-soft space-y-6">
        <div>
          <h3 className="font-semibold mb-1">Flask API endpoint</h3>
          <p className="text-xs text-muted-foreground mb-4">The deployed Railway URL that serves <span className="font-mono">/classify</span> and <span className="font-mono">/health</span>.</p>
          <div className="grid gap-3">
            <div>
              <Label htmlFor="apiUrl" className="text-xs mb-1.5 block">API URL</Label>
              <div className="flex gap-2">
                <Input
                  id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-app.up.railway.app"
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={ping} disabled={pinging}>
                  {pinging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ping"}
                </Button>
              </div>
              {pingResult && (
                <div className={`mt-2 text-xs flex items-center gap-1.5 ${pingResult.ok ? "text-success" : "text-destructive"}`}>
                  {pingResult.ok
                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> Reachable · {pingResult.latencyMs}ms</>
                    : <><XCircle className="w-3.5 h-3.5" /> {pingResult.error}</>}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/60">
              <div>
                <div className="text-sm font-medium">Use mock classifier</div>
                <div className="text-xs text-muted-foreground">Skip network calls — great for demos and offline development.</div>
              </div>
              <Switch checked={useMock} onCheckedChange={setUseMock} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border/60 shadow-card-soft space-y-4">
        <h3 className="font-semibold">Moderation policy</h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/60">
          <div>
            <div className="text-sm font-medium">Auto-moderate high-risk messages</div>
            <div className="text-xs text-muted-foreground">Delete + strike users automatically without waiting for review.</div>
          </div>
          <Switch checked={autoModerate} onCheckedChange={setAutoModerate} />
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium">Strike limit before ban</div>
              <div className="text-xs text-muted-foreground">Number of strikes before automatic ban.</div>
            </div>
            <span className="text-2xl font-display font-bold text-primary tabular-nums">{strikeLimit}</span>
          </div>
          <Slider value={[strikeLimit]} min={1} max={5} step={1} onValueChange={(v) => setStrikeLimit(v[0])} />
        </div>
      </Card>

      <Card className="p-6 border-border/60 shadow-card-soft">
        <h3 className="font-semibold mb-3">Model information</h3>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            ["Algorithm", "Logistic Regression + SMOTE"],
            ["Features",  "TF-IDF (5,000 dims)"],
            ["Training samples", "27,510"],
            ["Classes",   "Normal · Offensive · Hate Speech"],
            ["Accuracy",  "≈ 88%"],
            ["Macro F1",  "≈ 0.74"],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-lg bg-muted/40 border border-border/60">
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{k}</dt>
              <dd className="text-sm font-medium mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" className="text-muted-foreground" onClick={clearMessages}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear queue
          </Button>
          <Button variant="outline" className="text-destructive" onClick={reset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset all data
          </Button>
        </div>
        <Button onClick={save} className="bg-gradient-primary shadow-elegant">
          <Save className="w-4 h-4 mr-1" /> Save settings
        </Button>
      </div>
    </div>
  );
}
