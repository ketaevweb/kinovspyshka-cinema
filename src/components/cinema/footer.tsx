"use client";

import { Film, Send, Github, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SupportButton } from "./support-button";

export function Footer({ favoritesCount = 0, onExportFavorites }: { favoritesCount?: number; onExportFavorites?: () => void }) {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-white/5 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cinema">
                <Film className="h-4 w-4 text-white" />
              </span>
              <span className="text-base font-extrabold tracking-tight">
                Кино<span className="text-cinema">Вспышка</span>
              </span>
            </div>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <a href="#hero" className="transition hover:text-foreground">{t("nav.home")}</a>
            <a href="#catalog" className="transition hover:text-foreground">{t("nav.catalog")}</a>
            <a href="#trending" className="transition hover:text-foreground">{t("nav.trending")}</a>
            <a href="#new" className="transition hover:text-foreground">{t("nav.new")}</a>
            <a href="#search" className="transition hover:text-foreground">{t("nav.search")}</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://t.me/share/url?url=https://kino.kataevweb.ru"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-background/60 text-muted-foreground transition hover:border-cinema hover:text-cinema"
            >
              <Send className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-background/60 text-muted-foreground transition hover:border-cinema hover:text-cinema"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Поддержать проект + экспорт избранного */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <SupportButton />
          {favoritesCount > 0 && (
            <button
              onClick={onExportFavorites}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-cinema hover:text-cinema"
            >
              📥 Экспорт избранного
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">⌘K</kbd>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">T</kbd>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">L</kbd>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">/</kbd>
              <span className="ml-1">— горячие клавиши</span>
            </span>
            <p className="flex items-center gap-1.5">
              {t("footer.madeWith")} <Heart className="h-3.5 w-3.5 fill-cinema text-cinema" /> {t("footer.forCinema")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
