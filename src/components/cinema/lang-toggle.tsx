"use client";

import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-full border border-white/10 bg-card p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold transition",
            lang === l.code
              ? "bg-cinema text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={l.label}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
