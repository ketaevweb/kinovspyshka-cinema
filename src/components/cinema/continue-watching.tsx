"use client";

import { Play, X, Film, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WatchProgressEntry } from "@/hooks/use-watch-progress";

interface ContinueWatchingProps {
  entries: WatchProgressEntry[];
  onPlay: (entry: WatchProgressEntry) => void;
  onRemove: (movieId: string) => void;
  onComplete: (movieId: string) => void;
}

export function ContinueWatching({ entries, onPlay, onRemove, onComplete }: ContinueWatchingProps) {
  if (entries.length === 0) return null;

  return (
    <section id="continue" className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <Play className="h-5 w-5 fill-cinema text-cinema" />
              Продолжить просмотр
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Вы начали смотреть — продолжите с того места
            </p>
          </div>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {entries.map((entry) => (
            <div
              key={entry.movieId}
              className="group relative w-[200px] shrink-0 overflow-hidden rounded-xl border border-white/5 bg-card transition hover:border-cinema/50 sm:w-[220px] snap-start"
            >
              {/* Постер */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                {entry.posterUrl ? (
                  <img
                    src={entry.posterUrl}
                    alt={entry.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                    <Film className="h-8 w-8 text-white/20" />
                  </div>
                )}

                {/* Затемнение снизу */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                {/* Кнопка Play */}
                <button
                  onClick={() => onPlay(entry)}
                  className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cinema/90 text-white opacity-0 transition group-hover:opacity-100 hover:scale-110"
                  aria-label={`Продолжить просмотр ${entry.title}`}
                >
                  <Play className="h-5 w-5 fill-white" />
                </button>

                {/* Прогресс-бар */}
                <div className="absolute inset-x-0 bottom-0 z-10">
                  <div className="h-1.5 w-full bg-white/20">
                    <div
                      className="h-full bg-cinema transition-all"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                </div>

                {/* Кнопка удаления */}
                <button
                  onClick={() => onRemove(entry.movieId)}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition hover:bg-red-500 group-hover:opacity-100"
                  aria-label="Убрать"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Инфо */}
              <div className="p-2.5">
                <h3 className="truncate text-sm font-semibold">{entry.title}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {entry.year} · {Math.round(entry.progress)}%
                  </span>
                  <button
                    onClick={() => onComplete(entry.movieId)}
                    className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400 transition hover:bg-green-500/20"
                    title="Отметить как досмотренный"
                  >
                    <Check className="h-3 w-3" />
                    Досмотрел
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
