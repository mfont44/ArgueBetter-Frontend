import Link from "next/link";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function TermsPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  return (
    <div className="min-h-full max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-accent hover:underline text-sm">
        ← {t("common.home")}
      </Link>
      <h1 className="text-2xl font-semibold mt-6 mb-4">{t("legal.termsTitle")}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("legal.termsP1")}
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed mt-4">
        {t("legal.termsP2")}
      </p>
    </div>
  );
}
