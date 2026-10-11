"use client";

import { useEffect, useState } from "react";
import { Menu, X, Play, Heart, Clock, GitCompare, User, Home, Film, Sparkles, Shuffle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  onNavigate: (anchor: string) => void;
  onRandomClick?: () => void;
  onCompareClick?: () => void;
  onFavoritesClick?: () => void;
  favoritesCount?: number;
  watchHistoryCount?: number;
}

export function MobileMenu({
  onNavigate,
  onRandomClick,
  onCompareClick,
  onFavoritesClick,
  favoritesCount = 0,
  watchHistoryCount = 0,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const handleNavigate = (anchor: string) => {
    setOpen(false);
    onNavigate(anchor);
  };

  const items = [
    { label: "Главная", icon: Home, anchor: "#hero" },
    { label: "Каталог", icon: Film, anchor: "#catalog" },
    { label: "В тренде", icon: Sparkles, anchor: "#trending" },
    { label: "Новинки", icon: Play, anchor: "#new" },
    { label: "Поиск", icon: Film, anchor: "#search" },
  ];

  if (favoritesCount > 0) {
    items.push({ label: `Избранное (${favoritesCount})`, icon: Heart, anchor: "#favorites" });
  }
  if (watchHistoryCount > 0) {
    items.push({ label: `История (${watchHistoryCount})`, icon: Clock, anchor: "#history" });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Меню">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 border-white/10 bg-card/95 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cinema">
              <Play className="h-4 w-4 fill-white text-white" />
            </span>
            Кино<span className="text-cinema">Вспышка</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.anchor}
                onClick={() => handleNavigate(item.anchor)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 transition hover:bg-cinema/10 hover:text-cinema"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Быстрые действия */}
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Быстрые действия
          </p>
          <div className="flex gap-2">
            {onRandomClick && (
              <button
                onClick={() => {
                  setOpen(false);
                  onRandomClick();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 text-sm font-medium transition hover:border-cinema hover:text-cinema"
              >
                <Shuffle className="h-4 w-4" />
                Случайное
              </button>
            )}
            {onCompareClick && (
              <button
                onClick={() => {
                  setOpen(false);
                  onCompareClick();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 text-sm font-medium transition hover:border-cinema hover:text-cinema"
              >
                <GitCompare className="h-4 w-4" />
                Сравнить
              </button>
            )}
          </div>
        </div>

        {/* Горячие клавиши */}
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Горячие клавиши
          </p>
          <div className="flex flex-wrap gap-1.5 px-3">
            {[
              { key: "⌘K", label: "Поиск" },
              { key: "T", label: "Тема" },
              { key: "L", label: "Язык" },
              { key: "R", label: "Случайное" },
              { key: "C", label: "Сравнить" },
              { key: "/", label: "Поиск" },
            ].map((h) => (
              <div key={h.key} className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{h.key}</kbd>
                <span className="text-[10px] text-muted-foreground">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
