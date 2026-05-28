import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors duration-200",
              i === current &&
                "bg-accent text-accent-foreground ring-2 ring-accent/40 shadow-sm",
              i < current &&
                "bg-accent/25 text-accent border border-accent/30",
              i > current &&
                "bg-card border border-border text-muted-foreground"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "text-sm hidden sm:inline",
              i <= current ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className="w-8 h-px bg-border mx-1 hidden sm:block" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
