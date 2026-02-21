// Backend API base URL
export const API_BASE = "http://localhost:8000";

export interface AnalysisResult {
  prompt: string;
  response?: string;
  threatScore: number;
  riskLevel: "SAFE" | "SUSPICIOUS" | "HIGH" | "CRITICAL";
  blocked: boolean;
  reason?: string;
  matchedPattern?: string | null;
  action?: "ALLOW" | "WARN" | "REQUIRE_CONFIRMATION" | "BLOCK";
  stage?: "Input" | "Output";
}

export interface DashboardMetrics {
  totalRequests: number;
  blockedAttempts: number;
  safePrompts: number;
  highRiskEvents: number;
}

export interface SimulationResult {
  prompt: string;
  threatScore: number;
  status: "Blocked" | "Allowed";
  stage: "Input" | "Output";
}

export const getRiskColor = (score: number): string => {
  if (score <= 30) return "text-success";
  if (score <= 60) return "text-warning";
  if (score <= 80) return "text-orange-400";
  return "text-critical";
};

export const getRiskLevel = (score: number): AnalysisResult["riskLevel"] => {
  if (score <= 30) return "SAFE";
  if (score <= 60) return "SUSPICIOUS";
  if (score <= 80) return "HIGH";
  return "CRITICAL";
};

export const getRiskBadgeClasses = (level: AnalysisResult["riskLevel"]): string => {
  switch (level) {
    case "SAFE": return "bg-success/10 text-success";
    case "SUSPICIOUS": return "bg-warning/10 text-warning";
    case "HIGH": return "bg-orange-400/10 text-orange-400";
    case "CRITICAL": return "bg-critical/10 text-critical";
  }
};
