import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent text-sm",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
