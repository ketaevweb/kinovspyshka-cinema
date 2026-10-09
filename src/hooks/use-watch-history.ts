"use client";

import { useState, useEffect, useCallback } from "react";
import type { Movie } from "@/lib/types";

const STORAGE_KEY = "cinema:history";
const MAX_HISTORY = 20;

interface HistoryEntry {
  id: string;
  kinopoiskId: number;
  title: string;
  posterUrl: string;
  year: number;
  rating: number;
  viewedAt: number;
}

/**
 * Хук истории просмотров (localStorage).
 * Записывает каждый открытый фильм, показывает «Вы смотрели».
 */
export function useWatchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Загрузка после гидрации (избегаем SSR mismatch)
  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      setLoaded(true);
    });
  }, []);

  const addToHistory = useCallback((movie: Movie) => {
    const entry: HistoryEntry = {
      id: movie.id,
      kinopoiskId: movie.kinopoiskId,
      title: movie.title,
      posterUrl: movie.posterUrl,
      year: movie.year,
      rating: movie.rating,
      viewedAt: Date.now(),
    };

    setHistory((prev) => {
      // Удаляем дубль, добавляем в начало
      const filtered = prev.filter((h) => h.id !== movie.id);
      const next = [entry, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { history, addToHistory, clearHistory, loaded };
}
