"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./movie-card";
import { Skeleton } from "@/components/ui/skeleton";

interface VirtualMovieGridProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo?: (movie: Movie) => void;
  onCompare?: (movie: Movie) => void;
  compareIds?: Set<string>;
  /** Сколько карточек показать (пагинация) */
  limit?: number;
}

/** Количество колонок в зависимости от ширины экрана */
function useColumnCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(2);
      else if (w < 768) setCount(3);
      else if (w < 1024) setCount(4);
      else if (w < 1280) setCount(5);
      else setCount(6);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

export function VirtualMovieGrid({
  movies,
  onPlay,
  onInfo,
  onCompare,
  compareIds,
  limit,
}: VirtualMovieGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount();
  const [scrollMargin, setScrollMargin] = useState(0);

  // Вычисляем offsetTop контейнера после mount (для точной виртуализации)
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScrollMargin(containerRef.current.offsetTop);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const visible = useMemo(() => {
    return limit ? movies.slice(0, limit) : movies;
  }, [movies, limit]);

  // Группируем фильмы в ряды по columns штук
  const rows = useMemo(() => {
    const result: Movie[][] = [];
    for (let i = 0; i < visible.length; i += columns) {
      result.push(visible.slice(i, i + columns));
    }
    return result;
  }, [visible, columns]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 380,
    overscan: 4,
    scrollMargin,
  });

  if (visible.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">В этой категории пока нет фильмов.</p>
      </div>
    );
  }

  const items = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  return (
    <div ref={containerRef} className="mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-7xl" style={{ height: `${totalHeight}px` }}>
        {items.map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 right-0"
              style={{
                top: `${virtualRow.start}px`,
              }}
            >
              <div
                className="grid gap-3 pb-3 sm:gap-4 sm:pb-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {row.map((m) => (
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
                {row.length < columns &&
                  Array.from({ length: columns - row.length }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VirtualGridSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 md:grid-cols-4 lg:grid-cols-5 lg:px-8 xl:grid-cols-6">
      {Array.from({ length: columns * 2 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
