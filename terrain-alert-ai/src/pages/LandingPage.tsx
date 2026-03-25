import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, Brain, Shield, Wifi } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Rockfall Terrain Alert AI</h1>
                <p className="text-xs text-muted-foreground">Predictive mine safety platform</p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button>
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 via-background to-warning/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-4xl font-bold leading-tight md:text-6xl">Predict Rockfalls Before They Happen</h2>
            <p className="text-lg text-muted-foreground md:text-xl">
              XGBoost-powered risk inference combines IoT sensor streams and Glass Box transparency to highlight the
              top factors behind each alert in real time.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-primary" />
                    XGBoost Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">F1 0.82 and recall-focused safety scoring.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-base">
                    <Wifi className="h-4 w-4 text-primary" />
                    IoT Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Continuous telemetry with 30-second live updates.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-primary" />
                    Glass Box
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Top-factor chart makes every alert explainable and actionable.
                </CardContent>
              </Card>
            </div>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button size="lg">
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Rockfall Terrain Alert AI</h3>
                <p className="text-xs text-muted-foreground">Open-pit mine risk intelligence</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Unified React + FastAPI + XGBoost system</div>
            <div>
              <Link to="/dashboard">
                <Button variant="outline">
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
