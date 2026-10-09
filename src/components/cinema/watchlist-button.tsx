"use client";

import { useState, useRef, useEffect } from "react";
import { ListPlus, Check, X, Loader2, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWatchlists } from "@/hooks/use-watchlists";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Movie } from "@/lib/types";

interface WatchlistButtonProps {
  movie: Movie;
  compact?: boolean;
}

export function WatchlistButton({ movie, compact = false }: WatchlistButtonProps) {
  const { t } = useI18n();
  const { watchlists, loaded, fetchWatchlists, createWatchlist, isInWatchlist } = useWatchlists();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Загружаем списки при первом открытии
  useEffect(() => {
    if (open && !loaded) {
      fetchWatchlists();
    }
  }, [open, loaded, fetchWatchlists]);

  // Закрытие при клике вне
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggleMovie = async (watchlistId: string) => {
    const isAdded = isInWatchlist(movie.id, watchlistId);
    try {
      if (isAdded) {
        await fetch(`/api/watchlists/${watchlistId}/movies?movieId=${encodeURIComponent(movie.id)}`, {
          method: "DELETE",
        });
        toast.success(t("watchlist.removed"));
      } else {
        await fetch(`/api/watchlists/${watchlistId}/movies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: movie.id, kinopoiskId: movie.kinopoiskId }),
        });
        toast.success(t("watchlist.added"));
      }
      // Обновляем списки
      fetchWatchlists();
    } catch {
      toast.error(t("watchlist.error"));
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    const wl = await createWatchlist(newName.trim());
    setSubmitting(false);
    if (wl) {
      setNewName("");
      setCreating(false);
      // Автоматически добавляем фильм в новый список
      try {
        await fetch(`/api/watchlists/${wl.id}/movies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: movie.id, kinopoiskId: movie.kinopoiskId }),
        });
        toast.success(t("watchlist.addedTo", { name: wl.name }));
        fetchWatchlists();
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "flex items-center justify-center rounded-full border text-white transition hover:scale-110",
          compact ? "h-7 w-7" : "h-9 w-9",
          "border-white/40 bg-black/50 hover:border-white"
        )}
        aria-label={t("watchlist.ariaLabel")}
      >
        <ListPlus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-popover/95 shadow-2xl backdrop-blur-xl">
          {/* Заголовок */}
          <div className="border-b border-white/5 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("watchlist.addTo")}
            </p>
          </div>

          {/* Списки */}
          <div className="max-h-48 overflow-y-auto py-1">
            {loaded && watchlists.length === 0 && !creating && (
              <p className="px-3 py-3 text-center text-xs text-muted-foreground">
                {t("watchlist.empty")}
              </p>
            )}
            {watchlists.map((wl) => {
              const inList = isInWatchlist(movie.id, wl.id);
              return (
                <button
                  key={wl.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMovie(wl.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/5"
                >
                  {inList ? (
                    <Check className="h-4 w-4 shrink-0 text-cinema" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{wl.name}</span>
                  <span className="text-xs text-muted-foreground">{wl.movieCount}</span>
                </button>
              );
            })}
          </div>

          {/* Создание нового списка */}
          {creating ? (
            <div className="border-t border-white/5 p-2">
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") {
                      setCreating(false);
                      setNewName("");
                    }
                  }}
                  placeholder={t("watchlist.namePlaceholder")}
                  className="h-8 bg-background/60 text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={submitting || !newName.trim()}
                  className="h-8 gap-1 bg-cinema px-2"
                >
                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreating(true);
              }}
              className="flex w-full items-center gap-2 border-t border-white/5 px-3 py-2 text-left text-sm text-cinema transition hover:bg-cinema/10"
            >
              <FolderPlus className="h-4 w-4" />
              {t("watchlist.create")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
