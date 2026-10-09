"use client";

import { Heart, Coffee, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SUPPORT_LINKS = [
  {
    name: "Boosty",
    url: "https://boosty.to/kinovspyshka",
    color: "bg-[#FF8A00] text-white hover:bg-[#FF8A00]/90",
    icon: "🚀",
    description: "Подписка на Boosty",
  },
  {
    name: "Telegram",
    url: "https://t.me/kinovspyshka",
    color: "bg-[#0088CC] text-white hover:bg-[#0088CC]/90",
    icon: "✈️",
    description: "Поддержать через Telegram",
  },
  {
    name: "CloudTips",
    url: "https://pay.cloudtips.ru/p/kinovspyshka",
    color: "bg-[#14B8A6] text-white hover:bg-[#14B8A6]/90",
    icon: "💳",
    description: "Чаевые через CloudTips",
  },
];

export function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-cinema/30 bg-cinema/5 px-3 py-1.5 text-xs font-medium text-cinema transition hover:bg-cinema/10"
      >
        <Heart className="h-3.5 w-3.5 fill-cinema" />
        Поддержать проект
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-white/10 bg-card/95">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Coffee className="h-5 w-5 text-cinema" />
            Поддержите КиноВспышку
          </DialogTitle>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              КиноВспышка — бесплатный кинотеатр без рекламы. Мы существуем благодаря вашей поддержке.
              Любая сумма помогает нам развивать проект и добавлять новые фильмы.
            </p>

            <div className="space-y-2">
              {SUPPORT_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${s.color}`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs opacity-80">{s.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-50" />
                </a>
              ))}
            </div>

            <div className="rounded-lg border border-white/5 bg-background/40 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                💎 Премиум-подписка скоро: без рекламы, 4K качество, ранний доступ к новинкам
              </p>
            </div>

            <p className="text-center text-[10px] text-muted-foreground/50">
              Спасибо за вашу поддержку! ❤️
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
