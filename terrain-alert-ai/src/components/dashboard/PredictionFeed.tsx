import type { Prediction } from "@/services/api";

interface PredictionFeedProps {
  items: Prediction[];
}

const tone: Record<Prediction["risk_level"], string> = {
  LOW: "text-safe",
  MEDIUM: "text-warning-foreground",
  HIGH: "text-danger",
};

export function PredictionFeed({ items }: PredictionFeedProps) {
  return (
    <div className="h-72 space-y-2 overflow-y-auto rounded-md border bg-muted/20 p-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No predictions yet.</p>
      ) : (
        items.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`} className="rounded border bg-card p-2 text-sm">
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${tone[entry.risk_level]}`}>{entry.risk_level}</span>
              <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Score: {(entry.risk_score * 100).toFixed(0)}%</p>
          </div>
        ))
      )}
    </div>
  );
}

