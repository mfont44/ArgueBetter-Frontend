"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { createPortalSession, formatApiErrorI18n } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface ManageSubscriptionButtonProps {
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function ManageSubscriptionButton({
  className,
  variant = "outline",
}: ManageSubscriptionButtonProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePortal() {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setError(t("billing.loginToContinue"));
      return;
    }

    try {
      const { url } = await createPortalSession(session.access_token);
      window.location.href = url;
    } catch (err) {
      setLoading(false);
      setError(formatApiErrorI18n(err, t, "billing.portalFailed"));
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        className={className}
        loading={loading}
        onClick={handlePortal}
      >
        {t("billing.manageSubscription")}
      </Button>
      {error && (
        <Alert variant="error" className="text-sm">
          {error}
        </Alert>
      )}
    </div>
  );
}
