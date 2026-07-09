import { useMemo } from "react";
import { PieChart as PieIcon } from "lucide-react";

import { Strike } from "@/services/api";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  Offensive: "oklch(0.75 0.16 70)",
  "Hate Speech": "oklch(0.58 0.22 25)",
  primary: "oklch(0.55 0.2 268)",
  teal: "oklch(0.65 0.15 195)",
};

export function RiskDistribution({ strikes }: { strikes: Strike[] }) {
  const riskDist = useMemo(() => {
    const dist = { Offensive: 0, "Hate Speech": 0 };
    strikes.forEach((m) => {
      dist.Offensive += m.offensive_score ?? 0;
      dist["Hate Speech"] += m.hate_score ?? 0;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [strikes]);

  const tooltipStyle = {
    background: "white",
    border: "1px solid oklch(0.9 0.015 250)",
    borderRadius: 12,
    fontSize: 12,
  };

  return (
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
                <Cell key={e.name} fill={COLORS[e.name as keyof typeof COLORS] || COLORS.primary} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
