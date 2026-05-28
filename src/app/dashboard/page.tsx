import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckoutSuccessBanner } from "@/components/billing/CheckoutSuccessBanner";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { canViewAdvancedProgress } from "@/lib/entitlements";
import { categoryLabel } from "@/lib/i18n-display";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { groupConversationsBySession } from "@/lib/practiceSession";
import type { Conversation } from "@/lib/types";

export default async function DashboardPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });

  const all = (conversations ?? []) as Conversation[];
  const sessions = groupConversationsBySession(all);

  return (
    <AppShell credits={profile?.credits ?? 0} plan={profile?.plan ?? "free"}>
      <div className="space-y-8">
        <Suspense fallback={null}>
          <CheckoutSuccessBanner />
        </Suspense>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile && canViewAdvancedProgress(profile.plan) && (
              <Link href="/dashboard/progress">
                <Button variant="outline">{t("dashboard.viewProgress")}</Button>
              </Link>
            )}
            <Link href="/practice/categories">
              <Button>{t("dashboard.practiceConversation")}</Button>
            </Link>
          </div>
        </div>

        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t("dashboard.empty")}</p>
            <Link href="/practice/categories">
              <Button>{t("dashboard.startFirst")}</Button>
            </Link>
          </Card>
        ) : (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              {t("dashboard.recentSessions")}
            </h2>
            <div className="flex flex-col gap-3">
              {sessions.map(({ latest, attemptCount }) => (
                <Link
                  key={latest.id}
                  href={getConversationLink(latest)}
                  className="block"
                >
                  <Card className="hover:border-accent/50 transition-colors cursor-pointer py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{latest.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {categoryLabel(t, latest.category)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {attemptCount > 1 && (
                          <Badge variant="accent">
                            {t("dashboard.attempts", { count: attemptCount })}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            latest.status === "completed" ? "success" : "default"
                          }
                        >
                          {latest.status === "completed"
                            ? t("dashboard.completed")
                            : t("dashboard.inProgress")}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function getConversationLink(conv: Conversation): string {
  if (conv.status === "completed") {
    return `/practice/results/${conv.id}`;
  }
  return `/practice/chat/${conv.id}`;
}
