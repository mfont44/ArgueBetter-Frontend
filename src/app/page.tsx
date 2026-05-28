import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  const steps = [
    { step: "1", title: t("landing.step1Title"), desc: t("landing.step1Desc") },
    { step: "2", title: t("landing.step2Title"), desc: t("landing.step2Desc") },
    { step: "3", title: t("landing.step3Title"), desc: t("landing.step3Desc") },
  ];

  const situations = [
    t("landing.situation1"),
    t("landing.situation2"),
    t("landing.situation3"),
    t("landing.situation4"),
  ];

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 gap-4">
          <span className="font-semibold tracking-tight text-foreground">
            {t("brand.name")}
          </span>
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="hidden sm:block w-[200px]">
              <ThemeSelector compact />
            </div>
            <div className="hidden sm:block w-[180px]">
              <LanguageSwitcher compact className="max-w-[180px]" />
            </div>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              {t("common.pricing")}
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("common.logIn")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t("common.getStarted")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 py-24 sm:py-28">
          <div className="flex flex-col items-center text-center">
            <HeroIllustration className="w-64 h-40 sm:w-80 sm:h-48 mb-8 opacity-90" />
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground max-w-2xl leading-tight">
              {t("landing.heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center">
              <Link href="/register">
                <Button size="lg">{t("landing.startPracticing")}</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  {t("landing.haveAccount")}
                </Button>
              </Link>
            </div>
            <div className="sm:hidden mt-8 w-full max-w-xs space-y-4">
              <ThemeSelector compact />
              <LanguageSwitcher compact className="max-w-xs mx-auto" />
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:py-24">
            <h2 className="text-2xl font-semibold text-center mb-14">
              {t("landing.howItWorks")}
            </h2>
            <div className="grid sm:grid-cols-3 gap-10 sm:gap-12">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-accent/25 text-accent ring-1 ring-accent/30 text-sm font-medium">
                    {item.step}
                  </div>
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 sm:py-24">
          <h2 className="text-2xl font-semibold text-center mb-12">
            {t("landing.builtFor")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {situations.map((text) => (
              <div
                key={text}
                className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground leading-relaxed"
              >
                {text}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border py-10">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>{t("landing.disclaimer")}</p>
          <div className="flex justify-center">
            <LanguageSwitcher compact className="max-w-[180px] mb-2" />
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/pricing"
              className="hover:text-foreground underline transition-colors duration-200"
            >
              {t("common.pricing")}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground underline transition-colors duration-200"
            >
              {t("common.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground underline transition-colors duration-200"
            >
              {t("common.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
