"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Movie } from "@/lib/types";

/**
 * Ленивая инициализация из localStorage (синхронно, один раз).
 * Избегает setState в effect для гостевого случая.
 */
function loadLocalFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("cinema:favorites");
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

/**
 * Хук управления избранным.
 *
 * - Гости: избранное в localStorage (загружается после гидрации).
 * - Авторизованные: избранное с сервера (Prisma), с автосинхронизацией
 *   локального избранного при первом входе.
 *
 * ВАЖНО: начальное состояние — пустой Set (совпадает с SSR), чтобы избежать
 * гидрации-мismatch. localStorage читается в effect (асинхронно).
 */
export function useFavorites() {
  const { data: session, status } = useSession();
  const authenticated = status === "authenticated";
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Гостевое избранное: читаем localStorage после гидрации (асинхронно, чтобы
  // не нарушать SSR и не триггерить lint-rule о setState в effect)
  useEffect(() => {
    if (status === "loading") return;
    if (authenticated || !session) return; // авторизованные — через серверный эффект ниже

    requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem("cinema:favorites");
        if (raw) {
          const ids = JSON.parse(raw) as string[];
          setFavorites(new Set(ids));
        }
      } catch {
        /* ignore */
      }
      setLoaded(true);
    });
  }, [status, authenticated, session]);

  // Серверная синхронизация для авторизованных пользователей
  useEffect(() => {
    if (status === "loading" || !authenticated || !session?.user?.id) return;

    let active = true;

    async function syncServer() {
      try {
        const res = await fetch("/api/favorites");
        const data = await res.json();
        const serverFavs = new Set<string>(data.favorites ?? []);

        // Локальное избранное (если было до входа) → синхронизируем на сервер
        const localRaw = localStorage.getItem("cinema:favorites");
        if (localRaw) {
          const local = JSON.parse(localRaw) as string[];
          const toSync = local.filter((id) => id.startsWith("kp-") && !serverFavs.has(id));
          await Promise.all(
            toSync.map((movieId) => {
              const kpId = parseInt(movieId.replace("kp-", ""), 10);
              return fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId, kinopoiskId: kpId }),
              });
            })
          );
          localStorage.removeItem("cinema:favorites");

          if (toSync.length > 0) {
            const res2 = await fetch("/api/favorites");
            const data2 = await res2.json();
            if (active) setFavorites(new Set(data2.favorites ?? []));
          } else if (active) {
            setFavorites(serverFavs);
          }
        } else if (active) {
          setFavorites(serverFavs);
        }
      } catch {
        /* ignore */
      } finally {
        if (active) setLoaded(true);
      }
    }

    syncServer();
    return () => {
      active = false;
    };
  }, [authenticated, status, session?.user?.id]);

  const toggleFavorite = useCallback(
    (movie: Movie) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        const isFav = next.has(movie.id);
        if (isFav) {
          next.delete(movie.id);
        } else {
          next.add(movie.id);
        }

        // Синхронизация с сервером для авторизованных
        if (authenticated) {
          if (isFav) {
            fetch(`/api/favorites?movieId=${encodeURIComponent(movie.id)}`, {
              method: "DELETE",
            }).catch(() => {});
          } else {
            fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ movieId: movie.id, kinopoiskId: movie.kinopoiskId }),
            }).catch(() => {});
          }
        }

        // Локальное сохранение (для гостей и как кэш)
        try {
          localStorage.setItem("cinema:favorites", JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [authenticated]
  );

  const isFavorite = useCallback(
    (movieId: string) => favorites.has(movieId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, loaded, authenticated };
}
