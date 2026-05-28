"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import {
  createCheckoutSession,
  formatApiErrorI18n,
  type BillingInterval,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface CheckoutButtonProps {
  interval: BillingInterval;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function CheckoutButton({
  interval,
  children,
  className,
  variant = "primary",
  size = "md",
}: CheckoutButtonProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
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
      const { url } = await createCheckoutSession(
        session.access_token,
        interval
      );
      window.location.href = url;
    } catch (err) {
      setLoading(false);
      setError(formatApiErrorI18n(err, t, "billing.checkoutFailed"));
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        loading={loading}
        onClick={handleCheckout}
      >
        {children}
      </Button>
      {error && (
        <Alert variant="error" className="text-sm">
          {error}
        </Alert>
      )}
    </div>
  );
}
