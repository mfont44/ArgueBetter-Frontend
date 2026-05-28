import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import {
  canViewAdvancedProgress,
  formatSessionsRemaining,
  formatSessionsUsedThisMonth,
  sessionsUsedThisMonth,
} from "@/lib/entitlements";
import {
  computeProgressStats,
  SCORE_DIMENSIONS,
} from "@/lib/progressStats";
import { categoryLabel, scoreLabel } from "@/lib/i18n-display";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import type { Conversation, FeedbackReport } from "@/lib/types";

export default async function ProgressPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, category, status, created_at")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const completed = (conversations ?? []) as Conversation[];
  const ids = completed.map((c) => c.id);

  let feedbackReports: FeedbackReport[] = [];
  if (ids.length > 0) {
    const { data: feedback } = await supabase
      .from("feedback_reports")
      .select("*")
      .in("conversation_id", ids);
    feedbackReports = (feedback ?? []) as FeedbackReport[];
  }

  const feedbackByConv = new Map(
    feedbackReports.map((f) => [f.conversation_id, f])
  );

  const reportsForStats = completed
    .map((c) => feedbackByConv.get(c.id))
    .filter((f): f is FeedbackReport => f != null);

  const stats = computeProgressStats(reportsForStats);
  const used =
    profile.sessions_used_this_period ??
    sessionsUsedThisMonth(profile.credits, profile.plan);

  const showFull = canViewAdvancedProgress(profile.plan);

  return (
    <AppShell credits={profile.credits} plan={profile.plan}>
      <div className="space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t("progress.back")}
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{t("progress.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("progress.subtitle")}
          </p>
        </div>

        {!showFull ? (
          <Card className="py-8 px-6 text-center space-y-4">
            <Badge variant="accent">{t("billing.premium")}</Badge>
            <h2 className="text-lg font-medium">{t("progress.unlockTitle")}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("progress.unlockBody")}
            </p>
            <ul className="text-sm text-muted-foreground text-left max-w-xs mx-auto space-y-1">
              <li>• {t("progress.unlockFeature1")}</li>
              <li>• {t("progress.unlockFeature2")}</li>
              <li>• {t("progress.unlockFeature3")}</li>
            </ul>
            <Link href="/pricing">
              <Button>{t("billing.upgradeToPremium")}</Button>
            </Link>
          </Card>
        ) : (
          <>
            <Card className="py-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {t("progress.thisMonth")}
              </h2>
              <p className="text-lg font-medium">
                {formatSessionsRemaining(locale, profile.credits, profile.plan)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatSessionsUsedThisMonth(locale, used)}
              </p>
            </Card>

            {stats.averages ? (
              <>
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                    {t("progress.averageScores")}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {SCORE_DIMENSIONS.map(({ key }) => (
                      <Card key={key} className="py-4 text-center">
                        <p className="text-2xl font-semibold text-accent">
                          {stats.averages![key]}/10
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {scoreLabel(t, key)}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                {(stats.strongest || stats.focus) && (
                  <Card className="space-y-3">
                    <h2 className="font-medium">{t("progress.focusAreas")}</h2>
                    {stats.strongest && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {t("progress.strongest")}{" "}
                        </span>
                        {scoreLabel(t, stats.strongest.key)} ({stats.strongest.value}/10)
                      </p>
                    )}
                    {stats.focus && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {t("progress.focusOn")}{" "}
                        </span>
                        {scoreLabel(t, stats.focus.key)} ({stats.focus.value}/10)
                      </p>
                    )}
                  </Card>
                )}

                {stats.recentSessionScores.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                      {t("progress.recentTrend")}
                    </h2>
                    <Card className="divide-y divide-border">
                      {stats.recentSessionScores.map((s, i) => (
                        <div
                          key={`${s.createdAt}-${i}`}
                          className="flex items-center justify-between py-3 px-1 text-sm"
                        >
                          <span className="text-muted-foreground">
                            {t("progress.session", {
                              n: stats.recentSessionScores.length - i,
                            })}
                          </span>
                          <span className="font-medium">
                            {t("progress.avgScore", { score: s.overall })}
                          </span>
                        </div>
                      ))}
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {t("progress.empty")}
                </p>
                <Link href="/practice/categories" className="inline-block mt-4">
                  <Button>{t("progress.startPracticing")}</Button>
                </Link>
              </Card>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  {t("progress.recentCompleted")}
                </h2>
                <div className="flex flex-col gap-3">
                  {completed.slice(0, 10).map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/practice/results/${conv.id}`}
                      className="block"
                    >
                      <Card className="hover:border-accent/50 transition-colors cursor-pointer py-4">
                        <p className="font-medium">{conv.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {categoryLabel(t, conv.category)}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
