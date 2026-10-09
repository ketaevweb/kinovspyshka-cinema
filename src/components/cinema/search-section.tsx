"use client";

import { useState } from "react";
import { Search, Hash, FileText, Download, ArrowRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Movie } from "@/lib/types";

type SearchMode = "id" | "name" | "torrent";

const MODES: { id: SearchMode; label: string; placeholder: string; icon: typeof Hash }[] = [
  { id: "id", label: "По ID Кинопоиска", placeholder: "Введите ID, например 447301", icon: Hash },
  { id: "name", label: "По названию", placeholder: "Название фильма или сериала...", icon: FileText },
  { id: "torrent", label: "По торрентам", placeholder: "Название для поиска торрентов...", icon: Download },
];

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
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(mode, query);
  };

  return (
    <section id="search" className="relative border-b border-white/5 bg-card/40">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Найдите фильм за секунду
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Ищите по ID Кинопоиска, по названию или по торрентам — как в старом добром онлайн-кинотеатре.
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
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Форма поиска */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={MODES.find((m) => m.id === mode)?.placeholder}
              inputMode={mode === "id" ? "numeric" : "text"}
              type={mode === "id" ? "number" : "search"}
              className={cn(
                "h-14 rounded-full border-white/10 bg-background/60 pl-12 pr-32 text-base shadow-inner transition",
                focused && "ring-2 ring-cinema/50"
              )}
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 h-10 -translate-y-1/2 gap-1 rounded-full bg-cinema px-5 text-white hover:bg-cinema/90"
            >
              Искать
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {mode === "id" && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Пример:{" "}
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
        </form>

        {/* Результаты поиска */}
        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cinema border-t-transparent" />
            Идёт поиск...
          </div>
        )}

        {!loading && (query.trim() !== "" || results.length > 0) && (
          <div className="mt-8">
            {results.length === 0 ? (
              <div className="mx-auto max-w-md text-center">
                <p className="text-sm text-muted-foreground">
                  По запросу «{query}» ничего не найдено в нашем каталоге.
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
                  Искать «{query.trim()}» на kinopoisk.ws
                </a>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Найдено: <span className="font-semibold text-foreground">{results.length}</span>
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {results.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onPlay(m)}
                      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-background/60 p-2 text-left transition hover:border-cinema/40 hover:bg-card"
                    >
                      <PosterThumb src={m.posterUrl} alt={m.title} />
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

function PosterThumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-gradient-to-br from-zinc-700 to-zinc-900 text-[10px] text-white/40">
        HD
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-14 w-10 shrink-0 rounded object-cover"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}
