import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
        variant === "default" && "bg-muted text-muted-foreground",
        variant === "accent" &&
          "bg-accent/20 text-accent ring-1 ring-accent/25",
        variant === "success" &&
          "bg-success-muted text-success ring-1 ring-success/20",
        className
      )}
      {...props}
    />
  );
}
