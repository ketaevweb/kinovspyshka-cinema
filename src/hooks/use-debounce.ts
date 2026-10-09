"use client";

import { useEffect, useState } from "react";

/**
 * Хук debounce: возвращает значение, обновляемое не чаще чем раз в delay мс.
 * Используется для live-search, чтобы не делать запрос на каждый символ.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
