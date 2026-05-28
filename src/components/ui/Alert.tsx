import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Alert({
  className,
  variant = "info",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "info" | "error" | "warning" }) {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 text-sm transition-colors duration-200",
        variant === "info" && "bg-muted text-foreground",
        variant === "error" &&
          "bg-destructive-muted text-destructive border border-destructive/20",
        variant === "warning" &&
          "bg-warning-muted text-warning border border-warning/20",
        className
      )}
      {...props}
    />
  );
}
