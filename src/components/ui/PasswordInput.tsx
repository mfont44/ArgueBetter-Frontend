"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-3 my-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
      >
        {isVisible ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
            <path
              d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M16.68 16.68A9.72 9.72 0 0 1 12 18c-5 0-9-6-9-6a17.56 17.56 0 0 1 5.02-4.77M9.88 5.09A9.67 9.67 0 0 1 12 6c5 0 9 6 9 6a17.73 17.73 0 0 1-3.23 3.87"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
            <path
              d="M2.46 12S5.73 6 12 6s9.54 6 9.54 6-3.27 6-9.54 6S2.46 12 2.46 12Z"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" strokeWidth="1.75" />
          </svg>
        )}
      </button>
    </div>
  );
}
