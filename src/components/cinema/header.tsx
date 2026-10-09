"use client";

import { Play, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearchClick: () => void;
  onLogoClick: () => void;
}

export function Header({ onSearchClick, onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onLogoClick}
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="На главную"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cinema shadow-[0_0_20px_oklch(0.605_0.234_27.4/0.5)]">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Кино<span className="text-cinema">Вспышка</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: "Главная", href: "#hero" },
            { label: "Каталог", href: "#catalog" },
            { label: "В тренде", href: "#trending" },
            { label: "Новинки", href: "#new" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className={cn("gap-2 text-muted-foreground hover:text-foreground")}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Поиск</span>
          </Button>
          <Button
            size="sm"
            className="hidden bg-cinema text-white hover:bg-cinema/90 sm:inline-flex"
            onClick={() => {
              const el = document.getElementById("catalog");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Смотреть
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Меню">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
