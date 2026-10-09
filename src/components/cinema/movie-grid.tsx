"use client";

import type { Movie } from "@/lib/types";
import { MovieCard } from "./movie-card";

interface MovieGridProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo?: (movie: Movie) => void;
  onCompare?: (movie: Movie) => void;
  compareIds?: Set<string>;
  /** Сколько карточек показать (пагинация) */
  limit?: number;
}

export function MovieGrid({ movies, onPlay, onInfo, onCompare, compareIds, limit }: MovieGridProps) {
  const list = limit ? movies.slice(0, limit) : movies;
  if (list.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">В этой категории пока нет фильмов.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 md:grid-cols-4 lg:grid-cols-5 lg:px-8 xl:grid-cols-6">
      {list.map((m) => (
        <MovieCard
          key={m.id}
          movie={m}
          onPlay={onPlay}
          onInfo={onInfo}
          onCompare={onCompare}
          inCompare={compareIds?.has(m.id)}
          variant="grid"
        />
      ))}
    </div>
  );
}
