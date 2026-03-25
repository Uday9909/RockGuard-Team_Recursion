import { Badge } from "@/components/ui/badge";

interface RiskGaugeProps {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
}

const levelTheme: Record<RiskGaugeProps["level"], { ring: string; text: string; badge: string }> = {
  LOW: { ring: "from-safe to-safe/30", text: "text-safe", badge: "bg-safe/15 text-safe border-safe/30" },
  MEDIUM: {
    ring: "from-warning to-warning/30",
    text: "text-warning-foreground",
    badge: "bg-warning/20 text-warning-foreground border-warning/30",
  },
  HIGH: {
    ring: "from-danger to-danger/30",
    text: "text-danger",
    badge: "bg-danger/20 text-danger border-danger/30",
  },
};

export function RiskGauge({ score, level }: RiskGaugeProps) {
  const normalized = Math.max(0, Math.min(100, Math.round(score * 100)));
  const theme = levelTheme[level];

  return (
    <div className="flex items-center gap-6">
      <div className={`relative h-36 w-36 rounded-full bg-gradient-to-br ${theme.ring} p-2`}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
          <div className="text-center">
            <div className={`text-4xl font-bold ${theme.text}`}>{normalized}%</div>
            <p className="text-xs text-muted-foreground">Risk Score</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Badge className={theme.badge}>{level} RISK</Badge>
        <p className="max-w-xs text-sm text-muted-foreground">
          Score bands: LOW (&lt;0.3), MEDIUM (0.3-0.6), HIGH (&gt;0.6)
        </p>
      </div>
    </div>
  );
}

