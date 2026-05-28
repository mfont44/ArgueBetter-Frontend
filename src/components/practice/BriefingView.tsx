"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { AppShellClient } from "@/components/layout/AppShellClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Briefing } from "@/lib/types";

export function BriefingView({
  conversationId,
  credits,
  plan = "free",
}: {
  conversationId: string;
  credits: number;
  plan?: import("@/lib/types").UserPlan;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`briefing-${conversationId}`);
    if (raw) {
      setBriefing(JSON.parse(raw) as Briefing);
    } else {
      router.replace(`/practice/chat/${conversationId}`);
    }
  }, [conversationId, router]);

  if (!briefing) {
    return (
      <AppShellClient credits={credits} plan={plan}>
        <p className="text-muted-foreground">{t("briefing.loading")}</p>
      </AppShellClient>
    );
  }

  return (
    <AppShellClient credits={credits} plan={plan}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("briefing.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("briefing.subtitle")}
          </p>
        </div>

        <Card className="space-y-4">
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              {t("briefing.summary")}
            </h2>
            <p className="text-sm">{briefing.summary}</p>
          </section>
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              {t("briefing.objective")}
            </h2>
            <p className="text-sm">{briefing.objective}</p>
          </section>
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              {t("briefing.risks")}
            </h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {briefing.risks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              {t("briefing.keyPoints")}
            </h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {briefing.key_points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl bg-muted p-5">
            <h2 className="text-sm font-medium mb-1">{t("briefing.suggestedOpener")}</h2>
            <p className="text-sm italic">&ldquo;{briefing.suggested_opener}&rdquo;</p>
          </section>
        </Card>

        <Link href={`/practice/chat/${conversationId}`}>
          <Button className="w-full" size="lg">
            {t("briefing.start")}
          </Button>
        </Link>
      </div>
    </AppShellClient>
  );
}
