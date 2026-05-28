"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";
import { scoreLabel } from "@/lib/i18n-display";
import { averageScore } from "@/lib/practiceSession";
import type { FeedbackReport } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCORE_KEYS = [
  "clarity_score",
  "assertiveness_score",
  "empathy_score",
  "boundaries_score",
] as const;

export interface AttemptWithFeedback {
  attemptNumber: number;
  feedback: FeedbackReport;
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground"> (0)</span>;
  const positive = value > 0;
  return (
    <span className={cn(positive ? "text-success" : "text-destructive")}>
      {" "}
      ({positive ? "+" : ""}
      {value})
    </span>
  );
}

export function AttemptsComparison({
  attempts,
}: {
  attempts: AttemptWithFeedback[];
}) {
  const { t } = useI18n();

  if (attempts.length < 2) return null;

  const sorted = [...attempts].sort(
    (a, b) => a.attemptNumber - b.attemptNumber
  );
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const resolvedImprovements = previous.feedback.improvements.filter(
    (item) => !latest.feedback.improvements.includes(item)
  );
  const newStrengths = latest.feedback.strengths.filter(
    (item) => !previous.feedback.strengths.includes(item)
  );

  return (
    <Card className="border-accent/30 bg-accent/5">
      <h2 className="font-medium mb-3">{t("results.comparisonTitle")}</h2>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">{t("results.metric")}</th>
              {sorted.map((attempt) => (
                <th key={attempt.attemptNumber} className="pb-2 pr-3 font-medium">
                  {t("chat.attempt", { n: attempt.attemptNumber })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORE_KEYS.map((key) => (
              <tr key={key} className="border-t border-border/60">
                <td className="py-2 pr-3 text-muted-foreground">
                  {scoreLabel(t, key)}
                </td>
                {sorted.map((attempt, i) => {
                  const score = attempt.feedback[key];
                  const prev = i > 0 ? sorted[i - 1].feedback[key] : null;
                  const delta = prev !== null ? score - prev : null;
                  return (
                    <td key={attempt.attemptNumber} className="py-2 pr-3">
                      <span className="font-medium">{score}/10</span>
                      {delta !== null && <Delta value={delta} />}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-border/60">
              <td className="py-2 pr-3 text-muted-foreground">
                {t("results.average")}
              </td>
              {sorted.map((attempt, i) => {
                const avg = averageScore(attempt.feedback);
                const prevAvg =
                  i > 0 ? averageScore(sorted[i - 1].feedback) : null;
                const delta = prevAvg !== null ? avg - prevAvg : null;
                return (
                  <td key={attempt.attemptNumber} className="py-2 pr-3">
                    <span className="font-semibold text-accent">{avg}/10</span>
                    {delta !== null && <Delta value={delta} />}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {(resolvedImprovements.length > 0 || newStrengths.length > 0) && (
        <div className="space-y-3 text-sm">
          {resolvedImprovements.length > 0 && (
            <div>
              <p className="font-medium text-success mb-1">
                {t("results.addressedAreas")}
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                {resolvedImprovements.map((item, idx) => (
                  <li key={`resolved-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {newStrengths.length > 0 && (
            <div>
              <p className="font-medium mb-1">{t("results.newStrengths")}</p>
              <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                {newStrengths.map((item, idx) => (
                  <li key={`new-strength-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
