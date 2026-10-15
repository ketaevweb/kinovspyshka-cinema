import type { Movie, Genre, MovieType } from "@/lib/types";

/**
 * Каталог онлайн-кинотеатра — данные загружаются из /public/movies.json.
 * JSON-файл отдаётся статически, не входит в JS bundle.
 * Это решает проблему сборки Vercel (movies.ts был 6.2МБ → не компилировался).
 */

// Кэш в памяти
let _moviesCache: Movie[] | null = null;

async function loadMovies(): Promise<Movie[]> {
  if (_moviesCache) return _moviesCache;
  try {
    const res = await fetch("/movies.json");
    const data = await res.json();
    _moviesCache = data as Movie[];
    return _moviesCache;
  } catch {
    return [];
  }
}

// Синхронная версия для серверных API (через fs)
function loadMoviesSync(): Movie[] {
  if (_moviesCache) return _moviesCache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const filePath = path.join(process.cwd(), "public", "movies.json");
    const data = fs.readFileSync(filePath, "utf-8");
    _moviesCache = JSON.parse(data) as Movie[];
    return _moviesCache;
  } catch {
    return [];
  }
}

function movies(): Movie[] {
  return loadMoviesSync();
}

export function getAllMovies(): Movie[] {
  return movies();
}

export function getFeaturedMovies(): Movie[] {
  // Hero-карусель — ТОЛЬКО verified (реальные названия, совпадающие с постерами)
  const classics = movies()
    .filter((m) => m.verified && (m.backdropUrl || m.featured))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  const recent = movies()
    .filter((m) => m.verified && m.year >= 2018 && m.rating >= 7.5 && !classics.find((c) => c.id === m.id))
    .sort((a, b) => b.year - a.year || b.rating - a.rating)
    .slice(0, 3);
  const mixed = [...classics, ...recent];
  return mixed.length >= 4 ? mixed : movies().filter((m) => m.verified && m.backdropUrl).slice(0, 6);
}

export function getTrendingMovies(): Movie[] {
  // Тренды — ТОЛЬКО verified (реальные популярные фильмы)
  return [...movies()].filter((m) => m.verified).sort((a, b) => b.views - a.views).slice(0, 14);
}

export function getNewReleases(): Movie[] {
  return [...movies()].filter((m) => m.verified).sort((a, b) => b.year - a.year).slice(0, 14);
}

export function getMovieById(id: string): Movie | undefined {
  return movies().find((m) => m.id === id);
}

export function getMovieByKinopoiskId(kpId: number): Movie | undefined {
  return movies().find((m) => m.kinopoiskId === kpId);
}

