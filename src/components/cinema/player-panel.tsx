"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ExternalLink, Search, Film, ShieldOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerPanelProps {
  /** ID Кинопоиска */
  kinopoiskId: number;
  /** Название фильма (для подписи) */
  title: string;
  /** Оригинальное название (для поиска трейлера) */
  originalTitle?: string;
  /** Год (для поиска) */
  year?: number;
  /** Постер/backdrop для фона */
  backdropUrl?: string;
  posterUrl?: string;
  className?: string;
}

/**
 * Панель просмотра фильма.
 *
 * Референс-кинотеатр отдаёт настоящее видео через сторонний плеер linkpp.ink,
 * который ставит X-Frame-Options / frame-ancestors и потому НЕ встраивается
 * на чужом домене (ERR_BLOCKED_BY_RESPONSE). Зато страница референса отлично
 * работает как top-level страница — поэтому видео открываем в новой вкладке.
 */
export function PlayerPanel({
  kinopoiskId,
  title,
  originalTitle,
  year,
  backdropUrl,
  posterUrl,
  className,
}: PlayerPanelProps) {
  const [imgError, setImgError] = useState(false);
  const watchUrl = `https://fzz-0ejfn0o.troutcdn.site/${kinopoiskId}`;
  const searchUrl = `https://fzz-0ejfn0o.troutcdn.site/searchname.php?name=${encodeURIComponent(
    originalTitle ? `${originalTitle} ${year ?? ""}`.trim() : title
  )}`;

  // Фон: локальный backdrop/постер (скачанный с Кинопоиска), либо градиент.
  const bg = backdropUrl || posterUrl || "";

  const openWatch = () => {
    window.open(watchUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950",
        className
      )}
    >
      {/* Кинематографичный фон: реальный backdrop при наличии, иначе градиент */}
      <div className="absolute inset-0">
        {bg && !imgError ? (
          <Image
            src={bg}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover opacity-40"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/70" />
      </div>

      {/* Контент */}
      <div className="relative flex h-full flex-col items-center justify-center gap-4 p-5 text-center sm:p-8">
        {/* Большая кнопка просмотра */}
        <button
          onClick={openWatch}
          className="group flex h-20 w-20 items-center justify-center rounded-full bg-cinema/95 text-white shadow-[0_0_40px_oklch(0.605_0.234_27.4/0.6)] transition hover:scale-110 hover:bg-cinema"
          aria-label={`Смотреть «${title}» онлайн`}
        >
          <Play className="h-9 w-9 translate-x-0.5 fill-white" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-white sm:text-2xl">
            Смотреть онлайн в HD
          </h3>
          <p className="mt-1 text-sm text-white/70">
            «{title}» · kinopoisk.ws · ID {kinopoiskId}
          </p>
        </div>

        {/* Основная кнопка */}
        <button
          onClick={openWatch}
          className="inline-flex items-center gap-2 rounded-full bg-cinema px-6 py-3 text-sm font-semibold text-white transition hover:bg-cinema/90"
        >
          <ExternalLink className="h-4 w-4" />
          Открыть плеер в новом окне
        </button>

        {/* Вторичная: поиск по названию */}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 transition hover:text-cinema"
        >
          <Search className="h-3.5 w-3.5" />
          Или искать по названию на kinopoisk.ws
        </a>

        {/* Объяснение блокировки */}
        <div className="mt-1 flex max-w-md items-start gap-2 rounded-lg border border-white/10 bg-black/40 p-2.5 text-left text-[11px] text-white/55 backdrop-blur">
          <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cinema" />
          <span>
            Встроенный плеер видеохостинга блокирует встраивание на сторонних
            доменах, поэтому фильм открывается в новой вкладке kinopoisk.ws —
            там видео воспроизводится без ограничений.
          </span>
        </div>
      </div>

      {/* Бейдж источника */}
      <div className="pointer-events-none absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur">
        <Film className="h-3 w-3" />
        kinopoisk.ws
      </div>

      <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur">
        <Info className="h-3 w-3" />
        Внешний источник
      </div>
    </div>
  );
}
