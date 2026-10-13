"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { HeroCarousel } from "@/components/cinema/hero-carousel";
import { SearchSection } from "@/components/cinema/search-section";
import { MovieRow } from "@/components/cinema/movie-row";
import { MovieGrid } from "@/components/cinema/movie-grid";
import { VirtualMovieGrid } from "@/components/cinema/virtual-movie-grid";
import { CmdKHint } from "@/components/cinema/cmdk-hint";
import { EmptyState } from "@/components/cinema/empty-state";
import { AnimatedSection } from "@/components/cinema/animated-section";
import { AdSlot } from "@/components/cinema/ad-slot";
import { StatsPanel } from "@/components/cinema/stats-panel";
import { Achievements } from "@/components/cinema/achievements";
import { ContinueWatching } from "@/components/cinema/continue-watching";
import { Footer } from "@/components/cinema/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useFavorites } from "@/hooks/use-favorites";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useCinemaStats } from "@/hooks/use-cinema-stats";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { useTheme } from "next-themes";
import { useI18n, pluralize } from "@/lib/i18n";
import type { Movie, Genre } from "@/lib/types";
import type { FilterState } from "@/components/cinema/filter-panel";

// Radix UI компоненты рендерим только на клиенте (fix hydration mismatch с ID)
const Header = dynamic(() => import("@/components/cinema/header").then(m => m.Header), { ssr: false });
const MovieModal = dynamic(() => import("@/components/cinema/movie-modal").then(m => m.MovieModal), { ssr: false });
const CompareDialog = dynamic(() => import("@/components/cinema/compare-dialog").then(m => m.CompareDialog), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/cinema/command-palette").then(m => m.CommandPalette), { ssr: false });
const PersonDialog = dynamic(() => import("@/components/cinema/person-dialog").then(m => m.PersonDialog), { ssr: false });
const FilterPanel = dynamic(() => import("@/components/cinema/filter-panel").then(m => ({ default: m.FilterPanel, FilterPanel: m.FilterPanel })), { ssr: false, loading: () => <div className="h-9 w-48" /> });

type SearchMode = "id" | "name" | "torrent";

interface HomeClientProps {
  initialData: {
    featured: Movie[];
    trending: Movie[];
    allMovies: Movie[];
    genres: Genre[];
    countries: Genre[];
    collections: { id: string; title: string; subtitle: string; movies: Movie[] }[];
    yearRange: { min: number; max: number };
  } | null;
}

export function HomeClient({ initialData }: HomeClientProps) {
  const { t, lang } = useI18n();
  const [featured, setFeatured] = useState<Movie[]>(initialData?.featured ?? []);
  const [trending, setTrending] = useState<Movie[]>(initialData?.trending ?? []);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>(initialData?.allMovies ?? []);
  const [genres, setGenres] = useState<Genre[]>(initialData?.genres ?? []);
  const [countries, setCountries] = useState<Genre[]>(initialData?.countries ?? []);
  const [collections, setCollections] = useState<{ id: string; title: string; subtitle: string; movies: Movie[] }[]>(initialData?.collections ?? []);
  const [yearRange, setYearRange] = useState(initialData?.yearRange ?? { min: 1920, max: 2026 });
  const [loadingData, setLoadingData] = useState(!initialData);

  // Фильтры каталога
  const [filters, setFilters] = useState<FilterState>({
    genre: "Все",
    country: "Все",
    yearFrom: initialData?.yearRange.min ?? 1920,
    yearTo: initialData?.yearRange.max ?? 2026,
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
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string; enName?: string; photo: string; profession: string; filmography: { slug: string; title: string; year: number; rating: number; kinopoiskId: number }[] } | null>(null);
  const [personOpen, setPersonOpen] = useState(false);

  // Избранное: localStorage для гостей + сервер для авторизованных
  const { favorites, toggleFavorite, isFavorite, exportFavorites } = useFavorites();
  // История просмотров (localStorage)
  const { history, addToHistory } = useWatchHistory();
  const { continueWatching, recordProgress, markCompleted, removeProgress } = useWatchProgress();

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

  // Статистика просмотра
  const stats = useCinemaStats(allMovies);

  // Загрузка данных через API (если initialData null — клиентский рендеринг)
  useEffect(() => {
    if (initialData) return; // SSR данные уже есть
    let active = true;
    (async () => {
      try {
        const [f, t, a, g, c, col] = await Promise.all([
          fetch("/api/movies/featured").then((r) => r.json()),
          fetch("/api/movies/trending").then((r) => r.json()),
          fetch("/api/movies").then((r) => r.json()),
          fetch("/api/movies/genres").then((r) => r.json()),
          fetch("/api/movies/countries").then((r) => r.json()),
          fetch("/api/movies/collections").then((r) => r.json()),
        ]);
        if (!active) return;
        setFeatured(f.movies ?? []);
        setTrending(t.movies ?? []);
        setAllMovies(a.movies ?? []);
        setGenres(g.genres ?? []);
        setCountries(c.countries ?? []);
        setCollections(col.collections ?? []);
        if (c.yearRange) {
          setYearRange(c.yearRange);
          setFilters((prev) => ({ ...prev, yearFrom: c.yearRange.min, yearTo: c.yearRange.max }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => { active = false; };
  }, [initialData]);

  // NewReleases вычисляем из allMovies (сортировка по году)
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
    addToHistory(movie);
    recordProgress(movie);
    try {
      const res = await fetch(`/api/movies/${movie.id}`);
      if (res.ok) {
        const data = await res.json();
        setSimilar(data.similar ?? []);
      }
    } catch {
      /* ignore */
    }
  }, [addToHistory, recordProgress]);

  // Слушатель для открытия фильма из AI-чата (глобальное событие)
  useEffect(() => {
    const handler = async (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (!slug) return;
      const movie = allMovies.find((m) => m.id === slug);
      if (movie) {
        openMovie(movie);
      }
    };
    window.addEventListener("cinema:open-movie", handler);
    return () => window.removeEventListener("cinema:open-movie", handler);
  }, [allMovies, openMovie]);

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

  // Горячие клавиши: T (тема), L (язык), / (поиск), C (сравнить)
  const { setTheme, theme } = useTheme();
  const { setLang } = useI18n();
  useHotkeys([
    { key: "t", handler: () => setTheme(theme === "dark" ? "light" : "dark") },
    { key: "l", handler: () => setLang(lang === "ru" ? "en" : "ru") },
    { key: "/", handler: () => document.getElementById("search")?.scrollIntoView({ behavior: "smooth" }) },
    { key: "c", handler: () => setCompareOpen(true) },
    { key: "r", handler: () => { if (allMovies.length > 0) { const random = allMovies[Math.floor(Math.random() * allMovies.length)]; openMovie(random); } } },
  ]);

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
        onRandomClick={() => {
          if (allMovies.length > 0) {
            const random = allMovies[Math.floor(Math.random() * allMovies.length)];
            openMovie(random);
          }
        }}
        onProfileClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
        watchHistoryCount={history.length}
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

        {/* Продолжить просмотр (прогресс-бар) */}
        {!loadingData && continueWatching.length > 0 && (
          <AnimatedSection>
            <ContinueWatching
              entries={continueWatching}
              onPlay={(entry) => {
                const movie = allMovies.find((m) => m.id === entry.movieId);
                if (movie) openMovie(movie);
              }}
              onRemove={removeProgress}
              onComplete={markCompleted}
            />
          </AnimatedSection>
        )}

        {/* История просмотров (только если есть) */}
        {!loadingData && history.length > 0 && (
          <AnimatedSection>
            <MovieRow
              id="history"
              title={t("section.history")}
              subtitle={`${t("section.historySub")} — ${history.length}`}
              movies={history.map((h) => allMovies.find((m) => m.id === h.id)).filter(Boolean) as Movie[]}
              onPlay={openMovie}
              onInfo={openMovie}
            />
          </AnimatedSection>
        )}

        {/* Избранное (только если есть избранные фильмы) */}
        {!loadingData && favorites.size > 0 && (
          <AnimatedSection delay={0.05}>
            <MovieRow
              id="favorites"
              title={t("section.favorites")}
              subtitle={`${favorites.size} ${pluralize(favorites.size, t("section.favoritesSub"), lang)} в подборке`}
              movies={allMovies.filter((m) => favorites.has(m.id))}
              onPlay={openMovie}
              onInfo={openMovie}
            />
          </AnimatedSection>
        )}

        {/* Рекомендации на основе избранного (content-based) */}
        {!loadingData && recommendations.length > 0 && (
          <AnimatedSection delay={0.1}>
            <MovieRow
              id="recommendations"
              title={t("section.recommendations")}
              subtitle={t("section.recommendationsSub")}
              movies={recommendations}
              onPlay={openMovie}
              onInfo={openMovie}
            />
          </AnimatedSection>
        )}

        {/* Новинки в ваших жанрах */}
        {!loadingData && favorites.size > 0 && allMovies.length > 0 && (
          <AnimatedSection delay={0.15}>
            <MovieRow
              id="new-in-genres"
              title="Новинки в ваших жанрах"
              subtitle="Свежие фильмы в жанрах, которые вы смотрите"
              movies={(() => {
                const favGenres = new Set(
                  allMovies.filter((m) => favorites.has(m.id)).flatMap((m) => m.genres)
                );
                return allMovies
                  .filter((m) => !favorites.has(m.id) && m.year >= 2020 && m.genres.some((g) => favGenres.has(g)))
                  .sort((a, b) => b.year - a.year)
                  .slice(0, 14);
              })()}
              onPlay={openMovie}
              onInfo={openMovie}
            />
          </AnimatedSection>
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

        {/* Статистика просмотра */}
        {!loadingData && stats.totalWatched > 0 && (
          <AnimatedSection>
            <div id="stats">
              <StatsPanel stats={stats} />
              <Achievements stats={stats} />
            </div>
          </AnimatedSection>
        )}

        {/* Премиум-промо / рекламный слот */}
        <AdSlot variant="native" />

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
            ) : filteredMovies.length === 0 ? (
              <EmptyState
                variant="search"
                onAction={resetFilters}
                actionLabel={t("filters.reset")}
              />
            ) : (
              <MovieGrid
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

      <CmdKHint
        onClick={() => setCommandOpen(true)}
        onRandomClick={() => {
          if (allMovies.length > 0) {
            const random = allMovies[Math.floor(Math.random() * allMovies.length)];
            openMovie(random);
          }
        }}
      />

      <Footer favoritesCount={favorites.size} onExportFavorites={exportFavorites} />

      <MovieModal
        movie={selectedMovie}
        similar={similar}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPlay={openMovie}
        onAddToFavorites={toggleFavorite}
        favoriteIds={favorites}
        onPersonClick={(person) => {
          setSelectedPerson(person);
          setPersonOpen(true);
        }}
      />

      <PersonDialog
        person={selectedPerson}
        open={personOpen}
        onOpenChange={setPersonOpen}
        allMovies={allMovies}
        onPlay={openMovie}
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
