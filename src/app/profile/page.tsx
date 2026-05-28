import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { DeleteAccountSection } from "@/components/auth/DeleteAccountSection";
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton";
import { CheckoutSuccessBanner } from "@/components/billing/CheckoutSuccessBanner";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import {
  formatPlanLabel,
  formatSessionsRemaining,
} from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function ProfilePage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <AppShell
      credits={profile?.credits ?? 0}
      plan={profile?.plan ?? "free"}
      userEmail={user.email}
    >
      <div className="space-y-8">
        <Suspense fallback={null}>
          <CheckoutSuccessBanner />
        </Suspense>

        <div>
          <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("profile.subtitle")}
          </p>
        </div>

        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              {t("theme.appearance")}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {t("theme.help")}
            </p>
            <ThemeSelector />
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("profile.account")}
          </h2>
          <p className="text-sm">
            <span className="text-muted-foreground">{t("profile.emailLabel")} </span>
            {user.email}
          </p>
          {profile && (
            <>
              <p className="text-sm flex items-center gap-2">
                <span className="text-muted-foreground">{t("profile.planLabel")} </span>
                <Badge
                  variant={profile.plan === "premium" ? "accent" : "default"}
                >
                  {formatPlanLabel(locale, profile.plan)}
                </Badge>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">
                  {t("profile.sessionsLabel")}{" "}
                </span>
                {formatSessionsRemaining(locale, profile.credits, profile.plan)}
              </p>
            </>
          )}
        </Card>

        {profile && (
          <Card className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("profile.subscription")}
            </h2>
            {profile.plan === "premium" ? (
              <ManageSubscriptionButton />
            ) : (
              <Link href="/pricing">
                <Button>{t("billing.upgradeToPremium")}</Button>
              </Link>
            )}
          </Card>
        )}

        <ChangePasswordForm email={user.email} />
        <DeleteAccountSection email={user.email} />
      </div>
    </AppShell>
  );
}
