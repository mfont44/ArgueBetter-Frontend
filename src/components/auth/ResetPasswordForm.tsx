"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PasswordInput } from "@/components/ui/PasswordInput";

const MIN_PASSWORD_LENGTH = 6;

type SessionStatus = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("checking");

  const callbackError = searchParams.get("error");
  const hasRecoveryMarker = searchParams.get("recovery") === "1";
  const requiresRecoveryValidation = !callbackError && hasRecoveryMarker;
  const effectiveSessionStatus = requiresRecoveryValidation ? sessionStatus : "invalid";
  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    effectiveSessionStatus === "ready" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch;

  const invalidMessage = useMemo(() => {
    if (callbackError === "recovery_link_invalid") {
      return t("auth.invalidResetLink");
    }

    if (!hasRecoveryMarker) {
      return t("auth.invalidResetLink");
    }

    return t("auth.invalidResetLink");
  }, [callbackError, hasRecoveryMarker, t]);

  useEffect(() => {
    if (!requiresRecoveryValidation) {
      return;
    }

    let cancelled = false;

    async function validateRecoverySession() {
      setSessionStatus("checking");
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (userError || !user) {
        setSessionStatus("invalid");
        setError(t("auth.invalidResetLink"));
        return;
      }

      setSessionStatus("ready");
    }

    void validateRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [requiresRecoveryValidation, t]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [router, success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.passwordMinLength", { min: MIN_PASSWORD_LENGTH }));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(t("auth.passwordUpdatedRedirect"));
    setPassword("");
    setConfirmPassword("");
  }

  if (effectiveSessionStatus === "invalid") {
    return (
      <div className="space-y-4">
        <Alert variant="warning">{error ?? invalidMessage}</Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/forgot-password" className="w-full sm:w-auto">
            <Button className="w-full">{t("auth.requestNewResetLink")}</Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              {t("common.backToLogIn")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="info">{success}</Alert>}
      {effectiveSessionStatus === "checking" && (
        <Alert variant="info">{t("auth.validatingResetLink")}</Alert>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("auth.newPassword")}</label>
        <PasswordInput
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("auth.confirmPassword")}
        </label>
        <PasswordInput
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="mt-1 text-xs text-destructive">{t("auth.passwordsDoNotMatch")}</p>
        )}
      </div>
      <Button type="submit" className="w-full" loading={loading} disabled={!canSubmit}>
        {t("auth.updatePassword")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-accent hover:underline">
          {t("common.backToLogIn")}
        </Link>
      </p>
    </form>
  );
}
