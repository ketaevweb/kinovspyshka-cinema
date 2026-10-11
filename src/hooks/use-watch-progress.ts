"use client";

import { useState, useEffect, useCallback } from "react";
import type { Movie } from "@/lib/types";

const STORAGE_KEY = "cinema:watch-progress";
const MAX_ENTRIES = 20;

export interface WatchProgressEntry {
  movieId: string;
  kinopoiskId: number;
  title: string;
  posterUrl: string;
  year: number;
  duration: number;
  /** Процент просмотра 0-100 */
  progress: number;
  /** Временная метка последнего просмотра */
  watchedAt: number;
}

/**
 * Хук прогресса просмотра.
 * Сохраняет процент просмотра фильма в localStorage.
 * Показывает «Продолжить просмотр» с прогресс-баром.
 *
 * Поскольку видео открывается на troutcdn.site (внешний плеер),
 * реальный прогресс недоступен. Поэтому:
 * - При открытии фильма записываем progress=10% (начат просмотр)
 * - При повторном открытии увеличиваем на 15-25% (продолжение)
 * - 100% = досмотрен до конца (пользователь отмечает вручную или после 6+ открытий)
 */
export function useWatchProgress() {
  const [entries, setEntries] = useState<WatchProgressEntry[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    });
  }, []);

  const saveEntries = useCallback((next: WatchProgressEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  /** Записать/обновить прогресс при открытии фильма */
  const recordProgress = useCallback(
    (movie: Movie) => {
      const existing = entries.find((e) => e.movieId === movie.id);

      if (existing) {
        // Увеличиваем прогресс на 15% (до 100%)
        const newProgress = Math.min(existing.progress + 15, 100);
        const updated = [
          {
            ...existing,
            progress: newProgress,
            watchedAt: Date.now(),
          },
          ...entries.filter((e) => e.movieId !== movie.id),
        ].slice(0, MAX_ENTRIES);
        saveEntries(updated);
      } else {
        // Новый фильм — 10% прогресс
        const entry: WatchProgressEntry = {
          movieId: movie.id,
          kinopoiskId: movie.kinopoiskId,
          title: movie.title,
          posterUrl: movie.posterUrl,
          year: movie.year,
          duration: movie.duration,
          progress: 10,
          watchedAt: Date.now(),
        };
        saveEntries([entry, ...entries].slice(0, MAX_ENTRIES));
      }
    },
    [entries, saveEntries]
  );

  /** Отметить как досмотренный (100%) */
  const markCompleted = useCallback(
    (movieId: string) => {
      const updated = entries.map((e) =>
        e.movieId === movieId ? { ...e, progress: 100, watchedAt: Date.now() } : e
      );
      saveEntries(updated);
    },
    [entries, saveEntries]
  );

  /** Удалить из прогресса */
  const removeProgress = useCallback(
    (movieId: string) => {
      saveEntries(entries.filter((e) => e.movieId !== movieId));
    },
    [entries, saveEntries]
  );

  /** Получить прогресс фильма (0-100 или null) */
  const getProgress = useCallback(
    (movieId: string): number | null => {
      const entry = entries.find((e) => e.movieId === movieId);
      return entry?.progress ?? null;
    },
    [entries]
  );

  /** Недосмотренные фильмы (progress < 100, исключая историю) */
  const continueWatching = entries
    .filter((e) => e.progress < 100)
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .slice(0, 14);

  return {
    entries,
    continueWatching,
    recordProgress,
    markCompleted,
    removeProgress,
    getProgress,
  };
}
