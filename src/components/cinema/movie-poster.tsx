"use client";

import { useState } from "react";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MoviePosterProps {
  movie: Movie;
  className?: string;
  showTitle?: boolean;
}

/** Детерминированный хеш строки → число */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Палитра по первому жанру [primary, dark, accent] — без индиго/синего */
const GENRE_PALETTES: Record<string, [string, string, string]> = {
  Драма: ["#7f1d1d", "#1c0a0a", "#fca5a5"],
  Комедия: ["#b45309", "#1a0f02", "#fcd34d"],
  Триллер: ["#3f3f46", "#0a0a0a", "#d4d4d8"],
  Боевик: ["#b91c1c", "#1a0606", "#fca5a5"],
  Фантастика: ["#0f766e", "#04110f", "#5eead4"],
  Ужасы: ["#450a0a", "#000000", "#7f1d1d"],
  Мелодрама: ["#9d174d", "#1a0511", "#f9a8d4"],
  Приключения: ["#15803d", "#04140a", "#86efac"],
  Криминал: ["#27272a", "#0a0a0a", "#a1a1aa"],
  Исторический: ["#92400e", "#1a0e02", "#fbbf24"],
  Музыка: ["#6d28d9", "#0e061a", "#c4b5fd"],
  Мультфильм: ["#be185d", "#1a0a14", "#f9a8d4"],
  Военный: ["#14532d", "#08140a", "#86efac"],
  Спорт: ["#166534", "#052e16", "#86efac"],
  Детектив: ["#1f2937", "#000000", "#9ca3af"],
  Семейный: ["#a16207", "#1a1402", "#fde047"],
  Документальный: ["#404040", "#000000", "#a3a3a3"],
  Фэнтези: ["#6b21a8", "#0e061a", "#d8b4fe"],
  Биография: ["#78350f", "#1a0e02", "#fbbf24"],
  Вестерн: ["#92400e", "#1a0e02", "#fcd34d"],
  Романтика: ["#be185d", "#1a0511", "#f9a8d4"],
  Аниме: ["#a21caf", "#1a0a14", "#f0abfc"],
};

const DEFAULT_PALETTE: [string, string, string] = ["#27272a", "#09090b", "#a1a1aa"];

function paletteFor(movie: Movie): [string, string, string] {
  return GENRE_PALETTES[movie.genres[0]] ?? DEFAULT_PALETTE;
}

function initialsOf(title: string): string {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function backgroundFor(movie: Movie): string {
  const [primary, dark, accent] = paletteFor(movie);
  const h = hash(movie.title + movie.year);
  const focusX = 20 + (h % 60);
  const focusY = 15 + (((h >> 7) % 50));
  const angle = (h >> 3) % 180;
  return `linear-gradient(${angle}deg, ${primary}, ${dark} 75%), radial-gradient(circle at ${focusX}% ${focusY}%, ${accent}22, transparent 55%)`;
}

/**
 * Обложка фильма.
 *
 * Показывает локальный постер, скачанный с Кинопоиска (через API poiskkino.dev)
 * и сохранённый в /public/posters/{kpId}.jpg. При ошибке загрузки — процедурная
 * SVG-обложка (детерминированный градиент + инициалы), чтобы не было битых картинок.
 */
export function MoviePoster({ movie, className, showTitle = true }: MoviePosterProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Локальный постер, скачанный с Кинопоиска (через API poiskkino.dev) в /public/posters/
  const posterUrl = movie.posterUrl;

  const bg = backgroundFor(movie);
  const initials = initialsOf(movie.title);
  const [primary, _dark, accent] = paletteFor(movie);

  const showPoster = Boolean(posterUrl) && !imgError;

  const procedural = (
    <ProceduralPoster
      bg={bg}
      initials={initials}
      movie={movie}
      showTitle={showTitle}
      accent={accent}
      className={showPoster ? "opacity-40" : undefined}
    />
  );

  if (!showPoster) {
    return <div className={cn("relative h-full w-full overflow-hidden", className)}>{procedural}</div>;
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-zinc-900", className)}>
      {procedural}
      <img
        src={posterUrl}
        alt={movie.title}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          imgLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

function ProceduralPoster({
  bg,
  initials,
  movie,
  showTitle,
  accent,
  className,
}: {
  bg: string;
  initials: string;
  movie: Movie;
  showTitle?: boolean;
  accent: string;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0", className)} style={{ background: bg }}>
      {/* Перфорация плёнки по бокам */}
      <FilmPerf side="left" />
      <FilmPerf side="right" />

      {/* Круг с инициалами */}
      <div className="absolute left-1/2 top-[34%] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/20 bg-black/30 text-xl font-black text-white/85 backdrop-blur-sm">
        {initials}
      </div>

      {/* Название + год */}
      {showTitle && (
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-3 pt-10 text-center"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
        >
          <h3 className="line-clamp-3 text-sm font-extrabold leading-tight text-white drop-shadow">
            {movie.title}
          </h3>
          <p className="text-[10px] font-medium text-white/60">
            {movie.year} · {movie.genres[0]}
          </p>
        </div>
      )}

      {/* Тонкая акцентная полоса сверху */}
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
    </div>
  );
}

function FilmPerf({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 flex w-3 flex-col justify-around opacity-40",
        side === "left" ? "left-0" : "right-0"
      )}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="mx-auto h-1.5 w-1.5 rounded-[1px] bg-white/70" />
      ))}
    </div>
  );
}
