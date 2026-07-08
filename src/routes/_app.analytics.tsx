import { useMemo } from "react";
import { PieChart as PieIcon } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { Card } from "@/components/ui/card";
import { useFetchMessages } from "@/hooks/useFetchMessages.ts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · DiscourseGuard" }] }),
  component: AnalyticsPage,
});

const COLORS = {
  Offensive: "oklch(0.75 0.16 70)",
  "Hate Speech": "oklch(0.58 0.22 25)",
  primary: "oklch(0.55 0.2 268)",
  teal: "oklch(0.65 0.15 195)",
};

function AnalyticsPage() {
  const { data: messages = [] } = useFetchMessages();

  const riskDist = useMemo(() => {
    const dist = { Normal: 0, Offensive: 0, "Hate Speech": 0 };
    messages.forEach((m) => {
      dist.Offensive += m.offensive_score ?? 0;
      dist["Hate Speech"] += m.hate_score ?? 0;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [messages]);

  const tooltipStyle = {
    background: "white",
    border: "1px solid oklch(0.9 0.015 250)",
    borderRadius: 12,
    fontSize: 12,
  };

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
                <Pie
                  data={riskDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={55}
                  paddingAngle={4}
                >
                  {riskDist.map((e) => (
                    <Cell
                      key={e.name}
                      fill={COLORS[e.name as keyof typeof COLORS] || COLORS.primary}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
