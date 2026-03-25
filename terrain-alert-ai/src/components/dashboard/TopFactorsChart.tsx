import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TopFactor } from "@/services/api";

interface TopFactorsChartProps {
  factors: TopFactor[];
}

const impactValue: Record<TopFactor["impact"], number> = { low: 0.35, medium: 0.65, high: 0.95 };
const impactColor: Record<TopFactor["impact"], string> = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

export function TopFactorsChart({ factors }: TopFactorsChartProps) {
  const data = factors.map((factor) => ({
    name: factor.feature.replaceAll("_", " "),
    impact: impactValue[factor.impact],
    value: String(factor.value),
    level: factor.impact as TopFactor["impact"],
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
            {data.map((item) => (
              <Cell key={`${item.name}-${item.level}`} fill={impactColor[item.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
