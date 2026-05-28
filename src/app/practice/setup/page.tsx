import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SetupWizard } from "@/components/practice/SetupWizard";
import { canUseCustomScenario } from "@/lib/entitlements";
import { getProfile } from "@/lib/profile";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

type SetupPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.credits <= 0) redirect("/practice/no-credits");

  const { category } = await searchParams;
  if (category === "custom" && !canUseCustomScenario(profile.plan)) {
    redirect("/pricing");
  }

  return (
    <Suspense
      fallback={
        <p className="p-8 text-center text-muted-foreground">{t("common.loading")}</p>
      }
    >
      <SetupWizard credits={profile.credits} plan={profile.plan} />
    </Suspense>
  );
}
