import { Shield } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            LLM Shield
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground leading-tight">System Active</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Firewall Running</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
