import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ShieldCheck, AlertOctagon, AlertTriangle, MessageSquare, Users, Activity,
  TrendingUp, ArrowRight, Zap, Cpu, Layers,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceBars } from "@/components/ConfidenceBars";
import { RiskBadge } from "@/components/RiskBadge";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · DiscourseGuard" }] }),
  component: Dashboard,
});

function Dashboard() {
  const messages = useStore((s) => s.messages);
  const users = useStore((s) => s.users);

  const stats = useMemo(() => {
    const total = messages.length;
    const high = messages.filter((m) => m.warning === "high").length;
    const medium = messages.filter((m) => m.warning === "medium").length;
    const safe = messages.filter((m) => m.warning === "safe").length;
    const actioned = messages.filter((m) => m.action !== "none" && m.action !== "logged").length;
    return { total, high, medium, safe, actioned };
  }, [messages]);

  const activity = useMemo(() => {
    const buckets: { hour: string; flagged: number; hate: number }[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const label = `${d.getHours().toString().padStart(2, "0")}h`;
      const t0 = d.getTime() - 1800000, t1 = d.getTime() + 1800000;
      const inRange = messages.filter((m) => m.createdAt >= t0 && m.createdAt <= t1);
      buckets.push({
        hour: label,
        flagged: inRange.length,
        hate: inRange.filter((m) => m.warning === "high").length,
      });
    }
    return buckets;
  }, [messages]);

  const recent = messages.slice(0, 5);
  const bannedCount = users.filter((u) => u.status === "banned").length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">Overview</div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold">Moderation Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Real-time view of the DiscourseGuard pipeline across all connected platforms.
          </p>
        </div>
        <Button asChild className="bg-gradient-primary shadow-elegant">
          <Link to="/api-tester">Test a message <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </Button>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={MessageSquare} label="Messages processed" value={stats.total.toLocaleString()} sub={`${stats.actioned} actioned`} tone="primary" />
        <KPI icon={AlertOctagon} label="High-risk detected" value={stats.high.toString()} sub={`${((stats.high / Math.max(1, stats.total)) * 100).toFixed(1)}% of traffic`} tone="destructive" />
        <KPI icon={AlertTriangle} label="Medium-risk" value={stats.medium.toString()} sub="Public warnings issued" tone="warning" />
        <KPI icon={Users} label="Tracked users" value={users.length.toString()} sub={`${activeUsers} active · ${bannedCount} banned`} tone="success" />
      </div>

      {/* Activity + Pipeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border/60 shadow-card-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Detection activity — last 24h
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Flagged messages per hour, high-risk overlay</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Live</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="flagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.2 268)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.55 0.2 268)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.22 25)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.58 0.22 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                <XAxis dataKey="hour" fontSize={10} stroke="oklch(0.5 0.03 260)" />
                <YAxis fontSize={10} stroke="oklch(0.5 0.03 260)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "white", border: "1px solid oklch(0.9 0.015 250)",
                    borderRadius: 12, fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="flagged" stroke="oklch(0.55 0.2 268)" fill="url(#flagged)" strokeWidth={2} />
                <Area type="monotone" dataKey="hate" stroke="oklch(0.58 0.22 25)" fill="url(#hate)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60 shadow-card-soft">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" /> Pipeline health
          </h3>
          <div className="space-y-3">
            {[
              { i: Zap,    t: "Safe-Phrase Layer", s: "Operational", tone: "success" },
              { i: Layers, t: "Keyword Layer",     s: "Operational", tone: "success" },
              { i: Cpu,    t: "ML Model (LR+SMOTE)", s: "Ready · 0.74 F1", tone: "success" },
            ].map(({ i: Icon, t, s, tone }) => (
              <div key={t} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 grid place-items-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t}</div>
                    <div className={`text-[11px] text-${tone}`}>{s}</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              Model trained on 27,510 samples · 3 classes
            </div>
          </div>
        </Card>
      </div>

      {/* Recent flags */}
      <Card className="p-6 border-border/60 shadow-card-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Recent flags</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest classifications from all platforms</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/messages">View queue <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
          </Button>
        </div>
        <div className="space-y-3">
          {recent.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">No messages yet. Try the API tester.</div>
          )}
          {recent.map((m) => (
            <div key={m.id} className="p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold">{m.author}</span>
                    <span className="text-[11px] text-muted-foreground">{m.platform} · {m.channel}</span>
                    <RiskBadge level={m.warning} />
                    <Badge variant="outline" className="text-[10px] font-mono">{m.method}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-foreground/90 line-clamp-2">{m.content}</p>
                </div>
                <div className="w-48 shrink-0 hidden md:block">
                  <ConfidenceBars confidence={m.confidence} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KPI({
  icon: Icon, label, value, sub, tone,
}: {
  icon: typeof MessageSquare; label: string; value: string; sub: string;
  tone: "primary" | "destructive" | "warning" | "success";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/20 text-warning-foreground",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <Card className="p-5 border-border/60 shadow-card-soft">
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${toneClasses}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-4 text-2xl font-display font-bold tabular-nums">{value}</div>
      <div className="text-xs font-medium text-foreground mt-0.5">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </Card>
  );
}
