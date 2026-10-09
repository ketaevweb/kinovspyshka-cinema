"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Hash, FileText, Download, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useI18n } from "@/lib/i18n";
import type { Movie } from "@/lib/types";
import { MoviePoster } from "./movie-poster";

type SearchMode = "id" | "name" | "torrent";

const MODES: { id: SearchMode; icon: typeof Hash }[] = [
  { id: "id", icon: Hash },
  { id: "name", icon: FileText },
  { id: "torrent", icon: Download },
];

function modeLabelKey(id: SearchMode): string {
  if (id === "id") return "search.mode.id";
  if (id === "name") return "search.mode.name";
  return "search.mode.torrent";
}

function modePlaceholderKey(id: SearchMode): string {
  if (id === "id") return "search.placeholder.id";
  if (id === "name") return "search.placeholder.name";
  return "search.placeholder.torrent";
}

interface SearchSectionProps {
  mode: SearchMode;
  setMode: (m: SearchMode) => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: (mode: SearchMode, query: string) => void;
  results: Movie[];
  loading: boolean;
  onPlay: (movie: Movie) => void;
}

export function SearchSection({
  mode,
  setMode,
  query,
  setQuery,
  onSearch,
  results,
  loading,
  onPlay,
}: SearchSectionProps) {
  const { t } = useI18n();
  const [focused, setFocused] = useState(false);
  const { recent, addSearch, clearRecent } = useRecentSearches();
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced запрос для live-подсказок (только в режиме "по названию")
  const debouncedQuery = useDebounce(query, 250);

  // Производный флаг загрузки: true, пока debounce не догнал введённый запрос
  const suggestionsLoading = focused && mode === "name" && query !== debouncedQuery && query.trim().length >= 2;

  useEffect(() => {
    // Подсказки только при поиске по названию, минимум 2 символа, поле в фокусе
    if (mode !== "name" || debouncedQuery.trim().length < 2 || !focused) {
      return;
    }
    let active = true;
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setSuggestions(data.results ?? []);
          setHighlightedIndex(-1);
        }
      })
      .catch(() => {
        if (active) setSuggestions([]);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery, mode, focused]);

  // Закрытие подсказок при клике вне
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(mode, query);
    addSearch(query);
    setFocused(false);
  };

  const showSuggestions = focused && suggestions.length > 0;
  const showSuggestionsLoading = focused && suggestionsLoading && debouncedQuery.trim().length >= 2;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const m = suggestions[highlightedIndex];
      if (m) {
        onPlay(m);
        setFocused(false);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <section id="search" className="relative border-b border-white/5 bg-card/40">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("search.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t("search.subtitle")}
          </p>
        </div>

        {/* Переключатель режимов */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  mode === m.id
                    ? "bg-cinema text-white shadow-[0_0_18px_oklch(0.605_0.234_27.4/0.45)]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(modeLabelKey(m.id))}
              </button>
            );
          })}
        </div>

        {/* Форма поиска с live-подсказками */}
        <form onSubmit={handleSubmit} className="mt-6" ref={containerRef}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={onKeyDown}
              placeholder={t(modePlaceholderKey(mode))}
              inputMode={mode === "id" ? "numeric" : "text"}
              type={mode === "id" ? "number" : "search"}
              autoComplete="off"
              className={cn(
                "h-14 rounded-full border-white/10 bg-background/60 pl-12 pr-32 text-base shadow-inner transition",
                focused && "ring-2 ring-cinema/50"
              )}
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 z-10 h-10 -translate-y-1/2 gap-1 rounded-full bg-cinema px-5 text-white hover:bg-cinema/90"
            >
              {t("search.button")}
              <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Выпадающие live-подсказки */}
            {(showSuggestions || showSuggestionsLoading) && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-popover/95 shadow-2xl backdrop-blur-xl">
                {showSuggestionsLoading && (
                  <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("search.loading")}
                  </div>
                )}
                {showSuggestions &&
                  suggestions.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onClick={() => {
                        onPlay(m);
                        setFocused(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-white/5 px-3 py-2 text-left transition last:border-0",
                        highlightedIndex === i ? "bg-cinema/15" : "hover:bg-white/5"
                      )}
                    >
                      <div className="h-16 w-11 shrink-0 overflow-hidden rounded">
                        <MoviePoster movie={m} showTitle={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.year} · {m.genres.join(", ")} · ★ {m.rating.toFixed(1)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-cinema/10 px-2 py-0.5 text-[10px] font-medium text-cinema">
                        {t("movie.watch")}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {mode === "id" && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("search.example")}:{" "}
              <button
                type="button"
                onClick={() => {
                  setQuery("447301");
                  onSearch("id", "447301");
                }}
                className="font-mono text-cinema underline-offset-2 hover:underline"
              >
                447301
              </button>{" "}
              — фильм «Начало»
            </p>
          )}

          {/* Недавние поиски (quick-access чипы) */}
          {mode === "name" && focused && !query && recent.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Недавние:</span>
              {recent.slice(0, 6).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    onSearch("name", s);
                  }}
                  className="rounded-full border border-white/10 bg-card/60 px-3 py-1 text-xs text-foreground/80 transition hover:border-cinema hover:text-cinema"
                >
                  {s}
                </button>
              ))}
              <button
                onClick={clearRecent}
                className="text-xs text-muted-foreground/50 transition hover:text-destructive"
              >
                Очистить
              </button>
            </div>
          )}
        </form>

        {/* Результаты поиска */}
        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cinema border-t-transparent" />
            {t("search.searching")}
          </div>
        )}

        {!loading && (query.trim() !== "" || results.length > 0) && (
          <div className="mt-8">
            {results.length === 0 ? (
              <div className="mx-auto max-w-md text-center">
                <p className="text-sm text-muted-foreground">
                  {`«${query}» — ${t("search.nothing")}.`}
                </p>
                <a
                  href={`https://fzz-0ejfn0o.troutcdn.site/searchname.php?name=${encodeURIComponent(
                    query.trim()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cinema px-4 py-2 text-sm font-medium text-white transition hover:bg-cinema/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("search.searchOnKp")} «{query.trim()}» {t("search.onKp")}
                </a>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  {t("search.found")}:{" "}
                  <span className="font-semibold text-foreground">{results.length}</span>
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {results.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onPlay(m)}
                      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-background/60 p-2 text-left transition hover:border-cinema/40 hover:bg-card"
                    >
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded">
                        <MoviePoster movie={m} showTitle={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.year} · {m.genres[0]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
