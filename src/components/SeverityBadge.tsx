import { cn } from "@/lib/utils";

type Sev = "GREEN" | "AMBER" | "RED" | string | undefined | null;

export function SeverityBadge({ severity, className, soft = false }: { severity: Sev; className?: string; soft?: boolean }) {
  const s = (severity ?? "").toString().toUpperCase();
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase";
  const map: Record<string, string> = soft
    ? {
        GREEN: "bg-severity-green-soft text-severity-green-softForeground",
        AMBER: "bg-severity-amber-soft text-severity-amber-softForeground",
        RED: "bg-severity-red-soft text-severity-red-softForeground",
      }
    : {
        GREEN: "bg-severity-green text-severity-green-foreground",
        AMBER: "bg-severity-amber text-severity-amber-foreground",
        RED: "bg-severity-red text-severity-red-foreground",
      };
  const cls = map[s] ?? "bg-muted text-muted-foreground";
  const dot = s === "GREEN" ? "bg-severity-green" : s === "AMBER" ? "bg-severity-amber" : s === "RED" ? "bg-severity-red" : "bg-muted-foreground";
  return (
    <span className={cn(base, cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot, soft ? "" : "bg-white/80")} />
      {s || "—"}
    </span>
  );
}
