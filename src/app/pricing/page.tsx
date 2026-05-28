import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PricingCards } from "@/components/billing/PricingCards";
import { CheckoutSuccessBanner } from "@/components/billing/CheckoutSuccessBanner";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function PricingPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getProfile() : null;

  const content = (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <CheckoutSuccessBanner />
      </Suspense>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {t("billing.choosePlan")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {t("billing.subtitle")}
        </p>
      </div>

      <PricingCards isLoggedIn={!!user} plan={profile?.plan ?? null} />
    </div>
  );

  if (user) {
    return (
      <AppShell
        credits={profile?.credits ?? 0}
        plan={profile?.plan ?? "free"}
        userEmail={user.email}
      >
        {content}
      </AppShell>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 gap-4">
          <Link href="/" className="font-semibold tracking-tight text-foreground">
            {t("brand.name")}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact className="max-w-[180px]" />
            <Link href="/login?redirect=/pricing">
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
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10">
        {content}
      </main>
    </div>
  );
}
