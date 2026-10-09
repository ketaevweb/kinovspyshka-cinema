"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cinema:recent_searches";
const MAX_RECENT = 8;

/**
 * Хук недавних поисков (localStorage).
 * Сохраняет последние запросы, показывает quick-access чипы.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setRecent(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    });
  }, []);

  const addSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setRecent((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== q.toLowerCase());
      const next = [q, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setRecent((prev) => {
      const next = prev.filter((s) => s !== query);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { recent, addSearch, removeSearch, clearRecent };
}
