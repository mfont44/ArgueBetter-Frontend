"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount, formatApiErrorI18n } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

interface DeleteAccountSectionProps {
  email: string;
}

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      setError(null);
      setConfirmDelete(true);
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setError(t("auth.notAuthenticated"));
      return;
    }

    try {
      await deleteAccount(session.access_token);
    } catch (err) {
      setLoading(false);
      setError(formatApiErrorI18n(err, t, "common.somethingWentWrong"));
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="border-destructive/25">
      <h2 className="font-medium text-destructive mb-2">{t("auth.deleteAccount")}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t("auth.deleteAccountWarning")}
      </p>
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {confirmDelete && (
        <Alert variant="warning" className="mb-4">
          {t("auth.deleteAccountWarning")}{" "}
          <span className="font-medium">{email}</span>
        </Alert>
      )}
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive-muted"
          loading={loading}
          onClick={handleDelete}
        >
          {confirmDelete ? t("auth.permanentlyDelete") : t("auth.deleteAccount")}
        </Button>
        {confirmDelete && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setConfirmDelete(false);
              setError(null);
            }}
          >
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </Card>
  );
}
