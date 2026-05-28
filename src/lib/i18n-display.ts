import type { Translator, TranslationKey } from "./i18n-core";

export function categoryLabel(t: Translator["t"], categoryId: string): string {
  const key = `categories.${categoryId}.label` as TranslationKey;
  const translated = t(key);
  return translated !== key ? translated : categoryId;
}

export function categoryDescription(
  t: Translator["t"],
  categoryId: string
): string | undefined {
  const key = `categories.${categoryId}.description` as TranslationKey;
  const translated = t(key);
  return translated !== key ? translated : undefined;
}

export function categoryTitlePlaceholder(
  t: Translator["t"],
  categoryId: string
): string {
  return t(`categories.${categoryId}.titlePlaceholder` as TranslationKey);
}

export function roleLabel(t: Translator["t"], roleValue: string): string {
  const key = `roles.${roleValue}` as TranslationKey;
  const translated = t(key);
  return translated !== key ? translated : roleValue;
}

export function tagLabel(t: Translator["t"], tagValue: string): string {
  const key = `tags.${tagValue}` as TranslationKey;
  const translated = t(key);
  return translated !== key ? translated : tagValue;
}

export function toneLabel(t: Translator["t"], toneId: string): string {
  return t(`tones.${toneId}` as TranslationKey);
}

export function difficultyLabel(t: Translator["t"], level: number): string {
  return t(`difficulty.${level}.label` as TranslationKey);
}

export function difficultyDescription(t: Translator["t"], level: number): string {
  return t(`difficulty.${level}.description` as TranslationKey);
}

export function scoreLabel(
  t: Translator["t"],
  key: "clarity_score" | "assertiveness_score" | "empathy_score" | "boundaries_score"
): string {
  const map = {
    clarity_score: "scores.clarity",
    assertiveness_score: "scores.assertiveness",
    empathy_score: "scores.empathy",
    boundaries_score: "scores.boundaries",
  } as const;
  return t(map[key]);
}
