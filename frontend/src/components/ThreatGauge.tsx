import { Shield } from "lucide-react";
import { getRiskLevel, getRiskBadgeClasses } from "@/lib/types";

interface ThreatGaugeProps {
  score: number;
}

const ThreatGauge = ({ score }: ThreatGaugeProps) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const percentage = clampedScore / 100;
  const riskLevel = getRiskLevel(clampedScore);

  const getGradient = (s: number): string => {
    if (s <= 30) return "from-emerald-400 to-emerald-500";
    if (s <= 60) return "from-amber-400 to-orange-400";
    if (s <= 80) return "from-orange-400 to-red-400";
    return "from-red-400 to-red-500";
  };

  return (
    <div className="relative rounded-[20px] border border-border/60 bg-card/80 backdrop-blur-xl p-6 flex flex-col justify-between h-full shadow-lg shadow-primary/[0.04] overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Threat Level</p>
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-extrabold tracking-tight text-foreground">
            {clampedScore}
          </span>
          <span className="text-lg font-medium text-muted-foreground">/ 100</span>
        </div>

        <div className="space-y-3">
          <div className="relative h-3 w-full rounded-full bg-muted/50 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getGradient(clampedScore)} transition-all duration-700 ease-out`}
              style={{ width: `${percentage * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-[10px] text-muted-foreground font-medium">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${getRiskBadgeClasses(riskLevel)}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatGauge;
