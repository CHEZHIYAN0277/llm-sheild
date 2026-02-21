import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    ArrowLeft,
    FileText,
    Upload,
    Scan,
    AlertTriangle,
    ShieldCheck,
    ShieldAlert,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE, getRiskColor, getRiskBadgeClasses } from "@/lib/types";

interface AnomalyChunk {
    chunk_index: number;
    text_preview?: string;
    reason: string;
    score_contribution: number;
}

interface ScanResult {
    document_risk_score: number;
    anomaly_chunks: AnomalyChunk[];
    threat_level: "Safe" | "Suspicious" | "High" | "Critical";
    total_chunks: number;
}

const DocumentScanner = () => {
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.name.endsWith(".txt") && !file.name.endsWith(".md") && !file.name.endsWith(".csv")) {
            setError("Only .txt, .md, and .csv files are supported.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setText(content);
            setFileName(file.name);
            setResult(null);
            setError(null);
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleScan = async () => {
        if (!text.trim()) return;
        setScanning(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/scan-document`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setError("Could not connect to backend. Make sure the server is running on port 8000.");
        } finally {
            setScanning(false);
        }
    };

    const clearAll = () => {
        setText("");
        setFileName(null);
        setResult(null);
        setError(null);
    };

    const getThreatLevelClasses = (level: string) => {
        switch (level) {
            case "Safe":
                return "bg-success/10 text-success border-success/20";
            case "Suspicious":
                return "bg-warning/10 text-warning border-warning/20";
            case "High":
                return "bg-orange-400/10 text-orange-400 border-orange-400/20";
            case "Critical":
                return "bg-critical/10 text-critical border-critical/20";
            default:
                return "";
        }
    };

    const getThreatIcon = (level: string) => {
        switch (level) {
            case "Safe":
                return <ShieldCheck className="h-5 w-5 text-success" />;
            case "Critical":
            case "High":
                return <ShieldAlert className="h-5 w-5 text-critical" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-warning" />;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top bar */}
            <nav className="shrink-0 border-b border-border/60 bg-card/60 backdrop-blur-xl z-50">
                <div className="flex h-14 items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="text-base font-semibold tracking-tight text-foreground">
                                Document Scanner
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium bg-primary/5 border border-primary/15 rounded-full px-2.5 py-0.5">
                        <FileText className="h-3 w-3" />
                        RAG Defense
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
                    {/* Upload / paste zone */}
                    <div
                        className={`relative rounded-2xl border-2 border-dashed transition-all ${dragOver
                            ? "border-primary bg-primary/5"
                            : "border-border/60 bg-card/50 hover:border-border"
                            }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        {!text ? (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Upload className="h-7 w-7 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-foreground mb-1">
                                        Drop a file here or paste text below
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supports .txt, .md, .csv files
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        Browse Files
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt,.md,.csv"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFile(file);
                                    }}
                                />
                            </div>
                        ) : (
                            /* Text editor */
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {fileName || "Pasted text"} · {text.split(/\s+/).filter(Boolean).length} words
                                        </span>
                                    </div>
                                    <button
                                        onClick={clearAll}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-critical transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Clear
                                    </button>
                                </div>
                                <textarea
                                    value={text}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        setResult(null);
                                        setFileName(null);
                                    }}
                                    className="w-full min-h-[200px] max-h-[400px] bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-mono leading-relaxed"
                                    placeholder="Paste document text here..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Scan button */}
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="gap-2.5 px-10 text-base font-semibold"
                            onClick={handleScan}
                            disabled={!text.trim() || scanning}
                        >
                            <Scan className={`h-5 w-5 ${scanning ? "animate-spin" : ""}`} />
                            {scanning ? "Scanning..." : "Scan Document"}
                        </Button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-critical/5 border border-critical/20 px-5 py-4 text-sm text-critical">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-5 animate-fade-in">
                            {/* Score card */}
                            <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        {getThreatIcon(result.threat_level)}
                                        <div>
                                            <p className="text-base font-bold text-foreground">Scan Results</p>
                                            <p className="text-xs text-muted-foreground">
                                                {result.anomaly_chunks.length === 0
                                                    ? "No threats detected"
                                                    : `${result.anomaly_chunks.length} anomalous chunk${result.anomaly_chunks.length > 1 ? "s" : ""} found in ${result.total_chunks} chunks`}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${getThreatLevelClasses(result.threat_level)}`}
                                    >
                                        {result.threat_level.toUpperCase()}
                                    </span>
                                </div>

                                {/* Risk score bar */}
                                <div className="space-y-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-extrabold tracking-tight ${getRiskColor(result.document_risk_score)}`}>
                                            {result.document_risk_score}
                                        </span>
                                        <span className="text-lg font-medium text-muted-foreground">/ 100</span>
                                    </div>
                                    <div className="relative h-3 w-full rounded-full bg-muted/50 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${result.document_risk_score <= 30
                                                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                                : result.document_risk_score <= 60
                                                    ? "bg-gradient-to-r from-amber-400 to-orange-400"
                                                    : result.document_risk_score <= 80
                                                        ? "bg-gradient-to-r from-orange-400 to-red-400"
                                                        : "bg-gradient-to-r from-red-400 to-red-500"
                                                }`}
                                            style={{ width: `${result.document_risk_score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Anomaly details */}
                            {result.anomaly_chunks.length > 0 && (
                                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-border/40">
                                        <p className="text-sm font-bold text-foreground">Detected Anomalies</p>
                                        <p className="text-xs text-muted-foreground">
                                            Chunks flagged by the scanner
                                        </p>
                                    </div>
                                    <div className="divide-y divide-border/30">
                                        {result.anomaly_chunks.map((chunk) => (
                                            <div key={chunk.chunk_index} className="px-6 py-4 flex items-start gap-4">
                                                <div className="shrink-0 h-9 w-9 rounded-xl bg-critical/10 border border-critical/20 flex items-center justify-center mt-0.5">
                                                    <span className="text-xs font-bold text-critical">#{chunk.chunk_index}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                                                        {chunk.reason.split(" | ").map((r) => (
                                                            <span
                                                                key={r}
                                                                className="inline-block rounded-full bg-critical/10 text-critical border border-critical/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide"
                                                            >
                                                                {r}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Score contribution: <span className="font-bold text-foreground">+{chunk.score_contribution}</span>
                                                    </p>
                                                    {chunk.text_preview && (
                                                        <p className="text-[11px] text-muted-foreground/70 mt-1.5 leading-relaxed italic">
                                                            "{chunk.text_preview}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Safe result message */}
                            {result.anomaly_chunks.length === 0 && (
                                <div className="rounded-2xl border border-success/20 bg-success/5 p-6 text-center">
                                    <ShieldCheck className="h-10 w-10 text-success mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-success">Document is clean</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        No poisoning patterns, semantic anomalies, or statistical outliers detected.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentScanner;
