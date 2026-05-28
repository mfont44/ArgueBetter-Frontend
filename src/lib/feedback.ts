import type { FeedbackReport, FinalScript } from "./types";

/** Backend may return plain strings or { trigger, response } objects. */
export function normalizeFeedbackItem(item: unknown, index: number): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    const trigger =
      typeof o.trigger === "string" ? o.trigger.trim() : "";
    const response =
      typeof o.response === "string" ? o.response.trim() : "";
    if (trigger && response) return `${trigger}: ${response}`;
    if (response) return response;
    if (trigger) return trigger;
    if (typeof o.text === "string") return o.text;
  }
  return typeof item === "number" ? String(item) : `item-${index}`;
}

export function normalizeFeedbackList(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item, i) => normalizeFeedbackItem(item, i));
}

export function normalizeFinalScript(script: FinalScript): FinalScript {
  return {
    ...script,
    key_points: script.key_points
      ? normalizeFeedbackList(script.key_points)
      : script.key_points,
    if_pushback: script.if_pushback
      ? normalizeFeedbackList(script.if_pushback)
      : script.if_pushback,
  };
}

export function normalizeFeedbackReport(
  report: FeedbackReport
): FeedbackReport {
  return {
    ...report,
    strengths: normalizeFeedbackList(report.strengths),
    improvements: normalizeFeedbackList(report.improvements),
    final_script: normalizeFinalScript(report.final_script ?? {}),
  };
}
