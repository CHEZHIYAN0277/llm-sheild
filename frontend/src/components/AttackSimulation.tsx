import { useState } from "react";
import { Swords, Play } from "lucide-react";
import type { SimulationResult } from "@/lib/types";
import { getRiskColor, API_BASE } from "@/lib/types";

const AttackSimulation = () => {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [running, setRunning] = useState(false);

  const runSimulation = async () => {
    setRunning(true);
    setResults([]);

    try {
      const res = await fetch(`${API_BASE}/simulate-attacks`, {
        method: "POST",
      });
      const data = await res.json();

      // Animate results one by one
      const mapped: SimulationResult[] = data.results.map((r: any) => ({
        prompt: r.prompt,
        threatScore: r.threat_score,
        status: r.blocked ? "Blocked" : "Allowed",
        stage: r.stage ? (r.stage.charAt(0).toUpperCase() + r.stage.slice(1)) as "Input" | "Output" : "Input",
      }));

      mapped.forEach((result, i) => {
        setTimeout(() => {
          setResults((prev) => [...prev, result]);
          if (i === mapped.length - 1) setRunning(false);
        }, (i + 1) * 300);
      });
    } catch (err) {
      setResults([{
        prompt: "Error: Could not connect to backend",
        threatScore: 0,
        status: "Allowed",
        stage: "Input",
      }]);
      setRunning(false);
    }
  };

  return (
    <div className="rounded-[20px] border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Swords className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Attack Simulation</p>
            <p className="text-xs text-muted-foreground">Red Team Testing</p>
          </div>
        </div>
        <button
          onClick={runSimulation}
          disabled={running}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-500 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="h-3.5 w-3.5" />
          {running ? "Running..." : "Run Simulation"}
        </button>
      </div>

      {/* Table */}
      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prompt</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0 animate-fade-in">
                  <td className="px-6 py-3.5 text-xs text-foreground max-w-[300px] truncate">{r.prompt}</td>
                  <td className={`px-5 py-3.5 text-center font-bold text-xs ${getRiskColor(r.threatScore)}`}>{r.threatScore}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${r.status === "Blocked"
                        ? "bg-critical/10 text-critical"
                        : "bg-success/10 text-success"
                      }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-muted-foreground">{r.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[140px] text-muted-foreground/50 text-sm gap-1">
          <Swords className="h-6 w-6 mb-1 opacity-30" />
          Run a simulation to see results
        </div>
      )}
    </div>
  );
};

export default AttackSimulation;
