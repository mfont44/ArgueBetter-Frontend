import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/[0.06] dark:shadow-md dark:shadow-black/30",
        className
      )}
      {...props}
    />
  );
}
