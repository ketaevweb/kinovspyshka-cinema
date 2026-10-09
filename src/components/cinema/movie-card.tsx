"use client";

import { Play, Star, Plus, Info } from "lucide-react";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onInfo?: (movie: Movie) => void;
  variant?: "grid" | "row";
}

export function MovieCard({ movie, onPlay, onInfo, variant = "grid" }: MovieCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-card transition-all duration-300 hover:border-cinema/50 hover:shadow-[0_10px_40px_-12px_oklch(0.605_0.234_27.4/0.5)]",
        variant === "grid" ? "w-full" : "w-[150px] shrink-0 sm:w-[170px]"
      )}
      onClick={() => onPlay(movie)}
    >
      {/* Постер */}
      <div className={cn("relative aspect-[2/3] w-full overflow-hidden bg-zinc-900")}>
        {!error && movie.posterUrl ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
            )}
            <img
              src={movie.posterUrl}
              alt={movie.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={cn(
                "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
                loaded ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        ) : (
          <PosterFallback title={movie.title} year={movie.year} />
        )}

        {/* Рейтинг */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur">
          <Star className="h-3 w-3 fill-yellow-400" />
          {movie.rating.toFixed(1)}
        </div>

        {/* Возрастной рейтинг */}
        <div className="absolute right-2 top-2 rounded border border-white/40 bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
          {movie.ageRating}
        </div>

        {/* Hover-оверлей с действиями */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cinema text-white transition hover:scale-110"
              aria-label={`Смотреть ${movie.title}`}
            >
              <Play className="h-4 w-4 fill-white" />
            </button>
            {onInfo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInfo(movie);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white transition hover:scale-110 hover:border-white"
                aria-label={`Подробнее о ${movie.title}`}
              >
                <Info className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white transition hover:scale-110 hover:border-white"
              aria-label="В избранное"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Подпись */}
      <div className="p-2.5">
        <h3 className="truncate text-sm font-semibold leading-tight">{movie.title}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {movie.year} · {movie.genres[0]}
        </p>
      </div>
    </div>
  );
}

function PosterFallback({ title, year }: { title: string; year: number }) {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-700 via-zinc-800 to-black p-3 text-center">
      <span className="text-3xl font-black text-white/20">{initials}</span>
      <span className="mt-2 line-clamp-2 text-xs font-semibold text-white/60">{title}</span>
      <span className="mt-1 text-[10px] text-white/40">{year}</span>
    </div>
  );
}
