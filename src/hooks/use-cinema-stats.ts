"use client";

import { useMemo } from "react";
import type { Movie } from "@/lib/types";
import { useFavorites } from "./use-favorites";
import { useWatchHistory } from "./use-watch-history";

export interface CinemaStats {
  totalWatched: number;
  totalFavorites: number;
  avgRating: number;
  topGenres: { genre: string; count: number }[];
  totalMinutes: number;
  totalHours: number;
  countries: { country: string; count: number }[];
  decadeStats: { decade: string; count: number }[];
}

/**
 * Хук статистики просмотра: анализирует избранное и историю.
 */
export function useCinemaStats(allMovies: Movie[]): CinemaStats {
  const { favorites } = useFavorites();
  const { history } = useWatchHistory();

  return useMemo(() => {
    // Объединяем фильмы из избранного и истории (уникальные)
    const watchedIds = new Set<string>();
    favorites.forEach((id) => watchedIds.add(id));
    history.forEach((h) => watchedIds.add(h.id));

    const watchedMovies = allMovies.filter((m) => watchedIds.has(m.id));

    // Средний рейтинг
    const avgRating =
      watchedMovies.length > 0
        ? watchedMovies.reduce((s, m) => s + m.rating, 0) / watchedMovies.length
        : 0;

    // Топ жанров
    const genreCounts = new Map<string, number>();
    watchedMovies.forEach((m) => {
      m.genres.forEach((g) => {
        genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      });
    });
    const topGenres = Array.from(genreCounts.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Страны
    const countryCounts = new Map<string, number>();
    watchedMovies.forEach((m) => {
      m.countries.forEach((c) => {
        countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
      });
    });
    const countries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // По десятилетиям
    const decadeCounts = new Map<string, number>();
    watchedMovies.forEach((m) => {
      const decade = `${Math.floor(m.year / 10) * 10}s`;
      decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
    });
    const decadeStats = Array.from(decadeCounts.entries())
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade));

    // Общее время просмотра (по длительности)
    const totalMinutes = watchedMovies.reduce((s, m) => s + m.duration, 0);

    return {
      totalWatched: watchedMovies.length,
      totalFavorites: favorites.size,
      avgRating,
      topGenres,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      countries,
      decadeStats,
    };
  }, [allMovies, favorites, history]);
}
