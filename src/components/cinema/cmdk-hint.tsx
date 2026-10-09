"use client";

import { useEffect, useState } from "react";
import { Command, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface CmdKHintProps {
  onClick: () => void;
  onRandomClick?: () => void;
}

/** Плавающая кнопка ⌘K для командной палитры + кнопка случайного фильма */
export function CmdKHint({ onClick, onRandomClick }: CmdKHintProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-30 flex items-center gap-2 transition-all",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
      )}
    >
      {/* Случайный фильм */}
      {onRandomClick && (
        <button
          onClick={onRandomClick}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-card/80 px-3 py-2.5 text-sm font-medium shadow-lg backdrop-blur-xl transition hover:border-cinema hover:text-cinema"
          aria-label="Случайный фильм"
          title="Случайный фильм (R)"
        >
          <Shuffle className="h-4 w-4" />
          <kbd className="hidden items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold sm:flex">
            R
          </kbd>
        </button>
      )}

      {/* Командная палитра */}
      <button
        onClick={onClick}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-card/80 px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-xl transition hover:border-cinema hover:text-cinema"
        aria-label={t("cmdk.openLabel")}
      >
        <Command className="h-4 w-4" />
        <span className="hidden sm:inline">{t("cmdk.quickSearch")}</span>
        <kbd className="hidden items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold sm:flex">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
