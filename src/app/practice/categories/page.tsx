import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getProfile } from "@/lib/profile";
import { canUseCustomScenario } from "@/lib/entitlements";
import { CATEGORIES } from "@/lib/constants";
import { categoryDescription, categoryLabel } from "@/lib/i18n-display";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);
  const profile = await getProfile();
  if (profile && profile.credits <= 0) {
    redirect("/practice/no-credits");
  }

  return (
    <AppShell credits={profile?.credits ?? 0} plan={profile?.plan ?? "free"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("categories.choose")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("categories.chooseSubtitle")}
          </p>
        </div>

        <div className="grid gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/practice/setup?category=${cat.id}`}>
              <Card className="hover:border-accent/50 transition-colors cursor-pointer flex items-center gap-4 py-4">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-medium">{categoryLabel(t, cat.id)}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryDescription(t, cat.id)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}

          {profile && canUseCustomScenario(profile.plan) ? (
            <Link href="/practice/setup?category=custom">
              <Card className="hover:border-accent/50 transition-colors cursor-pointer flex items-center gap-4 py-4">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-medium">{t("categories.customTitle")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("categories.customDesc")}
                  </p>
                </div>
                <Badge variant="accent">{t("categories.customBadge")}</Badge>
              </Card>
            </Link>
          ) : (
            <Card className="opacity-60 flex items-center gap-4 py-4">
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <p className="font-medium">{t("categories.customTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("categories.customLockedDesc")}
                </p>
              </div>
              <Link href="/pricing">
                <Button size="sm" variant="outline">
                  {t("categories.upgrade")}
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
