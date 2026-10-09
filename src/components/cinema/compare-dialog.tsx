"use client";

import { useState, useMemo } from "react";
import { GitCompare, X, Search, Star, Clock, Calendar, Globe, Eye, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoviePoster } from "./movie-poster";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Movie } from "@/lib/types";

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allMovies: Movie[];
  preselected?: Movie[];
  onPlay: (movie: Movie) => void;
}

const MAX_COMPARE = 3;

export function CompareDialog({
  open,
  onOpenChange,
  allMovies,
  preselected = [],
  onPlay,
}: CompareDialogProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Movie[]>(preselected.slice(0, MAX_COMPARE));
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allMovies.slice(0, 12);
    return allMovies
      .filter((m) =>
        [m.title, m.originalTitle, String(m.year), m.genres.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 12);
  }, [query, allMovies]);

  const addMovie = (movie: Movie) => {
    setSelected((prev) => {
      if (prev.find((m) => m.id === movie.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, movie];
    });
  };

  const removeMovie = (id: string) => {
    setSelected((prev) => prev.filter((m) => m.id !== id));
  };

  const bestRating = selected.length > 0 ? Math.max(...selected.map((m) => m.rating)) : 0;
  const bestViews = selected.length > 0 ? Math.max(...selected.map((m) => m.views)) : 0;
  const shortestDuration = selected.length > 0 ? Math.min(...selected.map((m) => m.duration)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-5xl overflow-hidden border-white/10 bg-background/95 p-0 sm:max-w-5xl">
        <DialogTitle className="sr-only">{t("compare.title")}</DialogTitle>
        <ScrollArea className="cinema-scroll max-h-[92vh]">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-cinema" />
              <h2 className="text-xl font-bold">{t("compare.title")}</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {selected.length}/{MAX_COMPARE} {t("compare.selected")}
              </span>
            </div>

            {/* Выбранные фильмы */}
            {selected.length === 0 ? (
              <div className="mb-6 rounded-xl border border-dashed border-white/15 bg-card/40 p-8 text-center">
                <GitCompare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {t("compare.empty")}
                </p>
              </div>
            ) : (
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selected.map((m) => (
                  <div
                    key={m.id}
                    className="group relative overflow-hidden rounded-xl border border-cinema/30 bg-card"
                  >
                    <button
                      onClick={() => removeMovie(m.id)}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-cinema"
                      aria-label={t("compare.remove")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="aspect-[2/3] w-full">
                      <MoviePoster movie={m} />
                    </div>
                    <div className="p-2">
                      <h3 className="truncate text-sm font-semibold">{m.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {m.year} · ★ {m.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
                {selected.length < MAX_COMPARE && (
                  <div className="flex aspect-[2/3] items-center justify-center rounded-xl border border-dashed border-white/15 bg-card/40 text-center text-muted-foreground">
                    <div>
                      <Plus className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p className="text-xs">{t("compare.addMore")}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Таблица сравнения */}
            {selected.length >= 2 && (
              <div className="mb-6 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <tbody>
                    <CompareRow label={t("compare.col.title")} icon={Star}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3 font-semibold">{m.title}</td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.year")} icon={Calendar}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3">{m.year}</td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.rating")} icon={Star}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3">
                          <span className={cn(
                            "font-bold",
                            m.rating === bestRating ? "text-yellow-400" : "text-foreground"
                          )}>
                            ★ {m.rating.toFixed(1)}
                            {m.rating === bestRating && <span className="ml-1 text-xs">🏆</span>}
                          </span>
                        </td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.duration")} icon={Clock}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3">
                          <span className={cn(
                            m.duration === shortestDuration && "font-bold text-cinema"
                          )}>
                            {m.duration} {t("movie.duration")}
                          </span>
                        </td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.genres")} icon={Star}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3 text-xs">{m.genres.join(", ")}</td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.countries")} icon={Globe}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3 text-xs">{m.countries.join(", ")}</td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.director")} icon={Star}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3 text-xs">{m.director}</td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.age")} icon={Eye}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3">{m.ageRating}</td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.views")} icon={Eye}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3">
                          <span className={cn(
                            m.views === bestViews && "font-bold text-cinema"
                          )}>
                            {formatViews(m.views)}
                          </span>
                        </td>
                      ))}
                    </CompareRow>
                    <CompareRow label={t("compare.col.action")} icon={Star}>
                      {selected.map((m) => (
                        <td key={m.id} className="p-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1 text-xs"
                            onClick={() => {
                              onOpenChange(false);
                              onPlay(m);
                            }}
                          >
                            {t("compare.open")}
                          </Button>
                        </td>
                      ))}
                    </CompareRow>
                  </tbody>
                </table>
              </div>
            )}

            {/* Поиск фильмов для добавления */}
            <div className="mb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("compare.searchPlaceholder")}
                  className="rounded-full border-white/10 bg-background/60 pl-10"
                />
              </div>
            </div>

            {/* Список фильмов */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {searchResults.slice(0, 18).map((m) => {
                const isSelected = selected.find((s) => s.id === m.id);
                const canAdd = selected.length < MAX_COMPARE;
                return (
                  <button
                    key={m.id}
                    onClick={() => (isSelected ? removeMovie(m.id) : canAdd ? addMovie(m) : null)}
                    disabled={!isSelected && !canAdd}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border-2 transition",
                      isSelected
                        ? "border-cinema"
                        : canAdd
                        ? "border-transparent hover:border-cinema/50"
                        : "border-transparent opacity-40"
                    )}
                  >
                    <div className="aspect-[2/3] w-full">
                      <MoviePoster movie={m} showTitle={false} />
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-cinema/30">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cinema text-white">
                          <X className="h-5 w-5" />
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 truncate bg-black/70 p-1 text-[10px] font-medium text-white">
                      {m.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function CompareRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Star;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-white/5 last:border-0">
      <td className="whitespace-nowrap bg-card/40 p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
      </td>
      {children}
    </tr>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
