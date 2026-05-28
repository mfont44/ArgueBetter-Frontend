"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { AppShellClient } from "@/components/layout/AppShellClient";
import {
  ChatMessageList,
  filterChatMessages,
  isBriefingMessage,
} from "@/components/practice/ChatMessageList";
import { ScriptGuidePanel } from "@/components/practice/ScriptGuidePanel";
import { ResolutionModal } from "@/components/practice/ResolutionModal";
import { SessionEndBanner } from "@/components/practice/SessionEndBanner";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  finishConversation,
  formatApiErrorI18n,
  isConversationNotActiveError,
} from "@/lib/api";
import {
  isGoalReachedReason,
  shouldShowSessionEndBanner,
} from "@/lib/sessionEnd";
import { normalizeFeedbackReport } from "@/lib/feedback";
import { roleLabel, tagLabel } from "@/lib/i18n-display";
import { loadPracticeSession } from "@/lib/practiceSession";
import type { Translator } from "@/lib/i18n-core";
import type {
  Conversation,
  EndReason,
  FinalScript,
  Message,
  UserPlan,
} from "@/lib/types";

function buildContextSubtitle(
  conversation: Conversation | null,
  t: Translator["t"]
): string {
  if (!conversation) return "";
  const parts: string[] = [];
  if (conversation.other_person_role) {
    parts.push(
      t("chat.talkingTo", {
        role: roleLabel(t, conversation.other_person_role),
      })
    );
  }
  if (conversation.difficulty != null) {
    parts.push(t("chat.difficulty", { n: conversation.difficulty }));
  } else if (conversation.personality_tags?.length) {
    parts.push(
      conversation.personality_tags
        .slice(0, 2)
        .map((tag) => tagLabel(t, tag))
        .join(", ")
    );
  }
  return parts.join(" · ");
}

