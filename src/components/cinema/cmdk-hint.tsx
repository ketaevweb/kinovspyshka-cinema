"use client";

import { useEffect, useState } from "react";
import { Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface CmdKHintProps {
  onClick: () => void;
}

/** Плавающая кнопка ⌘K для открытия командной палитры */
export function CmdKHint({ onClick }: CmdKHintProps) {
  const [visible, setVisible] = useState(false);

  // Показываем после небольшого скролла (чтобы не мешать hero)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-card/80 px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-xl transition-all hover:border-cinema hover:text-cinema",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
      )}
      aria-label="Открыть командную палитру (⌘K)"
    >
      <Command className="h-4 w-4" />
      <span className="hidden sm:inline">Быстрый поиск</span>
      <kbd className="hidden items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold sm:flex">
        ⌘K
      </kbd>
    </button>
  );
}
