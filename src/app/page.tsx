"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "@/components/cinema/header";
import { HeroCarousel } from "@/components/cinema/hero-carousel";
import { SearchSection } from "@/components/cinema/search-section";
import { MovieRow } from "@/components/cinema/movie-row";
import { MovieGrid } from "@/components/cinema/movie-grid";
import { FilterPanel, type FilterState } from "@/components/cinema/filter-panel";
import { MovieModal } from "@/components/cinema/movie-modal";
import { Footer } from "@/components/cinema/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { Movie, Genre } from "@/lib/types";

type SearchMode = "id" | "name" | "torrent";

export default function Home() {
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Genre[]>([]);
  const [yearRange, setYearRange] = useState({ min: 1960, max: 2026 });
  const [loadingData, setLoadingData] = useState(true);

  // Фильтры каталога (с дефолтами)
  const [filters, setFilters] = useState<FilterState>({
    genre: "Все",
    country: "Все",
    yearFrom: 1960,
    yearTo: 2026,
    ratingFrom: 0,
    ratingTo: 10,
    sort: "rating-desc",
  });
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
        const [f, t, a, g, c] = await Promise.all([
          fetch("/api/movies/featured").then((r) => r.json()),
          fetch("/api/movies/trending").then((r) => r.json()),
          fetch("/api/movies").then((r) => r.json()),
          fetch("/api/movies/genres").then((r) => r.json()),
          fetch("/api/movies/countries").then((r) => r.json()),
        ]);
        if (!active) return;
        setFeatured(f.movies ?? []);
        setTrending(t.movies ?? []);
        setAllMovies(a.movies ?? []);
        const sortedNew = [...(a.movies ?? [])].sort((x, y) => y.year - x.year).slice(0, 12);
        setNewReleases(sortedNew);
        setGenres(g.genres ?? []);
        setCountries(c.countries ?? []);
        if (c.yearRange) {
          setYearRange(c.yearRange);
          setFilters((prev) => ({
            ...prev,
            yearFrom: c.yearRange.min,
            yearTo: c.yearRange.max,
          }));
        }
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

  // Фильтрация каталога (client-side через useMemo для мгновенного отклика)
  const filteredMovies = useMemo(() => {
    const result = allMovies.filter((m) => {
      if (filters.genre !== "Все" && !m.genres.includes(filters.genre)) return false;
      if (filters.country !== "Все" && !m.countries.includes(filters.country)) return false;
      if (m.year < filters.yearFrom) return false;
      if (m.year > filters.yearTo) return false;
      if (m.rating < filters.ratingFrom) return false;
      if (m.rating > filters.ratingTo) return false;
      return true;
    });
    const sorted = [...result];
    switch (filters.sort) {
      case "rating-desc": sorted.sort((a, b) => b.rating - a.rating); break;
      case "rating-asc": sorted.sort((a, b) => a.rating - b.rating); break;
      case "year-desc": sorted.sort((a, b) => b.year - a.year); break;
      case "year-asc": sorted.sort((a, b) => a.year - b.year); break;
      case "views-desc": sorted.sort((a, b) => b.views - a.views); break;
      case "title-asc": sorted.sort((a, b) => a.title.localeCompare(b.title, "ru")); break;
    }
    return sorted;
  }, [allMovies, filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      genre: "Все",
      country: "Все",
      yearFrom: yearRange.min,
      yearTo: yearRange.max,
      ratingFrom: 0,
      ratingTo: 10,
      sort: "rating-desc",
    });
    setCatalogVisible(24);
  }, [yearRange.min, yearRange.max]);

  const handleFiltersChange = useCallback((next: FilterState) => {
    setFilters(next);
    setCatalogVisible(24);
  }, []);

  // Бесконечная прокрутка каталога
  const hasMore = filteredMovies.length > catalogVisible;
  const { sentinelRef, isLoading: isLoadingMore } = useInfiniteScroll(
    () => setCatalogVisible((v) => v + 24),
    { resetKey: filters.genre + filters.country + filters.sort, hasMore }
  );

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

        {/* Каталог с расширенными фильтрами */}
        <section id="catalog" className="border-t border-white/5 bg-card/20 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Каталог</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredMovies.length}</span> {pluralMovies(filteredMovies.length)} в коллекции
                </p>
              </div>
              {favorites.size > 0 && (
                <div className="text-xs text-muted-foreground">
                  Избранное: <span className="font-semibold text-cinema">{favorites.size}</span>
                </div>
              )}
            </div>
            <FilterPanel
              filters={filters}
              onChange={handleFiltersChange}
              onReset={resetFilters}
              genres={genres}
              countries={countries}
              yearRange={yearRange}
              resultCount={filteredMovies.length}
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

          {/* Бесконечная прокрутка: sentinel + скелетоны при подгрузке */}
          {!loadingData && hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              {isLoadingMore && (
                <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 md:grid-cols-4 lg:grid-cols-5 lg:px-8 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                      <Skeleton className="mt-2 h-4 w-full" />
                      <Skeleton className="mt-1 h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Показано {Math.min(catalogVisible, filteredMovies.length)} из {filteredMovies.length}
              </p>
              {/* Sentinel — наблюдатель IntersectionObserver срабатывает при попадании в viewport */}
              <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
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
