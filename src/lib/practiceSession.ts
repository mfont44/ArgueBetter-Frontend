import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, FeedbackReport, Message } from "./types";

export interface SessionAttempt {
  conversation: Conversation;
  messages: Message[];
  feedback: FeedbackReport | null;
}

export function getPracticeSessionId(conv: Conversation): string {
  return conv.practice_session_id ?? conv.id;
}

export function averageScore(report: FeedbackReport): number {
  return Math.round(
    (report.clarity_score +
      report.assertiveness_score +
      report.empathy_score +
      report.boundaries_score) /
      4
  );
}

export async function loadPracticeSession(
  supabase: SupabaseClient,
  conversationId: string
): Promise<{
  attempts: SessionAttempt[];
  currentAttempt: Conversation;
}> {
  const { data: currentRow } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (!currentRow) {
    throw new Error("Conversation not found");
  }

  const currentAttempt = currentRow as Conversation;
  const sessionId = getPracticeSessionId(currentAttempt);

  const { data: sessionRows } = await supabase
    .from("conversations")
    .select("*")
    .eq("practice_session_id", sessionId)
    .order("attempt_number", { ascending: true });

  let conversations = (sessionRows ?? []) as Conversation[];

  if (conversations.length === 0) {
    conversations = [currentAttempt];
  }

  const ids = conversations.map((c) => c.id);

  const [{ data: allMessages }, { data: allFeedback }] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .in("conversation_id", ids)
      .order("created_at", { ascending: true }),
    supabase.from("feedback_reports").select("*").in("conversation_id", ids),
  ]);

  const messagesByConv = new Map<string, Message[]>();
  for (const msg of (allMessages ?? []) as Message[]) {
    const list = messagesByConv.get(msg.conversation_id) ?? [];
    list.push(msg);
    messagesByConv.set(msg.conversation_id, list);
  }

  const feedbackByConv = new Map<string, FeedbackReport>();
  for (const fb of (allFeedback ?? []) as FeedbackReport[]) {
    feedbackByConv.set(fb.conversation_id, fb);
  }

  const attempts: SessionAttempt[] = conversations.map((conversation) => ({
    conversation,
    messages: messagesByConv.get(conversation.id) ?? [],
    feedback: feedbackByConv.get(conversation.id) ?? null,
  }));

  return { attempts, currentAttempt };
}

export function groupConversationsBySession(
  conversations: Conversation[]
): { latest: Conversation; attemptCount: number }[] {
  const bySession = new Map<string, Conversation[]>();

  for (const conv of conversations) {
    const sessionId = getPracticeSessionId(conv);
    const group = bySession.get(sessionId) ?? [];
    group.push(conv);
    bySession.set(sessionId, group);
  }

  return Array.from(bySession.values())
    .map((group) => {
      const sorted = [...group].sort(
        (a, b) => (b.attempt_number ?? 1) - (a.attempt_number ?? 1)
      );
      return { latest: sorted[0], attemptCount: group.length };
    })
    .sort(
      (a, b) =>
        new Date(b.latest.created_at).getTime() -
        new Date(a.latest.created_at).getTime()
    );
}
