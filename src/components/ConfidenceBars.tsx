import { cn } from "@/lib/utils";

const colors = {
  Normal: "bg-success",
  Offensive: "bg-warning",
  "Hate Speech": "bg-destructive",
} as const;

export function ConfidenceBars({
  confidence,
  compact = false,
}: {
  confidence: { Normal: number; Offensive: number; "Hate Speech": number };
  compact?: boolean;
}) {
  const entries = Object.entries(confidence) as [keyof typeof colors, number][];
  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      {entries.map(([label, val]) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "text-muted-foreground shrink-0",
              compact ? "text-[10px] w-16" : "text-xs w-20",
            )}
          >
            {label}
          </span>
          <div
            className={cn(
              "flex-1 rounded-full bg-muted overflow-hidden",
              compact ? "h-1.5" : "h-2",
            )}
          >
            <div
              className={cn("h-full rounded-full transition-all", colors[label])}
              style={{ width: `${(val * 100).toFixed(1)}%` }}
            />
          </div>
          <span
            className={cn(
              "tabular-nums font-medium text-foreground",
              compact ? "text-[10px] w-9" : "text-xs w-12",
            )}
          >
            {(val * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
