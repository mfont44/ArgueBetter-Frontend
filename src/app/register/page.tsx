import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthPageChrome } from "@/components/i18n/AuthPageChrome";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { FREE_WELCOME_SESSIONS } from "@/lib/entitlements";

export default async function RegisterPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  return (
    <AuthPageChrome>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-semibold text-lg mb-8">
          {t("brand.name")}
        </Link>
        <h1 className="text-2xl font-semibold mb-2">{t("auth.createAccount")}</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {t("auth.welcomeSessions", { count: FREE_WELCOME_SESSIONS })}
        </p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            {t("common.logIn")}
          </Link>
        </p>
      </div>
    </AuthPageChrome>
  );
}
