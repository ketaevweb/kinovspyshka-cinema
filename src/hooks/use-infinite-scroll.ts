"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Хук бесконечной прокрутки.
 *
 * Возвращает ref, который ставится на sentinel-элемент внизу списка.
 * Когда sentinel попадает в viewport — вызывает onLoadMore.
 * Автоматически сбрасывает счётчик при смене ключа (например, при смене жанра).
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  options?: {
    /** Сколько элементов догружать за раз (по умолчанию не используется, только для hasMore) */
    threshold?: number;
    /** Зависимость для сброса (например, selectedGenre) */
    resetKey?: unknown;
    /** Есть ли ещё данные */
    hasMore?: boolean;
  }
) {
  const { threshold = 200, resetKey, hasMore = true } = options ?? {};
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const onLoadMoreRef = useRef(onLoadMore);

  // Обновляем ref в effect, не во время render
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    onLoadMoreRef.current();
    setTimeout(() => setIsLoading(false), 400);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, isLoading, hasMore, threshold, resetKey]);

  return { sentinelRef, isLoading };
}
