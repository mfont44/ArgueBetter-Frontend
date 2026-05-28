"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";

interface ResolutionModalProps {
  open: boolean;
  onEnd: () => void;
  onContinue: () => void;
  loading?: boolean;
  /** Third strike: no continue, only finishing */
  forceEnd?: boolean;
  /** Shown when intercepting send after agreement (user has read the reply) */
  beforeSend?: boolean;
}

export function ResolutionModal({
  open,
  onEnd,
  onContinue,
  loading,
  forceEnd,
  beforeSend,
}: ResolutionModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  const title = forceEnd
    ? t("chat.resolutionCompleteTitle")
    : t("chat.resolutionAgreementTitle");

  const body = forceEnd
    ? t("chat.resolutionCompleteBody")
    : t("chat.resolutionAgreementBody");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolution-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
        <h2 id="resolution-modal-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{body}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {!forceEnd && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onContinue}
              disabled={loading}
            >
              {beforeSend ? t("chat.sendReply") : t("chat.continueConversation")}
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={onEnd}
            loading={loading}
          >
            {t("chat.endAndFeedback")}
          </Button>
        </div>
      </div>
    </div>
  );
}
