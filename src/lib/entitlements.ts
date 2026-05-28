import {
  createTranslator,
  type Locale,
  type TranslationKey,
} from "./i18n-core";
import type { UserPlan } from "./types";

export const FREE_WELCOME_SESSIONS = 5;
export const PREMIUM_MONTHLY_SESSIONS = 20;

export function canUseCustomScenario(plan: UserPlan): boolean {
  return plan === "premium";
}

export function canViewAdvancedProgress(plan: UserPlan): boolean {
  return plan === "premium";
}

export function formatPlanLabel(locale: Locale, plan: UserPlan): string {
  const { t } = createTranslator(locale);
  return plan === "premium"
    ? t("entitlements.planPremium")
    : t("entitlements.planFree");
}

export function formatSessionsRemaining(
  locale: Locale,
  credits: number,
  plan: UserPlan
): string {
  const { t, tPlural } = createTranslator(locale);
  if (plan === "premium") {
    return t("entitlements.sessionsRemainingPremium", {
      credits,
      total: PREMIUM_MONTHLY_SESSIONS,
    });
  }
  return tPlural(
    "entitlements.sessionsRemaining" as TranslationKey,
    credits,
    { count: credits }
  );
}

export function formatSessionsUsedThisMonth(locale: Locale, used: number): string {
  const { t } = createTranslator(locale);
  return t("entitlements.sessionsUsedThisMonth", {
    used,
    total: PREMIUM_MONTHLY_SESSIONS,
  });
}

export function sessionsUsedThisMonth(
  credits: number,
  plan: UserPlan
): number {
  if (plan !== "premium") return 0;
  return Math.min(
    PREMIUM_MONTHLY_SESSIONS,
    Math.max(0, PREMIUM_MONTHLY_SESSIONS - credits)
  );
}
