"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/cinema/header";
import { HeroCarousel } from "@/components/cinema/hero-carousel";
import { SearchSection } from "@/components/cinema/search-section";
import { MovieRow } from "@/components/cinema/movie-row";
import { MovieGrid } from "@/components/cinema/movie-grid";
import { GenreFilter } from "@/components/cinema/genre-filter";
import { MovieModal } from "@/components/cinema/movie-modal";
import { Footer } from "@/components/cinema/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Movie, Genre } from "@/lib/types";

type SearchMode = "id" | "name" | "torrent";

export default function Home() {
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedGenre, setSelectedGenre] = useState("Все");
  const [catalogVisible, setCatalogVisible] = useState(24); // пагинация каталога
  const [searchMode, setSearchMode] = useState<SearchMode>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Загрузка первичных данных
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [f, t, a, g] = await Promise.all([
          fetch("/api/movies/featured").then((r) => r.json()),
          fetch("/api/movies/trending").then((r) => r.json()),
          fetch("/api/movies").then((r) => r.json()),
          fetch("/api/movies/genres").then((r) => r.json()),
        ]);
        if (!active) return;
        setFeatured(f.movies ?? []);
        setTrending(t.movies ?? []);
        setAllMovies(a.movies ?? []);
        // Сортируем по году для «Новинок»
        const sortedNew = [...(a.movies ?? [])].sort((x, y) => y.year - x.year).slice(0, 12);
        setNewReleases(sortedNew);
        setGenres(g.genres ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Восстановление избранного из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cinema:favorites");
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFavorite = useCallback((movie: Movie) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(movie.id)) next.delete(movie.id);
      else next.add(movie.id);
      try {
        localStorage.setItem("cinema:favorites", JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Открытие модального окна с подробностями + похожие
  const openMovie = useCallback(async (movie: Movie) => {
    setSelectedMovie(movie);
    setSimilar([]);
    setModalOpen(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}`);
      if (res.ok) {
        const data = await res.json();
        setSimilar(data.similar ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Поиск
  const handleSearch = useCallback(async (mode: SearchMode, query: string) => {
    const q = query.trim();
    setSearchQuery(q);
    if (!q) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
    // Прокрутка к результатам
    setTimeout(() => {
      document.getElementById("search")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const handleHeaderSearch = useCallback(() => {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredMovies =
    selectedGenre === "Все" ? allMovies : allMovies.filter((m) => m.genres.includes(selectedGenre));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onSearchClick={handleHeaderSearch} onLogoClick={handleLogoClick} />

      <main className="flex-1">
        {/* Hero */}
        {loadingData ? (
          <div className="h-[60vh] min-h-[420px] w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        ) : (
          <HeroCarousel movies={featured} onPlay={openMovie} onInfo={openMovie} />
        )}

        {/* Поиск */}
        <SearchSection
          mode={searchMode}
          setMode={setSearchMode}
          query={searchQuery}
          setQuery={setSearchQuery}
          onSearch={handleSearch}
          results={searchResults}
          loading={searchLoading}
          onPlay={openMovie}
        />

        {/* В тренде */}
        {loadingData ? (
          <RowSkeleton />
        ) : (
          <MovieRow
            id="trending"
            title="В тренде сейчас"
            subtitle="Самые просматриваемые фильмы недели"
            movies={trending}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}

        {/* Каталог с фильтром по жанрам */}
        <section id="catalog" className="border-t border-white/5 bg-card/20 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Каталог</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredMovies.length}</span> {pluralMovies(filteredMovies.length)} · категория «{selectedGenre}»
                </p>
              </div>
              {favorites.size > 0 && (
                <div className="text-xs text-muted-foreground">
                  Избранное: <span className="font-semibold text-cinema">{favorites.size}</span>
                </div>
              )}
            </div>
            <GenreFilter
              genres={genres}
              selected={selectedGenre}
              onSelect={(g) => {
                setSelectedGenre(g);
                setCatalogVisible(24);
              }}
            />
          </div>
          <div className="mt-6">
            {loadingData ? (
              <GridSkeleton />
            ) : (
              <MovieGrid
                movies={filteredMovies}
                onPlay={openMovie}
                onInfo={openMovie}
                limit={catalogVisible}
              />
            )}
          </div>

          {/* Пагинация «Показать ещё» */}
          {!loadingData && filteredMovies.length > catalogVisible && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setCatalogVisible((v) => v + 24)}
                className="gap-2 rounded-full border-white/10 bg-card hover:border-cinema hover:text-cinema"
              >
                <ChevronDown className="h-4 w-4" />
                Показать ещё 24
              </Button>
              <p className="text-xs text-muted-foreground">
                Показано {Math.min(catalogVisible, filteredMovies.length)} из {filteredMovies.length}
              </p>
            </div>
          )}
        </section>

        {/* Новинки */}
        {loadingData ? (
          <RowSkeleton />
        ) : (
          <MovieRow
            id="new"
            title="Новинки"
            subtitle="Свежие премьеры в каталоге"
            movies={newReleases}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}
      </main>

      <Footer />

      <MovieModal
        movie={selectedMovie}
        similar={similar}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPlay={openMovie}
        onAddToFavorites={toggleFavorite}
        favoriteIds={favorites}
      />
    </div>
  );
}

function pluralMovies(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "фильм";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "фильма";
  return "фильмов";
}

function RowSkeleton() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-7 w-48" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[150px] shrink-0 sm:w-[170px]">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GridSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 md:grid-cols-4 lg:grid-cols-5 lg:px-8 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
