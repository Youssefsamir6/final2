import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types/api";

const map: Record<
  Severity,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10",
  },
  warning: {
    label: "Warning",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/10",
  },
  critical: {
    label: "Critical",
    className: "border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/10",
  },
};

export function StatusBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const s = map[severity];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs", s.className, className)}
    >
      {s.label}
    </Badge>
  );
}

