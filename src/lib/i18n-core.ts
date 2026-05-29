import en from "@/locales/en.json";
import ca from "@/locales/ca.json";
import es from "@/locales/es.json";

export const supportedLocales = ["en", "ca", "es"] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = "en";

export type ApiLanguage = "ca" | "es" | "en";

export function toApiLanguage(locale: string): ApiLanguage {
  const tag = locale.toLowerCase().replace(/_/g, "-");
  if (tag === "ca" || tag.startsWith("ca-")) return "ca";
  if (tag === "es" || tag.startsWith("es-")) return "es";
  if (tag === "en" || tag.startsWith("en-")) return "en";
  return "en";
}

export const localeCookieName = "lang";

const messages: Record<Locale, typeof en> = { en, ca, es };

export type Messages = typeof en;

type NestedKeyOf<T, Prefix extends string = ""> = T extends string
  ? Prefix extends ""
    ? never
    : Prefix
  : T extends readonly unknown[]
    ? Prefix extends ""
      ? never
      : Prefix
    : {
        [K in keyof T & string]: T[K] extends string
          ? Prefix extends ""
            ? K
            : `${Prefix}.${K}`
          : NestedKeyOf<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
      }[keyof T & string];

export type TranslationKey = NestedKeyOf<Messages>;

export function isLocale(value: string): value is Locale {
  return (supportedLocales as readonly string[]).includes(value);
}

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en;
}

export function createTranslator(locale: Locale) {
  const catalog = getMessages(locale);
  const fallback = getMessages(defaultLocale);

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    const value =
      getNestedValue(catalog, key) ?? getNestedValue(fallback, key) ?? key;
    return interpolate(value, params);
  }

  function tPlural(
    key: TranslationKey,
    count: number,
    params?: Record<string, string | number>
  ): string {
    const pluralForm = new Intl.PluralRules(locale).select(count);
    const suffix = pluralForm === "one" ? "one" : "other";
    const pluralKey = `${key}.${suffix}` as TranslationKey;
    const value =
      getNestedValue(catalog, pluralKey) ??
      getNestedValue(fallback, pluralKey) ??
      getNestedValue(catalog, key) ??
      key;
    return interpolate(value, { ...params, count });
  }

  return { t, tPlural, locale };
}

export type Translator = ReturnType<typeof createTranslator>;

export function getLocaleFromCookieHeader(cookieHeader: string | null): Locale {
  if (!cookieHeader) return defaultLocale;
  const match = cookieHeader.match(new RegExp(`${localeCookieName}=([^;]+)`));
  if (match?.[1] && isLocale(match[1])) return match[1];
  return defaultLocale;
}

export function localeLabel(locale: Locale): string {
  switch (locale) {
    case "en":
      return "EN";
    case "ca":
      return "CA";
    case "es":
      return "ES";
  }
}
