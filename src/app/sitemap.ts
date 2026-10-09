import type { MetadataRoute } from "next";

const BASE_URL = "https://kinovspyshka-cinema.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Главная страница + страницы по жанрам
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Карточки фильмов как #catalog anchors (динамические через query)
  // Поскольку у нас single-route, индексируем якоря жанров
  const genres = [
    "Драма", "Комедия", "Триллер", "Боевик", "Фантастика",
    "Ужасы", "Мелодрама", "Приключения", "Криминал", "Фэнтези",
    "Исторический", "Военный", "Мультфильм", "Детектив", "Семейный",
  ];
  const genreEntries: MetadataRoute.Sitemap = genres.map((g) => ({
    url: `${BASE_URL}/#catalog`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...genreEntries];
}
