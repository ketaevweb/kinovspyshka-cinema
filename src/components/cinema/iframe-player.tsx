"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink, AlertCircle, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface IframePlayerProps {
  /** ID Кинопоиска — формирует URL https://fzz-0ejfn0o.troutcdn.site/{id} */
  kinopoiskId: number;
  /** Название фильма (для title iframe и доступности) */
  title: string;
  className?: string;
}

/**
 * Плеер, встраивающий видео с референс-кинотеатра по ID Кинопоиска.
 * Страница https://fzz-0ejfn0o.troutcdn.site/{id} содержит div#movie_video,
 * который скрипт vak345.com/s.js наполняет настоящим видеоплеером.
 */
export function IframePlayer({ kinopoiskId, title, className }: IframePlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const src = `https://fzz-0ejfn0o.troutcdn.site/${kinopoiskId}`;

  // Защитный таймаут: если onLoad не сработал за 12с — показываем fallback
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false);
    }, 12000);
    return () => clearTimeout(id);
  }, [kinopoiskId]);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        className
      )}
    >
      {loading && !error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-zinc-900">
          <Loader2 className="h-10 w-10 animate-spin text-cinema" />
          <p className="text-sm text-muted-foreground">Загрузка видеоплеера…</p>
          <p className="text-xs text-muted-foreground/70">
            Источник: kinopoisk.ws / ID {kinopoiskId}
          </p>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-cinema" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Не удалось загрузить встроенный плеер. Откройте источник напрямую в
            новой вкладке — там видео доступно.
          </p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-cinema px-4 py-2 text-sm font-medium text-white transition hover:bg-cinema/90"
          >
            <ExternalLink className="h-4 w-4" /> Открыть на kinopoisk.ws
          </a>
        </div>
      ) : (
        <iframe
          src={src}
          title={`Смотреть «${title}» онлайн`}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      )}

      {/* Бейдж источника */}
      <div className="pointer-events-none absolute bottom-2 right-2 z-30 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur">
        <Film className="h-3 w-3" />
        kinopoisk.ws
      </div>
    </div>
  );
}