export function searchMovies(query: string): Movie[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return [];

  return movies()
    .map((m) => {
      const haystack = [m.title, m.originalTitle, m.director, m.description, m.genres.join(" "), m.cast.join(" "), String(m.year), String(m.kinopoiskId)].join(" ").toLowerCase();
      let score = 0;
      if (m.title.toLowerCase() === q || m.originalTitle.toLowerCase() === q) score += 100;
      if (m.title.toLowerCase().includes(q) || m.originalTitle.toLowerCase().includes(q)) score += 50;
      for (const w of words) {
        if (haystack.includes(w)) score += 10;
        if (m.title.toLowerCase().includes(w) || m.originalTitle.toLowerCase().includes(w)) score += 5;
      }
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.m.rating - a.m.rating)
    .slice(0, 30)
    .map((x) => x.m);
}

export function getMoviesByGenre(genre: string): Movie[] {
  if (!genre || genre === "Все") return movies();
  return movies().filter((m) => m.genres.includes(genre));
}

/** Фильтр по типу контента: film / cartoon / anime / series */
export function getMoviesByType(type: MovieType | "all"): Movie[] {
  if (!type || type === "all") return movies();
  return movies().filter((m) => m.type === type);
}

/** Список типов контента для фильтра в UI */
export function getAllTypes(): Genre[] {
  const counts = new Map<string, number>();
  const labels: Record<MovieType, string> = { film: "Фильмы", cartoon: "Мультфильмы", anime: "Аниме", series: "Сериалы" };
  for (const m of movies()) counts.set(m.type, (counts.get(m.type) ?? 0) + 1);
  return [
    { name: "Все", count: movies().length },
    ...(Object.keys(labels) as MovieType[]).filter((t) => counts.has(t)).map((t) => ({ name: labels[t], count: counts.get(t) ?? 0 })),
  ];
}

export function getAllGenres(): Genre[] {
  const counts = new Map<string, number>();
  for (const m of movies()) {
    for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [{ name: "Все", count: movies().length }, ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)];
}

export function getAllCountries(): Genre[] {
  const counts = new Map<string, number>();
  for (const m of movies()) {
    for (const c of m.countries) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [{ name: "Все", count: movies().length }, ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)];
}

export function getYearRange(): { min: number; max: number } {
  const years = movies().map((m) => m.year).filter(Boolean);
  if (years.length === 0) return { min: 1920, max: 2026 };
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function getSimilarMovies(id: string, limit = 6): Movie[] {
  const current = getMovieById(id);
  if (!current) return [];
  return movies()
    .filter((m) => m.id !== id)
    .map((m) => ({ m, score: m.genres.filter((g) => current.genres.includes(g)).length }))
    .sort((a, b) => b.score - a.score || b.m.views - a.m.views)
    .slice(0, limit)
    .map((x) => x.m);
}

export function getMoviesByDirector(director: string, limit = 14): Movie[] {
  return movies().filter((m) => m.verified && m.director.includes(director)).sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function getTop250(): Movie[] {
  return [...movies()].filter((m) => m.verified).sort((a, b) => b.rating - a.rating).slice(0, 14);
}

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  movies: Movie[];
}

export function getCollections(): Collection[] {
  const v = () => movies().filter((m) => m.verified); // коллекции — только verified
  return [
    { id: "top250", title: "Топ-250 Кинопоиска", subtitle: "Лучшие фильмы всех времён по версии зрителей", movies: getTop250() },
    { id: "evening", title: "Для вечера", subtitle: "Короткие фильмы с высоким рейтингом", movies: v().filter((m) => m.duration <= 120 && m.rating >= 8.0 && m.genres.some((g) => ["Драма","Комедия","Триллер","Мелодрама"].includes(g))).sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: "family", title: "Для всей семьи", subtitle: "Мультфильмы и комедии для всех возрастов", movies: v().filter((m) => (m.ageRating === "0+" || m.ageRating === "6+") && m.genres.some((g) => ["Мультфильм","Семейный","Комедия","Приключения"].includes(g))).sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: "hidden", title: "Спрятанные жемчужины", subtitle: "Мало просмотров, но высокий рейтинг", movies: v().filter((m) => m.views < 500000 && m.rating >= 8.0).sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: "nolan", title: "Кристофер Нолан", subtitle: "Мастер интеллектуального блокбастера", movies: getMoviesByDirector("Кристофер Нолан") },
    { id: "tarantino", title: "Квентин Тарантино", subtitle: "Культовые диалоги и нелинейное повествование", movies: getMoviesByDirector("Квентин Тарантино") },
    { id: "spielberg", title: "Стивен Спилберг", subtitle: "Режиссёр величайших хитов кино", movies: getMoviesByDirector("Стивен Спилберг") },
    { id: "scorsese", title: "Мартин Скорсезе", subtitle: "Хроник криминального мира Америки", movies: getMoviesByDirector("Мартин Скорсезе") },
    { id: "ritchie", title: "Гай Ричи", subtitle: "Британский криминальный стиль", movies: getMoviesByDirector("Гай Ричи") },
    { id: "fincher", title: "Дэвид Финчер", subtitle: "Мастер психологического триллера", movies: getMoviesByDirector("Дэвид Финчер") },
    { id: "russian", title: "Русское кино", subtitle: "Лучшее отечественное кино и СССР", movies: v().filter((m) => m.countries.includes("Россия") || m.countries.includes("СССР")).sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: "anime", title: "Аниме и мультфильмы", subtitle: "Японская анимация и шедевры Disney/Pixar", movies: v().filter((m) => m.genres.includes("Мультфильм") || m.genres.includes("Аниме")).sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: "scifi", title: "Фантастика будущего", subtitle: "Космос, киберпанк и далёкие миры", movies: v().filter((m) => m.genres.includes("Фантастика")).sort((a, b) => b.rating - a.rating).slice(0, 14) },
    { id: "thriller", title: "Захватывающие триллеры", subtitle: "Напряжённые истории, от которых не оторваться", movies: v().filter((m) => m.genres.includes("Триллер")).sort((a, b) => b.rating - a.rating).slice(0, 14) },
  ];
}

export const TOTAL_MOVIES = movies().length;
