"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./movie-card";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo?: (movie: Movie) => void;
  id?: string;
}

export function MovieRow({ title, subtitle, movies, onPlay, onInfo, id }: MovieRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (movies.length === 0) return null;

  return (
    <section id={id} className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-card text-muted-foreground transition hover:border-cinema hover:text-cinema"
              aria-label="Назад"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-card text-muted-foreground transition hover:border-cinema hover:text-cinema"
              aria-label="Вперёд"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className={cn(
            "no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4",
            "snap-x snap-mandatory"
          )}
        >
          {movies.map((m) => (
            <div key={m.id} className="snap-start">
              <MovieCard movie={m} onPlay={onPlay} onInfo={onInfo} variant="row" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
