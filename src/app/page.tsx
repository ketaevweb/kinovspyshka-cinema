import { HomeClient } from "@/components/cinema/home-client";
import {
  getFeaturedMovies,
  getTrendingMovies,
  getAllMovies,
  getAllGenres,
  getAllCountries,
  getYearRange,
  getCollections,
} from "@/lib/movies";

// Server component — данные рендерятся на сервере в первом HTML
export const dynamic = "force-static";
export const revalidate = 3600; // ISR: пересобираем раз в час

export default function Home() {
  // Все данные получаем серверно — попадают в первый HTML-ответ
  const featured = getFeaturedMovies();
  const trending = getTrendingMovies();
  const allMovies = getAllMovies();
  const genres = getAllGenres();
  const { countries } = { countries: getAllCountries() };
  const yearRange = getYearRange();
  const collections = getCollections();

  return (
    <HomeClient
      initialData={{
        featured,
        trending,
        allMovies,
        genres,
        countries,
        collections,
        yearRange,
      }}
    />
  );
}
