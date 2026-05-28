import type { EndReason } from "./types";

const GOAL_REACHED = "goal_reached";

/** Coerce API should_end (boolean, string, number) to boolean. */
export function normalizeShouldEnd(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "true" || s === "1";
  }
  return false;
}

/** Normalize end_reason to lowercase snake_case or null. */
export function normalizeEndReason(value: unknown): EndReason | string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return s || null;
}

export function isGoalReachedReason(
  endReason: EndReason | string | null | undefined
): boolean {
  return normalizeEndReason(endReason) === GOAL_REACHED;
}

/** Banner for natural_closure, max_exchanges, stalemate, or should_end without reason. */
export function shouldShowSessionEndBanner(
  shouldEnd: boolean,
  endReason: EndReason | string | null | undefined
): boolean {
  if (!shouldEnd) return false;
  return !isGoalReachedReason(endReason);
}
