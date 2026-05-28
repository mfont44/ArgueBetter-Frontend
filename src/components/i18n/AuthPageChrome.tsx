"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";

export function AuthPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex justify-end px-4 pt-4">
        <LanguageSwitcher compact className="max-w-[180px]" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
