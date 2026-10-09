"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, string>;

// Русский словарь (основной)
const ru: Dict = {
  // Header / nav
  "nav.home": "Главная",
  "nav.catalog": "Каталог",
  "nav.trending": "В тренде",
  "nav.new": "Новинки",
  "nav.search": "Поиск",
  "nav.watch": "Смотреть",
  "nav.login": "Войти",
  "nav.compare": "Сравнить",

  // Hero
  "hero.featured": "В центре внимания",
  "hero.trending": "В тренде",
  "hero.watch": "Смотреть",
  "hero.info": "Подробнее",

  // Search
  "search.title": "Найдите фильм за секунду",
  "search.subtitle": "Ищите по ID Кинопоиска, по названию или по торрентам — как в старом добром онлайн-кинотеатре.",
  "search.mode.id": "По ID Кинопоиска",
  "search.mode.name": "По названию",
  "search.mode.torrent": "По торрентам",
  "search.placeholder.id": "Введите ID, например 447301",
  "search.placeholder.name": "Название фильма или сериала...",
  "search.placeholder.torrent": "Название для поиска торрентов...",
  "search.button": "Искать",
  "search.example": "Пример",
  "search.found": "Найдено",
  "search.nothing": "ничего не найдено в нашем каталоге",
  "search.searchOnKp": "Искать",
  "search.onKp": "на kinopoisk.ws",
  "search.loading": "Поиск…",
  "search.searching": "Идёт поиск...",

  // Catalog / filters
  "catalog.title": "Каталог",
  "catalog.moviesInCollection": "в коллекции",
  "catalog.favorites": "Избранное",
  "filters.title": "Фильтры",
  "filters.advanced": "Расширенные фильтры",
  "filters.sort": "Сортировка",
  "filters.genre": "Жанр",
  "filters.country": "Страна",
  "filters.year": "Год",
  "filters.rating": "Рейтинг",
  "filters.reset": "Сбросить",
  "filters.found": "Найдено",
  "filters.all": "Все",
  "sort.ratingDesc": "По рейтингу ↓",
  "sort.ratingAsc": "По рейтингу ↑",
  "sort.yearDesc": "По новизне ↓",
  "sort.yearAsc": "По году ↑",
  "sort.viewsDesc": "По популярности ↓",
  "sort.titleAsc": "По названию А-Я",
  "load.more": "Показать ещё",
  "load.shown": "Показано",
  "load.of": "из",

  // Movie card / modal
  "movie.watch": "Смотреть",
  "movie.info": "Подробнее",
  "movie.favorites": "В избранное",
  "movie.favorited": "В избранном",
  "movie.compare": "В сравнение",
  "movie.share": "Поделиться",
  "movie.trailer": "Трейлер",
  "movie.similar": "Похожие фильмы",
  "movie.director": "Режиссёр",
  "movie.countries": "Страны",
  "movie.cast": "В ролях",
  "movie.castFull": "Актёрский состав",
  "movie.rating": "Рейтинг",
  "movie.duration": "мин",
  "movie.views": "Просмотры",
  "movie.age": "Возраст",
  "movie.openPlayer": "Открыть плеер в новом окне",
  "movie.watchInHD": "Смотреть онлайн в HD",
  "movie.sourceKp": "kinopoisk.ws",
  "movie.externalSource": "Внешний источник",
  "movie.searchByName": "Или искать по названию на kinopoisk.ws",
  "movie.blockedNotice": "Встроенный плеер видеохостинга блокирует встраивание на сторонних доменах, поэтому фильм открывается в новой вкладке kinopoisk.ws — там видео воспроизводится без ограничений.",

  // Sections
  "section.trending": "В тренде сейчас",
  "section.trendingSub": "Самые просматриваемые фильмы недели",
  "section.new": "Новинки",
  "section.newSub": "Свежие премьеры в каталоге",
  "section.history": "Вы смотрели",
  "section.historySub": "Недавно открытые фильмы",
  "section.favorites": "Ваше избранное",
  "section.favoritesSub": "фильм;фильма;фильмов",
  "section.recommendations": "Рекомендации для вас",
  "section.recommendationsSub": "Похожие на ваши избранные фильмы по жанрам",
  "section.top250": "Топ-250 Кинопоиска",
  "section.top250Sub": "Лучшие фильмы всех времён по версии зрителей",

  // Auth
  "auth.title": "Войти в КиноВспышку",
  "auth.subtitle": "Синхронизируйте избранное между устройствами",
  "auth.login": "Вход",
  "auth.register": "Регистрация",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.passwordHint": "Пароль (мин. 6 символов)",
  "auth.name": "Имя (необязательно)",
  "auth.namePlaceholder": "Как вас зовут",
  "auth.signIn": "Войти",
  "auth.createAccount": "Создать аккаунт",
  "auth.welcome": "Добро пожаловать!",
  "auth.accountCreated": "Аккаунт создан!",
  "auth.wrongCredentials": "Неверный email или пароль",
  "auth.error": "Ошибка",
  "auth.notAuth": "Не авторизован",
  "auth.logout": "Выйти",

  // Compare
  "compare.title": "Сравнение фильмов",
  "compare.selected": "выбрано",
  "compare.empty": "Выберите до 3 фильмов из списка ниже для сравнения по рейтингу, длительности, жанрам и другим параметрам.",
  "compare.addMore": "Добавьте ещё",
  "compare.open": "Открыть",

  // Theme
  "theme.dark": "Тёмная тема",
  "theme.light": "Светлая тема",

  // Footer
  "footer.tagline": "Онлайн-кинотеатр с большой коллекцией фильмов и сериалов в HD. Смотрите трейлеры, ищите по названию или ID Кинопоиска.",
  "footer.rights": "Все права защищены",
  "footer.madeWith": "Сделано с",
  "footer.forCinema": "для любителей кино",
  "footer.copyright": "КиноВспышка. Все права защищены.",

  // Misc
  "lang.ru": "RU",
  "lang.en": "EN",
};

