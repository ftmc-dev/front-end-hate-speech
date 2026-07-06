import { AlertOctagon, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import type { RiskLevel } from "@/lib/store";
import { cn } from "@/lib/utils";

const map: Record<RiskLevel, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  safe:   { label: "Safe",     cls: "bg-success/15 text-success border-success/30",           Icon: ShieldCheck },
  low:    { label: "Low",      cls: "bg-chart-2/15 text-chart-2 border-chart-2/30",           Icon: Info },
  medium: { label: "Medium",   cls: "bg-warning/20 text-warning-foreground border-warning/40",Icon: AlertTriangle },
  high:   { label: "High",     cls: "bg-destructive/15 text-destructive border-destructive/40",Icon: AlertOctagon },
};

export function RiskBadge({ level, size = "sm" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const { label, cls, Icon } = map[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        cls,
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {label} Risk
    </span>
  );
}
