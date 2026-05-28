import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/UserMenu";
import { formatSessionsRemaining } from "@/lib/entitlements";
import { getCurrentLocale } from "@/lib/i18n-server";
import type { UserPlan } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  credits?: number;
  plan?: UserPlan;
  userEmail?: string | null;
}

export async function AppShell({
  children,
  credits,
  plan = "free",
  userEmail,
}: AppShellProps) {
  const locale = await getCurrentLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-full flex flex-col bg-background">
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
            {user && <UserMenu userEmail={userEmail ?? user.email} />}
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10">{children}</main>
    </div>
  );
}