export function ChatView({
  conversationId,
  credits,
  plan = "free",
}: {
  conversationId: string;
  credits: number;
  plan?: UserPlan;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [previousScript, setPreviousScript] = useState<{
    attemptNumber: number;
    script: FinalScript;
  } | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [conversationCompleted, setConversationCompleted] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedOpener, setSuggestedOpener] = useState<string | null>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [shouldEnd, setShouldEnd] = useState(false);
  const [endReason, setEndReason] = useState<EndReason | string | null>(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionForceEnd, setResolutionForceEnd] = useState(false);
  const [resolutionPromptCount, setResolutionPromptCount] = useState(0);
  const [pendingGoalReached, setPendingGoalReached] = useState(false);
  const [pendingSendContent, setPendingSendContent] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function load() {
      setSessionLoading(true);
      const supabase = createClient();
      try {
        const { attempts, currentAttempt } = await loadPracticeSession(
          supabase,
          conversationId
        );
        setConversation(currentAttempt);
        setAttemptNumber(currentAttempt.attempt_number ?? 1);
        setConversationCompleted(currentAttempt.status === "completed");

        const previousCompleted = attempts
          .filter(
            (a) =>
              a.conversation.id !== conversationId &&
              a.feedback?.final_script
          )
          .sort(
            (a, b) =>
              (b.conversation.attempt_number ?? 0) -
              (a.conversation.attempt_number ?? 0)
          );

        const latestPrevious = previousCompleted[0];
        if (latestPrevious?.feedback) {
          const normalized = normalizeFeedbackReport(latestPrevious.feedback);
          setPreviousScript({
            attemptNumber: latestPrevious.conversation.attempt_number ?? 1,
            script: normalized.final_script,
          });
        } else {
          setPreviousScript(null);
        }

        const current = attempts.find(
          (a) => a.conversation.id === conversationId
        );
        const rawMessages = current?.messages ?? [];
        const chatMessages = filterChatMessages(rawMessages);
        setCurrentMessages(chatMessages);
        setExchangeCount(
          chatMessages.filter((m) => m.role === "user").length
        );

        const briefing = rawMessages.find(
          (m) => m.role === "assistant" && isBriefingMessage(m.content)
        );
        if (briefing) {
          try {
            const b = JSON.parse(briefing.content);
            setSuggestedOpener(b.suggested_opener ?? null);
          } catch {
            setSuggestedOpener(null);
          }
        } else {
          setSuggestedOpener(null);
        }
      } catch {
        setError(t("chat.loadFailed"));
      } finally {
        setSessionLoading(false);
      }
    }
    load();
  }, [conversationId, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, shouldEnd]);

  const goToResults = useCallback(() => {
    router.push(`/practice/results/${conversationId}`);
  }, [conversationId, router]);

  const finishSession = useCallback(
    async (options?: { skipConfirm?: boolean }) => {
      if (conversationCompleted) {
        goToResults();
        return;
      }
      if (!options?.skipConfirm && !confirm(t("chat.endConfirm"))) return;
      setFinishing(true);
      setError(null);
      setPendingGoalReached(false);
      setPendingSendContent(null);
      setResolutionPromptCount(0);
      setResolutionModalOpen(false);
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setFinishing(false);
        router.push("/login");
        return;
      }

      try {
        await finishConversation(session.access_token, conversationId);
        setConversationCompleted(true);
        goToResults();
      } catch (err) {
        const message = formatApiErrorI18n(err, t, "chat.finishFailed");
        const { data } = await supabase
          .from("conversations")
          .select("status")
          .eq("id", conversationId)
          .single();

        if (data?.status === "completed") {
          setConversationCompleted(true);
          goToResults();
          return;
        }

        setError(message);
      } finally {
        setFinishing(false);
      }
    },
    [conversationCompleted, conversationId, goToResults, router, t]
  );

  const handleFinish = useCallback(() => finishSession(), [finishSession]);

  const performSend = useCallback(
    async (content: string) => {
      if (conversationCompleted) {
        goToResults();
        return;
      }
      setError(null);
      setLoading(true);

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        router.push("/login");
        return;
      }

      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      setCurrentMessages((prev) => [...prev, optimistic]);

      try {
        const res = await sendMessage(
          session.access_token,
          conversationId,
          content
        );
        const assistant: Message = {
          id: res.message_id,
          conversation_id: conversationId,
          role: "assistant",
          content: res.assistant_message,
          created_at: new Date().toISOString(),
        };
        setCurrentMessages((prev) => [...prev, assistant]);
        setExchangeCount(res.exchange_count ?? 0);
        setShouldEnd(res.should_end ?? false);
        setEndReason(res.end_reason ?? null);

        if (res.should_end && isGoalReachedReason(res.end_reason)) {
          setPendingGoalReached(true);
          setResolutionPromptCount(0);
        } else {
          setPendingGoalReached(false);
        }
      } catch (err) {
        if (isConversationNotActiveError(err)) {
          setConversationCompleted(true);
          setPendingGoalReached(false);
          setPendingSendContent(null);
          setResolutionModalOpen(false);
          goToResults();
          return;
        }
        setError(formatApiErrorI18n(err, t, "chat.sendFailed"));
      } finally {
        setLoading(false);
      }
    },
    [conversationCompleted, conversationId, goToResults, router, t]
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();

    if (conversationCompleted) {
      goToResults();
      return;
    }

    if (pendingGoalReached) {
      if (resolutionPromptCount >= 2) {
        setResolutionForceEnd(true);
        setResolutionModalOpen(true);
        void finishSession({ skipConfirm: true });
        return;
      }
      setPendingSendContent(content);
      setResolutionForceEnd(false);
      setResolutionModalOpen(true);
      setResolutionPromptCount((prev) => prev + 1);
      return;
    }

    setInput("");
    await performSend(content);
  }

  const handleResolutionContinue = useCallback(async () => {
    setResolutionModalOpen(false);
    if (conversationCompleted) {
      goToResults();
      return;
    }
    setPendingGoalReached(false);
    const content = pendingSendContent;
    setPendingSendContent(null);
    if (content) {
      setInput("");
      await performSend(content);
    }
  }, [conversationCompleted, goToResults, pendingSendContent, performSend]);

  const handleResolutionEnd = useCallback(() => {
    setPendingGoalReached(false);
    setPendingSendContent(null);
    finishSession({ skipConfirm: resolutionForceEnd });
  }, [finishSession, resolutionForceEnd]);

  const contextSubtitle = buildContextSubtitle(conversation, t);
  const showWrapUpHint =
    exchangeCount >= 4 && !shouldEnd && !sessionLoading && !conversationCompleted;

  if (sessionLoading) {
    return (
      <AppShellClient credits={credits} plan={plan} mainClassName="py-4">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </AppShellClient>
    );
  }

  return (
    <AppShellClient
      credits={credits}
      plan={plan}
      mainClassName="flex flex-1 flex-col py-4 min-h-0"
    >
      <div className="flex flex-1 flex-col min-h-0">
        <div className="mb-3 shrink-0">
          <h1 className="text-lg font-semibold">{t("chat.simulation")}</h1>
          <p className="text-xs text-muted-foreground">
            {t("chat.attempt", { n: attemptNumber })}
            {contextSubtitle ? ` · ${contextSubtitle}` : ""}
          </p>
          {showWrapUpHint && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("chat.wrapUpSoon")}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="error" className="mb-3 shrink-0">
            {error}
          </Alert>
        )}

        {conversationCompleted && (
          <Alert className="mb-3 shrink-0">
            {t("chat.practiceComplete")}
          </Alert>
        )}

        {previousScript && (
          <div className="shrink-0 mb-3">
            <ScriptGuidePanel
              attemptNumber={previousScript.attemptNumber}
              script={previousScript.script}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col min-h-0 rounded-2xl border border-border bg-card/50">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-4 p-5">
            {currentMessages.length === 0 && suggestedOpener && (
              <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">
                  {t("chat.suggestedOpener")}
                </p>
                <p className="italic">&ldquo;{suggestedOpener}&rdquo;</p>
              </div>
            )}
            <ChatMessageList messages={currentMessages} />
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-muted-foreground animate-pulse">
                  {t("chat.typing")}
                </div>
              </div>
            )}
            {shouldShowSessionEndBanner(shouldEnd, endReason) && (
              <SessionEndBanner
                endReason={endReason}
                exchangeCount={exchangeCount}
                onEnd={handleFinish}
                loading={finishing}
              />
            )}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 border-t border-border bg-background/50 p-4 space-y-3">
            <form onSubmit={handleSend} className="space-y-3">
              <Textarea
                className="min-h-[52px] max-h-40 w-full scrollbar-hide resize-none"
                placeholder={
                  conversationCompleted
                    ? t("chat.practiceComplete")
                    : t("chat.typeResponse")
                }
                value={input}
                disabled={conversationCompleted}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={2}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!input.trim() || loading || conversationCompleted}
                loading={loading}
              >
                {t("chat.send")}
              </Button>
            </form>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleFinish}
              loading={finishing}
            >
              {conversationCompleted
                ? t("chat.viewFeedback")
                : t("chat.endAndFeedback")}
            </Button>
          </div>
        </div>
      </div>

      <ResolutionModal
        open={resolutionModalOpen}
        onEnd={handleResolutionEnd}
        onContinue={() => void handleResolutionContinue()}
        loading={finishing}
        forceEnd={resolutionForceEnd}
        beforeSend={pendingSendContent != null}
      />
    </AppShellClient>
  );
}
