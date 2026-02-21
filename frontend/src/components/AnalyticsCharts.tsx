import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { DashboardMetrics } from "@/lib/types";

interface AnalyticsChartsProps {
  metrics: DashboardMetrics;
}

const AnalyticsCharts = ({ metrics }: AnalyticsChartsProps) => {
  const donutData = [
    { name: "Safe", value: metrics.safePrompts, color: "hsl(142, 71%, 45%)" },
    { name: "Blocked", value: metrics.blockedAttempts, color: "hsl(0, 84%, 60%)" },
    { name: "High Risk", value: metrics.highRiskEvents, color: "hsl(32, 95%, 44%)" },
  ];

  const lineData = [
    { time: "Mon", threats: 8, safe: 180 },
    { time: "Tue", threats: 12, safe: 210 },
    { time: "Wed", threats: 6, safe: 195 },
    { time: "Thu", threats: 15, safe: 220 },
    { time: "Fri", threats: 9, safe: 200 },
    { time: "Sat", threats: 4, safe: 140 },
    { time: "Sun", threats: 7, safe: 160 },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Donut Chart */}
      <div className="rounded-[20px] border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-sm">
        <p className="text-sm font-bold text-foreground mb-1">Threat Distribution</p>
        <p className="text-xs text-muted-foreground mb-4">Safe vs Blocked vs High Risk</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(210, 50%, 99%)",
                  border: "1px solid hsl(213, 32%, 89%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-5 mt-2">
          {donutData.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="font-medium">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="rounded-[20px] border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-sm">
        <p className="text-sm font-bold text-foreground mb-1">Threat Attempts Over Time</p>
        <p className="text-xs text-muted-foreground mb-4">Weekly overview</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 32%, 89%)" strokeOpacity={0.5} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(210, 50%, 99%)",
                  border: "1px solid hsl(213, 32%, 89%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="threats"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(0, 84%, 60%)" }}
                name="Threats"
              />
              <Line
                type="monotone"
                dataKey="safe"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(142, 71%, 45%)" }}
                name="Safe"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
