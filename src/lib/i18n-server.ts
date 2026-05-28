import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "./i18n-core";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(localeCookieName)?.value;
  if (cookieLang && isLocale(cookieLang)) return cookieLang;

  const acceptLanguage = (await headers()).get("accept-language");
  if (acceptLanguage) {
    const lower = acceptLanguage.toLowerCase();
    if (lower.includes("ca")) return "ca";
    if (lower.includes("es")) return "es";
  }

  return defaultLocale;
}
