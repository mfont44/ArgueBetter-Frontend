"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", labelKey: "theme.light" as const },
  { value: "dark", labelKey: "theme.dark" as const },
  { value: "system", labelKey: "theme.system" as const },
] as const;

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export function ThemeSelector({ compact, className }: ThemeSelectorProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          compact ? "h-8" : "h-10",
          "rounded-xl bg-muted animate-pulse",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      role="group"
      aria-label={t("theme.appearance")}
      className={cn(
        "inline-flex rounded-xl border border-border bg-muted p-0.5",
        compact ? "w-full" : "",
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={cn(
            "flex-1 rounded-[10px] font-medium transition-colors duration-200 ease-out",
            compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
            theme === opt.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
