import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, BarChart3, X } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import ThreatMonitor from "@/components/ThreatMonitor";
import ThreatGauge from "@/components/ThreatGauge";
import AttackSimulation from "@/components/AttackSimulation";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import type { AnalysisResult, DashboardMetrics } from "@/lib/types";
import { getRiskLevel, API_BASE } from "@/lib/types";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [latestScore, setLatestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRequests: 0,
    blockedAttempts: 0,
    safePrompts: 0,
    highRiskEvents: 0,
  });

  const handleAnalyze = useCallback(async (prompt: string): Promise<AnalysisResult> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      // Map backend snake_case response to frontend camelCase
      const threatScore = data.threat_score ?? data.input_threat_score ?? 0;
      const blocked = data.blocked ?? false;
      const action = data.action ?? (blocked ? "BLOCK" : "ALLOW");

      const result: AnalysisResult = {
        prompt,
        threatScore,
        riskLevel: getRiskLevel(threatScore),
        blocked,
        action,
        reason: data.reason,
        matchedPattern: data.matched_pattern,
        stage: data.stage ? (data.stage.charAt(0).toUpperCase() + data.stage.slice(1)) as "Input" | "Output" : undefined,
        response: data.response ?? data.message,
      };

      setLatestScore(result.threatScore);
      setMetrics((prev) => ({
        totalRequests: prev.totalRequests + 1,
        blockedAttempts: prev.blockedAttempts + (result.blocked ? 1 : 0),
        safePrompts: prev.safePrompts + (result.blocked ? 0 : 1),
        highRiskEvents: prev.highRiskEvents + (result.threatScore >= 80 ? 1 : 0),
      }));
      return result;
    } catch (err) {
      // If backend is unreachable, return error result
      const errorResult: AnalysisResult = {
        prompt,
        threatScore: 0,
        riskLevel: "SAFE",
        blocked: false,
        reason: "Backend unreachable. Make sure the FastAPI server is running on port 8000.",
        response: "⚠️ Could not connect to LLM Shield backend.",
      };
      setLatestScore(0);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <nav className="shrink-0 border-b border-border/60 bg-card/60 backdrop-blur-xl z-50">
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-base font-semibold tracking-tight text-foreground">LLM Shield</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="h-4 w-4" />
            {showStats ? "Hide Stats" : "Show Stats"}
          </Button>
        </div>
      </nav>

      {/* Stats overlay — Glacier glass panel */}
      {showStats && (
        <div className="fixed inset-0 z-40 pt-14" onClick={() => setShowStats(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" />
          {/* Panel */}
          <div
            className="relative z-10 mx-4 sm:mx-auto max-w-screen-lg mt-4 rounded-[24px] border border-border/60 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-2xl shadow-xl overflow-hidden animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Security Analytics</p>
                  <p className="text-xs text-muted-foreground">Real-time threat intelligence overview</p>
                </div>
              </div>
              <button
                onClick={() => setShowStats(false)}
                className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Panel content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid gap-5 lg:grid-cols-[1fr_2.5fr]">
                <ThreatGauge score={latestScore} />
                <ThreatMonitor metrics={metrics} />
              </div>
              <AnalyticsCharts metrics={metrics} />
              <AttackSimulation />
            </div>
          </div>
        </div>
      )}

      {/* Chat — fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatPanel onAnalyze={handleAnalyze} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
