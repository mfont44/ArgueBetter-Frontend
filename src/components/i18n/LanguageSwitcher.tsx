"use client";

import { useRouter } from "next/navigation";
import {
  localeCookieName,
  localeLabel,
  supportedLocales,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";
import { useI18n } from "./LocaleProvider";
import { cn } from "@/lib/utils";

const LOCALE_NAME_KEYS: Record<Locale, TranslationKey> = {
  en: "language.en",
  ca: "language.ca",
  es: "language.es",
};

interface LanguageSwitcherProps {
  variant?: "tabs" | "menu";
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = "tabs",
  compact,
  className,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, t } = useI18n();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  if (variant === "menu") {
    return (
      <div
        role="group"
        aria-label={t("language.label")}
        className={cn("flex flex-col gap-0.5", className)}
      >
        {supportedLocales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors",
              locale === loc
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span>{t(LOCALE_NAME_KEYS[loc])}</span>
            {locale === loc && (
              <span className="text-accent text-xs" aria-hidden>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex rounded-xl border border-border bg-muted p-0.5",
        compact ? "w-full" : "",
        className
      )}
    >
      {supportedLocales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={cn(
            "flex-1 rounded-[10px] font-medium transition-colors duration-200 ease-out",
            compact ? "px-2 py-1.5 text-xs" : "px-2.5 py-1.5 text-xs",
            locale === loc
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {localeLabel(loc)}
        </button>
      ))}
    </div>
  );
}
