import { ShieldCheck, ShieldX, Activity, AlertTriangle, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";

interface ThreatMonitorProps {
  metrics: DashboardMetrics;
}

const cards: {
  key: keyof DashboardMetrics;
  label: string;
  icon: LucideIcon;
  accentClass: string;
  iconBg: string;
  trend: string;
  trendUp: boolean;
}[] = [
  { key: "totalRequests", label: "Total Requests", icon: Activity, accentClass: "text-primary", iconBg: "bg-primary/10", trend: "+12%", trendUp: true },
  { key: "blockedAttempts", label: "Blocked Attacks", icon: ShieldX, accentClass: "text-critical", iconBg: "bg-critical/10", trend: "+3%", trendUp: true },
  { key: "safePrompts", label: "Safe Prompts", icon: ShieldCheck, accentClass: "text-success", iconBg: "bg-success/10", trend: "+8%", trendUp: true },
  { key: "highRiskEvents", label: "High Risk Events", icon: AlertTriangle, accentClass: "text-warning", iconBg: "bg-warning/10", trend: "-2%", trendUp: false },
];

const ThreatMonitor = ({ metrics }: ThreatMonitorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, accentClass, iconBg, trend, trendUp }) => (
        <div
          key={key}
          className="group rounded-[20px] border border-border/60 bg-card/80 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/[0.06] shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`h-10 w-10 rounded-2xl ${iconBg} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${accentClass}`} />
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendUp ? "text-success" : "text-critical"}`}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-foreground leading-none mb-1.5">
            {metrics[key].toLocaleString()}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default ThreatMonitor;
