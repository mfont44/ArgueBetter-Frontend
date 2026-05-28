import { averageScore } from "./practiceSession";
import type { FeedbackReport } from "./types";

export const SCORE_DIMENSIONS = [
  { key: "clarity_score" as const },
  { key: "assertiveness_score" as const },
  { key: "empathy_score" as const },
  { key: "boundaries_score" as const },
] as const;

export type ScoreKey = (typeof SCORE_DIMENSIONS)[number]["key"];

export interface DimensionAverages {
  clarity_score: number;
  assertiveness_score: number;
  empathy_score: number;
  boundaries_score: number;
}

export interface ProgressStats {
  averages: DimensionAverages | null;
  strongest: { key: ScoreKey; value: number } | null;
  focus: { key: ScoreKey; value: number } | null;
  recentSessionScores: { overall: number; createdAt: string }[];
  sessionCount: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function computeAverages(reports: FeedbackReport[]): DimensionAverages | null {
  if (reports.length === 0) return null;

  const sums = {
    clarity_score: 0,
    assertiveness_score: 0,
    empathy_score: 0,
    boundaries_score: 0,
  };

  for (const r of reports) {
    sums.clarity_score += r.clarity_score;
    sums.assertiveness_score += r.assertiveness_score;
    sums.empathy_score += r.empathy_score;
    sums.boundaries_score += r.boundaries_score;
  }

  const n = reports.length;
  return {
    clarity_score: round1(sums.clarity_score / n),
    assertiveness_score: round1(sums.assertiveness_score / n),
    empathy_score: round1(sums.empathy_score / n),
    boundaries_score: round1(sums.boundaries_score / n),
  };
}

function findExtreme(
  averages: DimensionAverages,
  pick: "max" | "min"
): { key: ScoreKey; value: number } {
  let bestKey: ScoreKey = SCORE_DIMENSIONS[0].key;
  let bestVal = averages[bestKey];

  for (const dim of SCORE_DIMENSIONS) {
    const val = averages[dim.key];
    if (pick === "max" ? val > bestVal : val < bestVal) {
      bestKey = dim.key;
      bestVal = val;
    }
  }

  return { key: bestKey, value: bestVal };
}

export function computeProgressStats(
  reports: FeedbackReport[],
  trendLimit = 8
): ProgressStats {
  const averages = computeAverages(reports);
  const sorted = [...reports].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const recentSessionScores = sorted.slice(0, trendLimit).map((r) => ({
    overall: averageScore(r),
    createdAt: r.created_at,
  }));

  return {
    averages,
    strongest: averages ? findExtreme(averages, "max") : null,
    focus: averages ? findExtreme(averages, "min") : null,
    recentSessionScores,
    sessionCount: reports.length,
  };
}
