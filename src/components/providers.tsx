"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { AIChat } from "@/components/cinema/ai-chat";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <I18nProvider>
          {children}
          <AIChat />
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
