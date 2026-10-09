"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export interface Watchlist {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  movieCount: number;
  movieIds: string[];
}

/**
 * Хук для управления списками просмотра.
 * Работает только для авторизованных пользователей.
 */
export function useWatchlists() {
  const { data: session, status } = useSession();
  const authenticated = status === "authenticated";
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchWatchlists = useCallback(async () => {
    if (!authenticated) {
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch("/api/watchlists");
      const data = await res.json();
      setWatchlists(data.watchlists ?? []);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [authenticated]);

  const createWatchlist = useCallback(
    async (name: string, description?: string) => {
      if (!authenticated) {
        toast.error("Войдите, чтобы создавать списки");
        return null;
      }
      try {
        const res = await fetch("/api/watchlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        const data = await res.json();
        if (res.ok && data.watchlist) {
          const newList: Watchlist = {
            id: data.watchlist.id,
            name: data.watchlist.name,
            description: data.watchlist.description,
            isPublic: data.watchlist.isPublic,
            movieCount: 0,
            movieIds: [],
          };
          setWatchlists((prev) => [newList, ...prev]);
          toast.success(`Список «${name}» создан!`);
          return newList;
        } else {
          toast.error(data.error || "Ошибка создания списка");
        }
      } catch {
        toast.error("Ошибка сети");
      }
      return null;
    },
    [authenticated]
  );

  const deleteWatchlist = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/watchlists?id=${id}`, { method: "DELETE" });
        setWatchlists((prev) => prev.filter((w) => w.id !== id));
        toast.success("Список удалён");
      } catch {
        toast.error("Ошибка удаления");
      }
    },
    []
  );

  const isInWatchlist = useCallback(
    (movieId: string, watchlistId: string) => {
      const wl = watchlists.find((w) => w.id === watchlistId);
      return wl?.movieIds.includes(movieId) ?? false;
    },
    [watchlists]
  );

  return {
    watchlists,
    loaded,
    authenticated,
    fetchWatchlists,
    createWatchlist,
    deleteWatchlist,
    isInWatchlist,
  };
}
