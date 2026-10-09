// Типы данных для онлайн-кинотеатра

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
  /** Длительность в минутах */
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
  /** ID Кинопоиска (для фичи поиска по ID) */
  kinopoiskId: number;
  /** Показывать в hero-карусели */
  featured: boolean;
  /** Популярное / в тренде */
  trending: boolean;
  /** Количество просмотров */
  views: number;
}

export interface Genre {
  name: string;
  count: number;
}
