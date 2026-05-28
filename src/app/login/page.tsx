import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPageChrome } from "@/components/i18n/AuthPageChrome";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function LoginPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  return (
    <AuthPageChrome>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-semibold text-lg mb-8">
          {t("brand.name")}
        </Link>
        <h1 className="text-2xl font-semibold mb-2">{t("auth.welcomeBack")}</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {t("auth.logInSubtitle")}
        </p>
        <Suspense fallback={<p className="text-sm text-muted-foreground">{t("common.loading")}</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="text-accent hover:underline font-medium">
            {t("common.signUp")}
          </Link>
        </p>
      </div>
    </AuthPageChrome>
  );
}
