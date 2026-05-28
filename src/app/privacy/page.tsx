import Link from "next/link";
import { createTranslator } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function PrivacyPage() {
  const locale = await getCurrentLocale();
  const { t } = createTranslator(locale);

  return (
    <div className="min-h-full max-w-2xl mx-auto px-4 py-12 prose prose-sm">
      <Link href="/" className="text-accent hover:underline text-sm no-underline">
        ← {t("common.home")}
      </Link>
      <h1 className="text-2xl font-semibold mt-6 mb-4">{t("legal.privacyTitle")}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("legal.privacyP1")}
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed mt-4">
        {t("legal.privacyP2")}
      </p>
    </div>
  );
}
