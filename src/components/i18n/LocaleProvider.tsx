"use client";

import { createContext, useContext, useMemo } from "react";
import {
  createTranslator,
  type Locale,
  type Translator,
} from "@/lib/i18n";

const LocaleContext = createContext<Translator | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo(() => createTranslator(locale), [locale]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n(): Translator {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}
