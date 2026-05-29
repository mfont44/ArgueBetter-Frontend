"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { AppShellClient } from "@/components/layout/AppShellClient";
import { DifficultySlider } from "@/components/practice/DifficultySlider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Alert } from "@/components/ui/Alert";
import { TONES, DEFAULT_DIFFICULTY, getCategorySetup } from "@/lib/constants";
import {
  categoryLabel,
  categoryTitlePlaceholder,
  roleLabel,
  tagLabel,
  toneLabel,
} from "@/lib/i18n-display";
import { createConversation, ApiError, formatApiErrorI18n } from "@/lib/api";
import { toApiLanguage } from "@/lib/i18n-core";
import { createClient } from "@/lib/supabase/client";
import type { UserPlan } from "@/lib/types";

export function SetupWizard({
  credits,
  plan = "free",
}: {
  credits: number;
  plan?: UserPlan;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "work_career";
  const setup = useMemo(() => getCategorySetup(category), [category]);

  const steps = [t("setup.stepConversation"), t("setup.stepOtherPerson")];

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [situationAndGoal, setSituationAndGoal] = useState("");
  const [worriesOrAvoid, setWorriesOrAvoid] = useState("");
  const [desiredTone, setDesiredTone] = useState<string>(TONES[0].id);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [otherRole, setOtherRole] = useState<string>(setup.defaultRole);
  const [tags, setTags] = useState<string[]>([]);
  const [otherDescription, setOtherDescription] = useState("");

  useEffect(() => {
    setOtherRole(setup.defaultRole);
    setTags((prev) =>
      prev.filter((tag) =>
        setup.personalityTags.includes(tag as (typeof setup.personalityTags)[number])
      )
    );
  }, [category, setup.defaultRole, setup.personalityTags]);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }

  const canContinueStep0 = title.trim() && situationAndGoal.trim();
  const canSubmit = tags.length > 0 || otherDescription.trim();

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const profileText = [...tags, otherDescription.trim()]
      .filter(Boolean)
      .join(". ");

    const combined = situationAndGoal.trim();
    let situationContext = combined;
    if (worriesOrAvoid.trim()) {
      situationContext += `\n\n${t("setup.whatToAvoidPrefix")} ${worriesOrAvoid.trim()}`;
    }

    try {
      const result = await createConversation(session.access_token, {
        category,
        title: title.trim(),
        situation_context: situationContext,
        goal: combined,
        fear: worriesOrAvoid.trim() || undefined,
        desired_tone: desiredTone,
        difficulty,
        other_person_role: otherRole,
        other_person_profile: profileText || t("common.notSpecified"),
        personality_tags: tags,
        language: toApiLanguage(locale),
      });

      sessionStorage.setItem(
        `briefing-${result.conversation_id}`,
        JSON.stringify(result.briefing)
      );
      router.push(`/practice/briefing/${result.conversation_id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        router.push("/practice/no-credits");
        return;
      }
      setError(formatApiErrorI18n(err, t, "common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShellClient credits={credits} plan={plan}>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          {categoryLabel(t, category)}
        </p>
        <h1 className="text-2xl font-semibold mb-6">{t("setup.title")}</h1>
        <StepIndicator steps={steps} current={step} />

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("setup.conversationTitle")}
              </label>
              <Input
                placeholder={categoryTitlePlaceholder(t, category)}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("setup.situationGoal")}
              </label>
              <Textarea
                placeholder={t("setup.situationPlaceholder")}
                value={situationAndGoal}
                onChange={(e) => setSituationAndGoal(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("setup.amountsHint")}
              </p>
            </div>

            <DifficultySlider value={difficulty} onChange={setDifficulty} />

            <details className="rounded-xl border border-border bg-card/50 px-4 py-3 group">
              <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                {t("setup.additionalInfo")}
                <span className="text-muted-foreground text-xs group-open:hidden">
                  {t("common.optional")}
                </span>
              </summary>
              <div className="space-y-4 mt-4 pt-2 border-t border-border">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t("setup.worriesLabel")}
                  </label>
                  <Textarea
                    placeholder={t("setup.worriesPlaceholder")}
                    value={worriesOrAvoid}
                    onChange={(e) => setWorriesOrAvoid(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {t("setup.desiredTone")}
                  </label>
                  <Select
                    value={desiredTone}
                    onChange={(e) => setDesiredTone(e.target.value)}
                  >
                    {TONES.map((tone) => (
                      <option key={tone.id} value={tone.id}>
                        {toneLabel(t, tone.id)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </details>

            <Button
              className="w-full"
              onClick={() => setStep(1)}
              disabled={!canContinueStep0}
            >
              {t("common.continue")}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("setup.whoTalkingTo")}
              </label>
              <Select
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
              >
                {setup.roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(t, role)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("setup.describeThem")}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {setup.personalityTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs border transition-all duration-200 ${
                      tags.includes(tag)
                        ? "bg-accent text-accent-foreground border-accent ring-2 ring-accent/30 shadow-sm"
                        : "bg-card border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    {tagLabel(t, tag)}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder={t("setup.describePlaceholder")}
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
              />
            </div>

            <p className="text-xs text-muted-foreground rounded-xl bg-muted px-3 py-2">
              {t("setup.disclaimer")}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(0)}
              >
                {t("common.back")}
              </Button>
              <Button
                className="flex-1"
                size="lg"
                loading={loading}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {t("setup.createSession")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShellClient>
  );
}
