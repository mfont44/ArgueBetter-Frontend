"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { AppShellClient } from "@/components/layout/AppShellClient";
import { AttemptsComparison } from "@/components/practice/AttemptsComparison";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { finishConversation, retryConversation, ApiError } from "@/lib/api";
import { normalizeFeedbackReport } from "@/lib/feedback";
import { scoreLabel } from "@/lib/i18n-display";
import { loadPracticeSession } from "@/lib/practiceSession";
import type { FeedbackReport, FinalScript } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n-core";

const SCORE_DIMENSIONS = [
  { key: "clarity_score" as const },
  { key: "assertiveness_score" as const },
  { key: "empathy_score" as const },
  { key: "boundaries_score" as const },
];

const SCRIPT_TABS: { id: keyof FinalScript | "overview"; labelKey: TranslationKey }[] = [
  { id: "overview", labelKey: "results.tabOverview" },
  { id: "opening", labelKey: "results.tabOpening" },
  { id: "key_points", labelKey: "results.tabKeyPoints" },
  { id: "if_pushback", labelKey: "results.tabPushback" },
  { id: "closing", labelKey: "results.tabClosing" },
  { id: "whatsapp_short", labelKey: "results.tabWhatsapp" },
  { id: "email_formal", labelKey: "results.tabEmail" },
];

export function ResultsView({
  conversationId,
  credits,
  plan = "free",
}: {
  conversationId: string;
  credits: number;
  plan?: import("@/lib/types").UserPlan;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<
    { attemptNumber: number; feedback: FeedbackReport }[]
  >([]);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [tab, setTab] = useState<keyof FinalScript | "overview">("overview");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("feedback_reports")
        .select("*")
        .eq("conversation_id", conversationId)
        .single();

      let currentReport: FeedbackReport | null = data
        ? normalizeFeedbackReport(data as FeedbackReport)
        : null;

      if (!currentReport) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          try {
            const res = await finishConversation(
              session.access_token,
              conversationId
            );
            currentReport = normalizeFeedbackReport({
              id: conversationId,
              conversation_id: conversationId,
              clarity_score: res.clarity_score,
              assertiveness_score: res.assertiveness_score,
              empathy_score: res.empathy_score,
              boundaries_score: res.boundaries_score,
              summary: res.summary,
              strengths: res.strengths,
              improvements: res.improvements,
              final_script: res.final_script,
              created_at: new Date().toISOString(),
            });
          } catch {
            /* ignore */
          }
        }
      }

      setReport(currentReport);

      try {
        const { attempts, currentAttempt } = await loadPracticeSession(
          supabase,
          conversationId
        );
        setAttemptNumber(currentAttempt.attempt_number ?? 1);
        setSessionFeedback(
          attempts
            .filter((a) => a.feedback !== null)
            .map((a) => ({
              attemptNumber: a.conversation.attempt_number ?? 1,
              feedback: normalizeFeedbackReport(a.feedback!),
            }))
        );
      } catch {
        if (currentReport) {
          setSessionFeedback([
            { attemptNumber: 1, feedback: currentReport },
          ]);
        }
      }

      setLoading(false);
    }
    load();
  }, [conversationId]);

  async function handleRetry() {
    setRetrying(true);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const result = await retryConversation(
        session.access_token,
        conversationId
      );
      sessionStorage.setItem(
        `briefing-${result.conversation_id}`,
        JSON.stringify(result.briefing)
      );
      router.push(`/practice/chat/${result.conversation_id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        router.push("/practice/no-credits");
        return;
      }
      alert(
        err instanceof Error ? err.message : t("results.retryFailed")
      );
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <AppShellClient credits={credits} plan={plan}>
        <p className="text-muted-foreground">{t("results.generating")}</p>
      </AppShellClient>
    );
  }

  if (!report) {
    return (
      <AppShellClient credits={credits} plan={plan}>
        <p className="text-muted-foreground">{t("results.notFound")}</p>
        <Link href="/dashboard">
          <Button className="mt-4">{t("common.backToDashboard")}</Button>
        </Link>
      </AppShellClient>
    );
  }

  const script = report.final_script;

  return (
    <AppShellClient credits={credits} plan={plan}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("results.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("chat.attempt", { n: attemptNumber })}
            {sessionFeedback.length > 1 &&
              ` · ${t("results.attemptsCompleted", { count: sessionFeedback.length })}`}
          </p>
          <p className="text-muted-foreground text-sm mt-2">{report.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SCORE_DIMENSIONS.map(({ key }) => (
            <Card key={key} className="py-4 text-center">
              <p className="text-2xl font-semibold text-accent">
                {report[key]}/10
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {scoreLabel(t, key)}
              </p>
            </Card>
          ))}
        </div>

        {sessionFeedback.length >= 2 && (
          <AttemptsComparison attempts={sessionFeedback} />
        )}

        <Card>
          <h2 className="font-medium mb-2">{t("results.strengths")}</h2>
          <ul className="text-sm space-y-1 list-disc pl-5">
            {report.strengths.map((s, idx) => (
              <li key={`strength-${idx}`}>{s}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-medium mb-2">{t("results.improvements")}</h2>
          <ul className="text-sm space-y-1 list-disc pl-5">
            {report.improvements.map((item, idx) => (
              <li key={`improvement-${idx}`}>{item}</li>
            ))}
          </ul>
        </Card>

        <div>
          <h2 className="font-medium mb-3">{t("results.yourScript")}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {SCRIPT_TABS.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-3 py-1 text-xs border transition-all duration-200 ${
                  tab === id
                    ? "bg-accent text-accent-foreground border-accent ring-2 ring-accent/30 shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-accent/50"
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
          <Card className="text-sm">
            {tab === "overview" && (
              <p className="text-muted-foreground">{t("results.tabOverviewHint")}</p>
            )}
            {tab === "opening" && <p>{script.opening}</p>}
            {tab === "key_points" && (
              <ul className="list-disc pl-5 space-y-1">
                {(script.key_points ?? []).map((p, idx) => (
                  <li key={`kp-${idx}`}>{p}</li>
                ))}
              </ul>
            )}
            {tab === "if_pushback" && (
              <ul className="list-disc pl-5 space-y-1">
                {(script.if_pushback ?? []).map((p, idx) => (
                  <li key={`pb-${idx}`}>{p}</li>
                ))}
              </ul>
            )}
            {tab === "closing" && <p>{script.closing}</p>}
            {tab === "whatsapp_short" && <p>{script.whatsapp_short}</p>}
            {tab === "email_formal" && (
              <p className="whitespace-pre-wrap">{script.email_formal}</p>
            )}
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            loading={retrying}
            className="w-full"
          >
            {t("results.retrySame")}
          </Button>
          <div className="flex gap-3">
            <Link href="/practice/categories" className="flex-1">
              <Button variant="outline" className="w-full">
                {t("results.practiceAnother")}
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                {t("results.viewHistory")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShellClient>
  );
}
