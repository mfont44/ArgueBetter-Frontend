"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { normalizeFinalScript } from "@/lib/feedback";
import type { FinalScript } from "@/lib/types";

export function ScriptGuidePanel({
  attemptNumber,
  script,
}: {
  attemptNumber: number;
  script: FinalScript;
}) {
  const { t } = useI18n();
  const normalized = normalizeFinalScript(script);
  const keyPoints = normalized.key_points ?? [];
  const pushback = normalized.if_pushback ?? [];
  const hasContent =
    normalized.opening ||
    keyPoints.length > 0 ||
    pushback.length > 0 ||
    normalized.closing;

  if (!hasContent) return null;

  return (
    <details
      open
      className="shrink-0 mb-4 rounded-2xl border border-border bg-card overflow-hidden group"
    >
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium list-none flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <span>
          {t("chat.scriptGuide")}
          <span className="text-muted-foreground font-normal ml-2">
            {t("chat.fromAttempt", { n: attemptNumber })}
          </span>
        </span>
        <span className="text-xs text-muted-foreground group-open:hidden">
          {t("chat.show")}
        </span>
        <span className="text-xs text-muted-foreground hidden group-open:inline">
          {t("chat.hide")}
        </span>
      </summary>

      <div className="px-4 pb-4 pt-0 max-h-52 overflow-y-auto scrollbar-hide border-t border-border/60 space-y-4 text-sm">
        {normalized.opening && (
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {t("chat.opening")}
            </h3>
            <p className="text-foreground leading-relaxed">{normalized.opening}</p>
          </section>
        )}

        {keyPoints.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              {t("chat.keyPoints")}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {keyPoints.map((point, idx) => (
                <li
                  key={`kp-${idx}`}
                  className="flex gap-2 text-foreground leading-relaxed"
                >
                  <span className="text-accent font-medium shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pushback.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {t("chat.ifPushback")}
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
              {pushback.map((item, idx) => (
                <li key={`pb-${idx}`} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {normalized.closing && (
          <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {t("chat.closing")}
            </h3>
            <p className="text-foreground leading-relaxed">{normalized.closing}</p>
          </section>
        )}
      </div>
    </details>
  );
}