// English dictionary
const en: Dict = {
  "nav.home": "Home",
  "nav.catalog": "Catalog",
  "nav.trending": "Trending",
  "nav.new": "New",
  "nav.search": "Search",
  "nav.watch": "Watch",
  "nav.login": "Sign in",
  "nav.compare": "Compare",

  "hero.featured": "Featured",
  "hero.trending": "Trending",
  "hero.watch": "Watch",
  "hero.info": "Details",

  "search.title": "Find a movie in a second",
  "search.subtitle": "Search by Kinopoisk ID, by title or by torrents — like a good old online cinema.",
  "search.mode.id": "By Kinopoisk ID",
  "search.mode.name": "By title",
  "search.mode.torrent": "By torrents",
  "search.placeholder.id": "Enter ID, e.g. 447301",
  "search.placeholder.name": "Movie or series title...",
  "search.placeholder.torrent": "Title for torrent search...",
  "search.button": "Search",
  "search.example": "Example",
  "search.found": "Found",
  "search.nothing": "nothing found in our catalog",
  "search.searchOnKp": "Search",
  "search.onKp": "on kinopoisk.ws",
  "search.loading": "Searching…",
  "search.searching": "Searching...",

  "catalog.title": "Catalog",
  "catalog.moviesInCollection": "in collection",
  "catalog.favorites": "Favorites",
  "filters.title": "Filters",
  "filters.advanced": "Advanced filters",
  "filters.sort": "Sort",
  "filters.genre": "Genre",
  "filters.country": "Country",
  "filters.year": "Year",
  "filters.rating": "Rating",
  "filters.reset": "Reset",
  "filters.found": "Found",
  "filters.all": "All",
  "sort.ratingDesc": "By rating ↓",
  "sort.ratingAsc": "By rating ↑",
  "sort.yearDesc": "Newest first ↓",
  "sort.yearAsc": "By year ↑",
  "sort.viewsDesc": "Most popular ↓",
  "sort.titleAsc": "By title A-Z",
  "load.more": "Show more",
  "load.shown": "Shown",
  "load.of": "of",

  "movie.watch": "Watch",
  "movie.info": "Details",
  "movie.favorites": "Add to favorites",
  "movie.favorited": "In favorites",
  "movie.compare": "Add to compare",
  "movie.share": "Share",
  "movie.trailer": "Trailer",
  "movie.similar": "Similar movies",
  "movie.director": "Director",
  "movie.countries": "Countries",
  "movie.cast": "Cast",
  "movie.castFull": "Cast",
  "movie.rating": "Rating",
  "movie.duration": "min",
  "movie.views": "Views",
  "movie.age": "Age",
  "movie.openPlayer": "Open player in new tab",
  "movie.watchInHD": "Watch online in HD",
  "movie.sourceKp": "kinopoisk.ws",
  "movie.externalSource": "External source",
  "movie.searchByName": "Or search by title on kinopoisk.ws",
  "movie.blockedNotice": "The embedded video player blocks embedding on third-party domains, so the movie opens in a new tab of kinopoisk.ws — the video plays without restrictions there.",

  "section.trending": "Trending now",
  "section.trendingSub": "Most watched movies this week",
  "section.new": "New releases",
  "section.newSub": "Fresh premieres in the catalog",
  "section.history": "You watched",
  "section.historySub": "Recently opened movies",
  "section.favorites": "Your favorites",
  "section.favoritesSub": "movie;movies;movies",
  "section.recommendations": "Recommendations for you",
  "section.recommendationsSub": "Similar to your favorites by genre",
  "section.top250": "Kinopoisk Top-250",
  "section.top250Sub": "Best movies of all time by viewers",

  "auth.title": "Sign in to KinoVspyshka",
  "auth.subtitle": "Sync favorites across devices",
  "auth.login": "Sign in",
  "auth.register": "Register",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordHint": "Password (min. 6 chars)",
  "auth.name": "Name (optional)",
  "auth.namePlaceholder": "Your name",
  "auth.signIn": "Sign in",
  "auth.createAccount": "Create account",
  "auth.welcome": "Welcome!",
  "auth.accountCreated": "Account created!",
  "auth.wrongCredentials": "Wrong email or password",
  "auth.error": "Error",
  "auth.notAuth": "Not authenticated",
  "auth.logout": "Sign out",

  "compare.title": "Movie comparison",
  "compare.selected": "selected",
  "compare.empty": "Select up to 3 movies from the list below to compare by rating, duration, genres and other parameters.",
  "compare.addMore": "Add more",
  "compare.open": "Open",

  "theme.dark": "Dark theme",
  "theme.light": "Light theme",

  "footer.tagline": "Online cinema with a large collection of movies and series in HD. Watch trailers, search by title or Kinopoisk ID.",
  "footer.rights": "All rights reserved",
  "footer.madeWith": "Made with",
  "footer.forCinema": "for movie lovers",
  "footer.copyright": "KinoVspyshka. All rights reserved.",

  "lang.ru": "RU",
  "lang.en": "EN",
};

const DICTS: Record<Lang, Dict> = { ru, en };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "cinema:lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  // Загрузка языка из localStorage после гидрации
  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
        if (saved === "ru" || saved === "en") {
          setLangState(saved);
        }
      } catch {
        /* ignore */
      }
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = DICTS[lang];
      let str = dict[key] ?? DICTS.ru[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback для случаев когда provider не обёрнут
    return {
      lang: "ru" as Lang,
      setLang: () => {},
      t: (key: string) => DICTS.ru[key] ?? key,
    };
  }
  return ctx;
}

/** Хелпер для плюрализации (RU: 1 фильм, 2 фильма, 5 фильмов) */
export function pluralize(n: number, forms: string, lang: Lang = "ru"): string {
  if (lang === "en") {
    return n === 1 ? forms.split(";")[0] : forms.split(";")[1] || forms.split(";")[0];
  }
  const parts = forms.split(";");
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return parts[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return parts[1];
  return parts[2] || parts[0];
}
