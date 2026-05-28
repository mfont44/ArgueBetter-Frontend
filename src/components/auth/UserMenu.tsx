"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  userEmail?: string | null;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {t("auth.profile")}
        <span className="ml-1 text-muted-foreground" aria-hidden>
          ▾
        </span>
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card py-1 shadow-lg z-50"
          )}
        >
          {userEmail && (
            <p className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-border">
              {userEmail}
            </p>
          )}
          <Link
            href="/profile"
            role="menuitem"
            className="block px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            {t("auth.profileSettings")}
          </Link>
          <div className="px-3 py-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t("language.label")}
            </p>
            <LanguageSwitcher variant="menu" />
          </div>
          <div className="px-3 py-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t("theme.appearance")}
            </p>
            <ThemeSelector compact />
          </div>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={handleSignOut}
          >
            {t("auth.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
