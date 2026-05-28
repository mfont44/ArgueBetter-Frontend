"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function CheckoutSuccessBanner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const upgraded = searchParams.get("upgraded");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (checkout === "success") {
    return (
      <Alert
        variant="info"
        className="mb-6 bg-success-muted text-success border border-success/20"
      >
        <div className="flex items-start justify-between gap-4">
          <p>{t("billing.welcomePremium")}</p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-sm shrink-0 underline hover:no-underline"
          >
            {t("common.dismiss")}
          </button>
        </div>
      </Alert>
    );
  }

  if (upgraded === "1") {
    return (
      <Alert
        variant="info"
        className="mb-6 bg-success-muted text-success border border-success/20"
      >
        <div className="flex items-start justify-between gap-4">
          <p>{t("billing.subscriptionActive")}</p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-sm shrink-0 underline hover:no-underline"
          >
            {t("common.dismiss")}
          </button>
        </div>
      </Alert>
    );
  }

  if (checkout === "cancel") {
    return (
      <Alert className="mb-6">
        <p>
          {t("billing.checkoutCancelled", {
            email: t("common.contactEmail"),
          })}
        </p>
      </Alert>
    );
  }

  return null;
}
