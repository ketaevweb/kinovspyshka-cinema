// Типы данных для онлайн-кинотеатра

/** Тип контента для каталога 10000+ позиций */
export type MovieType = "film" | "cartoon" | "anime" | "series";

export interface Movie {
  /** Уникальный slug-идентификатор */
  id: string;
  /** Русское название */
  title: string;
  /** Оригинальное название */
  originalTitle: string;
  /** Год выпуска */
  year: number;
  /** Рейтинг 0-10 (Кинопоиск-style) */
  rating: number;
  /** Длительность в минутах (для сериалов — средняя длительность серии) */
  duration: number;
  /** Жанры */
  genres: string[];
  /** Страны производства */
  countries: string[];
  /** Режиссёр */
  director: string;
  /** В ролях */
  cast: string[];
  /** Возрастной рейтинг, напр. "16+" */
  ageRating: string;
  /** Краткое описание / синопсис */
  description: string;
  /** Ссылка на постер (вертикальный) */
  posterUrl: string;
  /** Ссылка на широкий backdrop для hero */
  backdropUrl: string;
  /** Ссылка на видео (mp4) для плеера */
  videoUrl: string;
  /** Ссылка на трейлер (mp4) */
  trailerUrl: string;
  /** ID Кинопоиска (для фичи поиска по ID и плеера troutcdn.site/{id}) */
  kinopoiskId: number;
  /** Тип контента: фильм / мультфильм / аниме / сериал */
  type: MovieType;
  /** Число сезонов (для сериалов, иначе 0) */
  seasons?: number;
  /** Показывать в hero-карусели (только verified-фильмы) */
  featured: boolean;
  /** Популярное / в тренде (только verified-фильмы) */
  trending: boolean;
  /** Количество просмотров */
  views: number;
  /** true = реальные полные метаданные; false = реальный ID+постер, метаданные сгенерированы */
  verified: boolean;
}

export interface Genre {
  name: string;
  count: number;
}
