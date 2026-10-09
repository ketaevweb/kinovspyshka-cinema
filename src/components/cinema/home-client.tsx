"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "@/components/cinema/header";
import { HeroCarousel } from "@/components/cinema/hero-carousel";
import { SearchSection } from "@/components/cinema/search-section";
import { MovieRow } from "@/components/cinema/movie-row";
import { MovieGrid } from "@/components/cinema/movie-grid";
import { VirtualMovieGrid } from "@/components/cinema/virtual-movie-grid";
import { FilterPanel, type FilterState } from "@/components/cinema/filter-panel";
import { MovieModal } from "@/components/cinema/movie-modal";
import { CompareDialog } from "@/components/cinema/compare-dialog";
import { CommandPalette } from "@/components/cinema/command-palette";
import { CmdKHint } from "@/components/cinema/cmdk-hint";
import { Footer } from "@/components/cinema/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useFavorites } from "@/hooks/use-favorites";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { useI18n, pluralize } from "@/lib/i18n";
import type { Movie, Genre } from "@/lib/types";

type SearchMode = "id" | "name" | "torrent";

interface HomeClientProps {
  /** SSR-данные — приходят сразу в первом HTML, без отдельного fetch */
  initialData: {
    featured: Movie[];
    trending: Movie[];
    allMovies: Movie[];
    genres: Genre[];
    countries: Genre[];
    collections: { id: string; title: string; subtitle: string; movies: Movie[] }[];
    yearRange: { min: number; max: number };
  };
}

