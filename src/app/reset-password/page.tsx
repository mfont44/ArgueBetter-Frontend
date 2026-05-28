import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function ResetPasswordPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-semibold">
          {t("brand.name")}
        </Link>
        <h1 className="mb-2 text-2xl font-semibold">{t("auth.setNewPassword")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("auth.setNewPasswordSubtitle")}
        </p>
        <Suspense fallback={<p className="text-sm text-muted-foreground">{t("common.loading")}</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
