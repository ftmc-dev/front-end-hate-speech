import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart as PieIcon, Target } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · DiscourseGuard" }] }),
  component: AnalyticsPage,
});

const COLORS = {
  Normal: "oklch(0.62 0.15 155)",
  Offensive: "oklch(0.75 0.16 70)",
  "Hate Speech": "oklch(0.58 0.22 25)",
  primary: "oklch(0.55 0.2 268)",
  teal: "oklch(0.65 0.15 195)",
};

function AnalyticsPage() {
  const messages = useStore((s) => s.messages);

  const riskDist = useMemo(() => {
    const dist = { Normal: 0, Offensive: 0, "Hate Speech": 0 };
    messages.forEach((m) => (dist[m.prediction] += 1));
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [messages]);

  const methodBreakdown = useMemo(() => {
    const d = { safe_phrase: 0, keyword: 0, ml_model: 0 };
    messages.forEach((m) => (d[m.method] += 1));
    return [
      { name: "Safe Phrase", value: d.safe_phrase, layer: "Layer 1" },
      { name: "Keyword",     value: d.keyword,      layer: "Layer 2" },
      { name: "ML Model",    value: d.ml_model,     layer: "Layer 3" },
    ];
  }, [messages]);

  const platformBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    messages.forEach((m) => map.set(m.platform, (map.get(m.platform) ?? 0) + 1));
    return Array.from(map, ([platform, count]) => ({ platform, count }));
  }, [messages]);

  const modelPerf = [
    { class: "Normal",       Precision: 92, Recall: 94, F1: 93 },
    { class: "Offensive",    Precision: 85, Recall: 87, F1: 86 },
    { class: "Hate Speech",  Precision: 61, Recall: 56, F1: 58 },
  ];

  const tooltipStyle = { background: "white", border: "1px solid oklch(0.9 0.015 250)", borderRadius: 12, fontSize: 12 };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <header>
        <div className="text-xs font-semibold text-primary uppercase tracking-widest">Insights</div>
        <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">Analytics</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Risk distribution, detection-method usage and model performance breakdown.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 shadow-card-soft">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-primary" /> Risk distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={4}>
                  {riskDist.map((e) => <Cell key={e.name} fill={COLORS[e.name as keyof typeof COLORS] || COLORS.primary} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60 shadow-card-soft">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" /> Detection method usage
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                <XAxis dataKey="name" fontSize={11} stroke="oklch(0.5 0.03 260)" />
                <YAxis fontSize={11} stroke="oklch(0.5 0.03 260)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60 shadow-card-soft">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" /> Platform breakdown
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                <XAxis type="number" fontSize={11} stroke="oklch(0.5 0.03 260)" allowDecimals={false} />
                <YAxis type="category" dataKey="platform" fontSize={11} stroke="oklch(0.5 0.03 260)" width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={COLORS.teal} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60 shadow-card-soft">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" /> Model performance by class
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={modelPerf}>
                <PolarGrid stroke="oklch(0.9 0.015 250)" />
                <PolarAngleAxis dataKey="class" fontSize={11} stroke="oklch(0.5 0.03 260)" />
                <PolarRadiusAxis fontSize={10} stroke="oklch(0.6 0.03 260)" domain={[0, 100]} />
                <Radar name="Precision" dataKey="Precision" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.25} />
                <Radar name="Recall"    dataKey="Recall"    stroke={COLORS.teal}    fill={COLORS.teal}    fillOpacity={0.25} />
                <Radar name="F1"        dataKey="F1"        stroke={COLORS.Offensive} fill={COLORS.Offensive} fillOpacity={0.2} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/60 shadow-card-soft">
        <h3 className="font-semibold mb-4">Confusion matrix (held-out test)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 text-xs text-muted-foreground font-medium">Actual \ Predicted</th>
                <th className="p-2 text-xs text-muted-foreground font-medium">Normal</th>
                <th className="p-2 text-xs text-muted-foreground font-medium">Offensive</th>
                <th className="p-2 text-xs text-muted-foreground font-medium">Hate Speech</th>
              </tr>
            </thead>
            <tbody>
              {[
                { row: "Normal",      cells: [3821, 194, 42] },
                { row: "Offensive",   cells: [162, 2340, 88] },
                { row: "Hate Speech", cells: [38, 74, 152] },
              ].map((r, ri) => (
                <tr key={r.row}>
                  <td className="p-2 font-medium">{r.row}</td>
                  {r.cells.map((c, ci) => {
                    const isDiag = ri === ci;
                    return (
                      <td key={ci} className="p-2 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg font-mono tabular-nums text-sm ${
                          isDiag ? "bg-success/15 text-success font-semibold" : "bg-muted text-muted-foreground"
                        }`}>{c.toLocaleString()}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Diagonal = correct predictions. Off-diagonal cells reveal where the model struggles — chiefly on the minority Hate Speech class.
        </p>
      </Card>
    </div>
  );
}