export function HomeClient({ initialData }: HomeClientProps) {
  const { t, lang } = useI18n();
  const [featured, setFeatured] = useState<Movie[]>(initialData.featured);
  const [trending, setTrending] = useState<Movie[]>(initialData.trending);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>(initialData.allMovies);
  const [genres, setGenres] = useState<Genre[]>(initialData.genres);
  const [countries, setCountries] = useState<Genre[]>(initialData.countries);
  const [collections, setCollections] = useState<{ id: string; title: string; subtitle: string; movies: Movie[] }[]>(initialData.collections);
  const [yearRange, setYearRange] = useState(initialData.yearRange);
  const [loadingData, setLoadingData] = useState(false); // SSR-данные уже есть

  // Фильтры каталога (дефолты из SSR yearRange)
  const [filters, setFilters] = useState<FilterState>({
    genre: "Все",
    country: "Все",
    yearFrom: initialData.yearRange.min,
    yearTo: initialData.yearRange.max,
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
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareList, setCompareList] = useState<Movie[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Избранное: localStorage для гостей + сервер для авторизованных
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  // История просмотров (localStorage)
  const { history, addToHistory } = useWatchHistory();

  // Сравнение фильмов (до 3)
  const toggleCompare = useCallback((movie: Movie) => {
    setCompareList((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      if (exists) return prev.filter((m) => m.id !== movie.id);
      if (prev.length >= 3) return prev;
      return [...prev, movie];
    });
  }, []);

  const compareIds = useMemo(() => new Set(compareList.map((m) => m.id)), [compareList]);

  // Рекомендации на основе избранных фильмов (content-based: совпадение жанров)
  const recommendations = useMemo(() => {
    if (favorites.size === 0 || allMovies.length === 0) return [];
    const favMovies = allMovies.filter((m) => favorites.has(m.id));
    const favGenres = new Set(favMovies.flatMap((m) => m.genres));
    const favIds = new Set(favMovies.map((m) => m.id));
    return allMovies
      .filter((m) => !favIds.has(m.id))
      .map((m) => ({
        m,
        score: m.genres.filter((g) => favGenres.has(g)).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.m.rating - a.m.rating)
      .slice(0, 14)
      .map((x) => x.m);
  }, [favorites, allMovies]);

  // NewReleases вычисляем из SSR allMovies (сортировка по году)
  useEffect(() => {
    if (allMovies.length > 0) {
      const sortedNew = [...allMovies].sort((x, y) => y.year - x.year).slice(0, 12);
      setNewReleases(sortedNew);
    }
  }, [allMovies]);

  // Открытие модального окна с подробностями + похожие + запись в историю
  const openMovie = useCallback(async (movie: Movie) => {
    setSelectedMovie(movie);
    setSimilar([]);
    setModalOpen(true);
    addToHistory(movie); // записываем в историю просмотров
    try {
      const res = await fetch(`/api/movies/${movie.id}`);
      if (res.ok) {
        const data = await res.json();
        setSimilar(data.similar ?? []);
      }
    } catch {
      /* ignore */
    }
  }, [addToHistory]);

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
      <Header
        onSearchClick={handleHeaderSearch}
        onLogoClick={handleLogoClick}
        favoritesCount={favorites.size}
        onFavoritesClick={() => document.getElementById("favorites")?.scrollIntoView({ behavior: "smooth" })}
        onCompareClick={() => setCompareOpen(true)}
        compareCount={compareList.length}
        authOpen={authOpen}
        onAuthOpenChange={setAuthOpen}
      />

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

        {/* История просмотров (только если есть) */}
        {!loadingData && history.length > 0 && (
          <MovieRow
            id="history"
            title={t("section.history")}
            subtitle={`${t("section.historySub")} — ${history.length}`}
            movies={history.map((h) => allMovies.find((m) => m.id === h.id)).filter(Boolean) as Movie[]}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}

        {/* Избранное (только если есть избранные фильмы) */}
        {!loadingData && favorites.size > 0 && (
          <MovieRow
            id="favorites"
            title={t("section.favorites")}
            subtitle={`${favorites.size} ${pluralize(favorites.size, t("section.favoritesSub"), lang)} в подборке`}
            movies={allMovies.filter((m) => favorites.has(m.id))}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}

        {/* Рекомендации на основе избранного (content-based) */}
        {!loadingData && recommendations.length > 0 && (
          <MovieRow
            id="recommendations"
            title={t("section.recommendations")}
            subtitle={t("section.recommendationsSub")}
            movies={recommendations}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}

        {/* В тренде */}
        {loadingData ? (
          <RowSkeleton />
        ) : (
          <MovieRow
            id="trending"
            title={t("section.trending")}
            subtitle={t("section.trendingSub")}
            movies={trending}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}

        {/* Курированные коллекции */}
        {loadingData ? (
          <RowSkeleton />
        ) : (
          collections.map((col) => (
            <MovieRow
              key={col.id}
              id={`collection-${col.id}`}
              title={col.title}
              subtitle={col.subtitle}
              movies={col.movies}
              onPlay={openMovie}
              onInfo={openMovie}
            />
          ))
        )}

        {/* Каталог с расширенными фильтрами */}
        <section id="catalog" className="border-t border-white/5 bg-card/20 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("catalog.title")}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredMovies.length}</span> {pluralize(filteredMovies.length, t("section.favoritesSub"), lang)} {t("catalog.moviesInCollection")}
                </p>
              </div>
              {favorites.size > 0 && (
                <div className="text-xs text-muted-foreground">
                  {t("catalog.favorites")}: <span className="font-semibold text-cinema">{favorites.size}</span>
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
              <VirtualMovieGrid
                movies={filteredMovies}
                onPlay={openMovie}
                onInfo={openMovie}
                onCompare={toggleCompare}
                compareIds={compareIds}
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
                {t("load.shown")} {Math.min(catalogVisible, filteredMovies.length)} {t("load.of")} {filteredMovies.length}
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
            title={t("section.new")}
            subtitle={t("section.newSub")}
            movies={newReleases}
            onPlay={openMovie}
            onInfo={openMovie}
          />
        )}
      </main>

      <CmdKHint onClick={() => setCommandOpen(true)} />

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

      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        allMovies={allMovies}
        preselected={compareList}
        onPlay={openMovie}
      />

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        allMovies={allMovies}
        favoritesCount={favorites.size}
        onPlay={openMovie}
        onNavigate={(anchor) => {
          document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
        }}
        onCompare={() => setCompareOpen(true)}
        onLogin={() => setAuthOpen(true)}
        isAuthed={false}
      />
    </div>
  );
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
