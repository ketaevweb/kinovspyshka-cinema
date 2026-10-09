"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  variant?: "banner" | "native";
  className?: string;
}

/**
 * Рекламный слот.
 * Пока AdSense не подключён — показывает промо-секцию «Премиум».
 * Когда AdSense будет подключён — заменить содержимое на <ins class="adsbygoogle">.
 */
export function AdSlot({ variant = "banner", className }: AdSlotProps) {
  if (variant === "native") {
    return (
      <div className={cn("mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8", className)}>
        <div className="flex items-center gap-4 rounded-2xl border border-cinema/20 bg-gradient-to-r from-cinema/5 to-transparent p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cinema/10">
            <Sparkles className="h-6 w-6 text-cinema" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">КиноВспышка Премиум</p>
            <p className="text-xs text-muted-foreground">
              Без рекламы · 4K качество · Ранний доступ к новинкам · Скоро
            </p>
          </div>
          <button className="rounded-full border border-cinema/30 bg-cinema/5 px-4 py-1.5 text-xs font-medium text-cinema transition hover:bg-cinema/10">
            Узнать больше
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8", className)}>
      <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/20 text-xs text-muted-foreground/40">
        {/* AdSense slot — замените на <ins class="adsbygoogle" ...> когда AdSense будет подключён */}
        Рекламное место · AdSense
      </div>
    </div>
  );
}
