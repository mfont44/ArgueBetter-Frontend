"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Alert } from "@/components/ui/Alert";

export function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    email.length > 0 && password.length >= 6 && confirmPassword.length >= 6 && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    if (data.user) {
      setRegisteredEmail(email);
      setPendingConfirmation(true);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  }

  if (pendingConfirmation) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-8">
          <h2 className="text-lg font-semibold mb-2">{t("auth.checkEmail")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("auth.checkEmailBody", { email: registeredEmail })}
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            {t("common.backToLogIn")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        loading={googleLoading}
        disabled={loading}
      >
        <span className="flex items-center gap-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
            <path
              d="M21.805 10.023H12.25v4.047h5.527c-.238 1.305-.953 2.41-2.025 3.152v2.617h3.281c1.92-1.768 3.022-4.369 3.022-7.449 0-.713-.064-1.398-.25-2.367Z"
              fill="currentColor"
            />
            <path
              d="M12.25 22c2.734 0 5.027-.906 6.703-2.461l-3.281-2.617c-.907.617-2.069.98-3.422.98-2.64 0-4.875-1.78-5.673-4.172H3.203v2.696A10.117 10.117 0 0 0 12.25 22Z"
              fill="currentColor"
            />
            <path
              d="M6.577 13.73A6.057 6.057 0 0 1 6.26 11.95c0-.617.113-1.215.316-1.78V7.476H3.203A10.108 10.108 0 0 0 2.125 11.95c0 1.617.386 3.148 1.078 4.473l3.374-2.694Z"
              fill="currentColor"
            />
            <path
              d="M12.25 5.997c1.489 0 2.812.512 3.86 1.517l2.89-2.89C17.272 2.999 14.979 2 12.25 2 8.297 2 4.86 4.258 3.203 7.477l3.374 2.695c.798-2.394 3.033-4.175 5.673-4.175Z"
              fill="currentColor"
            />
          </svg>
          <span>{t("auth.continueWithGoogle")}</span>
        </span>
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("auth.orContinueWith")}
          </span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("common.email")}</label>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("common.password")}</label>
        <PasswordInput
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">
          {t("auth.confirmPassword")}
        </label>
        <PasswordInput
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-destructive mt-1">
            {t("auth.passwordsDoNotMatch")}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={!canSubmit || googleLoading}
      >
        {t("auth.createAccount")}
      </Button>
    </form>
  );
}
