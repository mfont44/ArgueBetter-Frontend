"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { FREE_WELCOME_SESSIONS } from "@/lib/entitlements";
import type { UserPlan } from "@/lib/types";

const MONTHLY_PRICE = 12.99;
const ANNUAL_PRICE = 99.99;

function annualSavingsPercent(): number {
  const monthlyYear = MONTHLY_PRICE * 12;
  return Math.round(((monthlyYear - ANNUAL_PRICE) / monthlyYear) * 100);
}

interface PricingCardsProps {
  isLoggedIn: boolean;
  plan: UserPlan | null;
}

export function PricingCards({ isLoggedIn, plan }: PricingCardsProps) {
  const { t } = useI18n();
  const isPremium = plan === "premium";
  const savings = annualSavingsPercent();

  const freeFeatures = [
    t("billing.freeFeature1", { count: FREE_WELCOME_SESSIONS }),
    t("billing.freeFeature2"),
    t("billing.freeFeature3"),
  ];

  const premiumFeatures = [
    t("billing.premiumFeature1"),
    t("billing.premiumFeature2"),
    t("billing.premiumFeature3"),
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
      <Card className="space-y-4 py-6">
        <div>
          <h2 className="text-lg font-semibold">{t("billing.free")}</h2>
          <p className="text-2xl font-semibold mt-2">{t("billing.priceFree")}</p>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          {freeFeatures.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-accent">✓</span>
              {f}
            </li>
          ))}
        </ul>
        {!isLoggedIn ? (
          <Link href="/register">
            <Button variant="outline" className="w-full">
              {t("common.getStarted")}
            </Button>
          </Link>
        ) : isPremium ? (
          <p className="text-sm text-muted-foreground">{t("billing.previousPlan")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("billing.currentPlan")}</p>
        )}
      </Card>

      <Card className="space-y-4 py-6 border-accent/40 ring-1 ring-accent/20">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{t("billing.premium")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("billing.priceMonthlyAnnual", {
                monthly: MONTHLY_PRICE.toFixed(2),
                annual: ANNUAL_PRICE.toFixed(2),
              })}
            </p>
          </div>
          {isPremium && <Badge variant="accent">{t("billing.activeBadge")}</Badge>}
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          {premiumFeatures.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-accent">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {isPremium ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              {t("billing.youOnPremium")}
            </p>
            <ManageSubscriptionButton className="w-full" />
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full">
                {t("billing.goToDashboard")}
              </Button>
            </Link>
          </div>
        ) : !isLoggedIn ? (
          <div className="space-y-3">
            <Link href="/register">
              <Button className="w-full">{t("billing.signUpToUpgrade")}</Button>
            </Link>
            <Link href="/login?redirect=/pricing">
              <Button variant="outline" className="w-full">
                {t("common.logIn")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <CheckoutButton interval="month" className="w-full" size="lg">
              {t("billing.monthlyPrice", { price: MONTHLY_PRICE.toFixed(2) })}
            </CheckoutButton>
            <CheckoutButton
              interval="year"
              variant="outline"
              className="w-full"
              size="lg"
            >
              {t("billing.annualPrice", {
                price: ANNUAL_PRICE.toFixed(2),
                savings,
              })}
            </CheckoutButton>
          </div>
        )}
      </Card>
    </div>
  );
}
