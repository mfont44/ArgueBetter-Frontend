"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import type { EndReason } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n-core";

const END_REASON_KEYS: Record<string, TranslationKey> = {
  natural_closure: "chat.endReasonNatural",
  max_exchanges: "chat.endReasonMax",
  stalemate: "chat.endReasonStalemate",
  goal_reached: "chat.endReasonGoal",
};

interface SessionEndBannerProps {
  endReason?: EndReason | string | null;
  exchangeCount?: number;
  onEnd: () => void;
  loading?: boolean;
}

export function SessionEndBanner({
  endReason,
  exchangeCount = 0,
  onEnd,
  loading,
}: SessionEndBannerProps) {
  const { t } = useI18n();

  const messageKey: TranslationKey =
    (endReason && END_REASON_KEYS[endReason]) || "chat.endReasonDefault";

  return (
    <div
      className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-4 space-y-3"
      role="status"
    >
      <p className="text-sm text-foreground">{t(messageKey)}</p>
      {exchangeCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {t("chat.exchange", { n: exchangeCount })}
        </p>
      )}
      <Button className="w-full" onClick={onEnd} loading={loading}>
        {t("chat.endAndFeedback")}
      </Button>
    </div>
  );
}
