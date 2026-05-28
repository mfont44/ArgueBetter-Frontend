import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function ForgotPasswordPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-semibold">
          {t("brand.name")}
        </Link>
        <h1 className="mb-2 text-2xl font-semibold">{t("auth.forgotPasswordTitle")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("auth.forgotPasswordSubtitle")}
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.rememberedPassword")}{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            {t("common.backToLogIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
