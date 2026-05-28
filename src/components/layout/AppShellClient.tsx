"use client";

import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { formatSessionsRemaining } from "@/lib/entitlements";
import type { UserPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AppShellClientProps {
  children: React.ReactNode;
  credits?: number;
  plan?: UserPlan;
  mainClassName?: string;
}

export function AppShellClient({
  children,
  credits,
  plan = "free",
  mainClassName,
}: AppShellClientProps) {
  const { locale } = useI18n();

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 gap-3">
          <Link href="/dashboard" className="font-semibold text-foreground tracking-tight shrink-0">
            ArgueBetter
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {credits !== undefined && (
              <span className="text-sm text-muted-foreground text-right leading-tight">
                {formatSessionsRemaining(locale, credits, plan)}
              </span>
            )}
            <UserMenu />
          </div>
        </div>
      </header>
      <main
        className={cn(
          "flex-1 mx-auto flex w-full max-w-2xl flex-col px-4 py-10 min-h-0",
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}
