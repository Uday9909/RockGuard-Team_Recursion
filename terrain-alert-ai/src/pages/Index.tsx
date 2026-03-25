import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PredictionFeed } from "@/components/dashboard/PredictionFeed";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { TopFactorsChart } from "@/components/dashboard/TopFactorsChart";
import { getHistory, getSimulatedReading, type Prediction, type SimulatedReading } from "@/services/api";

const demoReading: SimulatedReading = {
  risk_score: 0.78,
  risk_level: "HIGH",
  top_factors: [
    { feature: "Rainfall_mm", value: 98.2, impact: "high" },
    { feature: "Prior_Events", value: 3, impact: "high" },
    { feature: "Slope_deg", value: 37.4, impact: "medium" },
  ],
  recommendation: "Restrict access to Zone B. Monitor continuously.",
  timestamp: "2026-01-15T10:30:00Z",
  sensor_values: {
    Slope_deg: 37.4,
    Elevation_m: 410.2,
    Rainfall_mm: 98.2,
    Prior_Events: 3,
    Distance_to_fault_km: 0.9,
    Fracture_Density: 0.82,
    Rock_Hardness: 6,
    Temperature_C: 26.4,
    Humidity_percent: 84.0,
    Wind_speed_kmh: 17.5,
    Month: 7,
    Season: "Monsoon",
  },
};

const demoHistory: Prediction[] = [
  demoReading,
  { ...demoReading, risk_score: 0.64, risk_level: "HIGH", timestamp: "2026-01-15T10:00:00Z" },
  { ...demoReading, risk_score: 0.47, risk_level: "MEDIUM", timestamp: "2026-01-15T09:30:00Z" },
];

const Index = () => {
  const simulateQuery = useQuery({
    queryKey: ["simulate"],
    queryFn: getSimulatedReading,
    refetchInterval: 30000,
  });

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
    refetchInterval: 30000,
  });

  const offlineDemoMode = Boolean(simulateQuery.error || historyQuery.error);
  const reading = simulateQuery.data ?? demoReading;
  const history = historyQuery.data ?? demoHistory;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Terrain Alert Dashboard</h1>
              <p className="text-sm text-muted-foreground">Live inference every 30 seconds</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        {offlineDemoMode && (
          <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
            API Offline — Running in Demo Mode
          </div>
        )}

        {simulateQuery.isLoading && (
          <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">Loading live prediction...</div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RiskGauge score={reading.risk_score} level={reading.risk_level} />
              <p className="rounded bg-muted/30 p-3 text-sm">{reading.recommendation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Sensor Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(reading.sensor_values).map(([key, value]) => (
                <div key={key} className="rounded border bg-muted/20 p-2">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Glass Box: Top Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <TopFactorsChart factors={reading.top_factors} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last 20 Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <PredictionFeed items={history.slice(0, 20)} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
