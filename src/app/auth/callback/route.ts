import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function withQueryParam(path: string, key: string, value: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const isResetPasswordFlow = next.startsWith("/reset-password");

  if (code) {
    const supabase = await createClient();
    const result = await supabase.auth.exchangeCodeForSession(code);
    const { error } = result;
    const redirectType = (result.data as { redirectType?: string | null } | null)?.redirectType;
    if (!error) {
      const destination =
        redirectType === "recovery" && isResetPasswordFlow
          ? withQueryParam(next, "recovery", "1")
          : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }

    if (isResetPasswordFlow) {
      return NextResponse.redirect(
        `${origin}${withQueryParam(next, "error", "recovery_link_invalid")}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
