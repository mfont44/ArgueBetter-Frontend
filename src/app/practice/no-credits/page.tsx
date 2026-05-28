import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getProfile } from "@/lib/profile";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { redirect } from "next/navigation";

export default async function NoCreditsPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.credits > 0) redirect("/practice/categories");

  return (
    <AppShell credits={0} plan={profile.plan}>
      <Card className="text-center py-12 space-y-4">
        <h1 className="text-2xl font-semibold">{t("noCredits.title")}</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {t("noCredits.message")}
        </p>
        <Link href="/dashboard">
          <Button variant="outline">{t("common.backToDashboard")}</Button>
        </Link>
      </Card>
    </AppShell>
  );
}
