import type { Movie, Genre } from "@/lib/types";

/**
 * Каталог фильмов онлайн-кинотеатра.
 * Метаданные реальные, видео — публичные sample-файлы (w3.org / test-videos.co.uk),
 * постеры и backdrops подставляются из карт результатов image-search.
 */

const SAMPLE_VIDEOS = [
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
];

/** Карта постеров: slug -> URL (получены через image-search) */
export const POSTERS: Record<string, string> = {
  inception: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/510d5710e6a6.jpg",
  dark_knight: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/909704c82aef.jpg",
  interstellar: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/56b1fa52f299.jpg",
  matrix: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b94c57c021f6.jpg",
  pulp_fiction: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cb901f4329f6.jpg",
  fight_club: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/41b077aaef9c.jpg",
  forrest_gump: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4d245c4f792f.jpg",
  shawshank: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/503afd663b47.jpg",
  avatar: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d0ddcd54b5c6.jpg",
  gladiator: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/18017364b679.jpg",
  godfather: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fa150fd83ad7.jpg",
  parasite: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c05338917f6c.jpg",
  joker: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c4f13a1ae946.jpg",
  dune: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/17307b6a93c8.jpg",
  blade_runner: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/759e10c319de.jpg",
  mad_max: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c6ca1a195e0.jpg",
  whiplash: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/db3f70b570ee.jpg",
  brat: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c6dc4d57180b.jpg",
};

/** Карта backdrops для hero: slug -> URL */
export const BACKDROPS: Record<string, string> = {
  shawshank: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2529b829db72.jpg",
  godfather: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bc2cec605c2d.jpg",
  dark_knight: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f2921581703e.jpg",
  inception: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6f60864174a7.jpg",
  interstellar: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8cb796e28737.jpg",
  dune: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4864bb48892d.jpg",
};

const movieData: Omit<Movie, "posterUrl" | "backdropUrl" | "videoUrl" | "trailerUrl">[] = [
  {
    id: "inception",
    title: "Начало",
    originalTitle: "Inception",
    year: 2010,
    rating: 8.8,
    duration: 148,
    genres: ["Фантастика", "Боевик", "Триллер"],
    countries: ["США", "Великобритания"],
    director: "Кристофер Нолан",
    cast: ["Леонардо ДиКаприо", "Джозеф Гордон-Левитт", "Эллен Пейдж", "Том Харди"],
    ageRating: "12+",
    description:
      "Дом Кобб — талантливый вор, лучший из лучших в опасном искусстве извлечения: он крадёт ценные идеи и секреты прямо из подсознания во время сна. Но теперь ему предстоит сделать невозможное — внедрить идею в чужой разум.",
    kinopoiskId: 447301,
    featured: true,
    trending: true,
    views: 4523000,
  },
  {
    id: "dark_knight",
    title: "Тёмный рыцарь",
    originalTitle: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    duration: 152,
    genres: ["Боевик", "Криминал", "Триллер"],
    countries: ["США", "Великобритания"],
    director: "Кристофер Нолан",
    cast: ["Кристиан Бейл", "Хит Леджер", "Аарон Экхарт", "Мэгги Джилленхол"],
    ageRating: "16+",
    description:
      "Бэтмен поднимает ставки в войне с преступностью. С помощью лейтенанта Джима Гордона и окружного прокурора Харви Дента он пытается разрушить организованные банды Готэма. Но всё меняет появление Джокера.",
    kinopoiskId: 3836,
    featured: true,
    trending: true,
    views: 5210000,
  },
  {
    id: "interstellar",
    title: "Интерстеллар",
    originalTitle: "Interstellar",
    year: 2014,
    rating: 8.7,
    duration: 169,
    genres: ["Фантастика", "Драма", "Приключения"],
    countries: ["США", "Великобритания"],
    director: "Кристофер Нолан",
    cast: ["Мэттью Макконахи", "Энн Хэтэуэй", "Джессика Честейн", "Майкл Кейн"],
    ageRating: "12+",
    description:
      "Когда Земля умирает от засухи и пыльных бурь, команда исследователей отправляется сквозь кротовую нору к другой галактике, чтобы найти для человечества новый дом среди звёзд.",
    kinopoiskId: 258687,
    featured: true,
    trending: true,
    views: 3870000,
  },
  {
    id: "matrix",
    title: "Матрица",
    originalTitle: "The Matrix",
    year: 1999,
    rating: 8.7,
    duration: 136,
    genres: ["Фантастика", "Боевик"],
    countries: ["США"],
    director: "Лана Вачовски, Лилли Вачовски",
    cast: ["Киану Ривз", "Лоренс Фишбёрн", "Кэрри-Энн Мосс", "Хьюго Уивинг"],
    ageRating: "16+",
    description:
      "Хакер Нео узнаёт, что реальность — лишь иллюзия, созданная машинами для порабощения человечества. Он присоединяется к повстанцам, чтобы сразиться с Матрицей и освободить людей.",
    kinopoiskId: 301,
    featured: false,
    trending: true,
    views: 4120000,
  },
  {
    id: "pulp_fiction",
    title: "Криминальное чтиво",
    originalTitle: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    duration: 154,
    genres: ["Криминал", "Драма"],
    countries: ["США"],
    director: "Квентин Тарантино",
    cast: ["Джон Траволта", "Сэмюэл Л. Джексон", "Ума Турман", "Брюс Уиллис"],
    ageRating: "18+",
    description:
      "Два киллера, боксёр, жена босса мафии и пара грабителей — их истории переплетаются в нелинейном повествовании, полном чёрного юмора, насилия и культовых диалогов.",
    kinopoiskId: 576,
    featured: false,
    trending: true,
    views: 2980000,
  },
  {
    id: "fight_club",
    title: "Бойцовский клуб",
    originalTitle: "Fight Club",
    year: 1999,
    rating: 8.8,
    duration: 139,
    genres: ["Драма", "Триллер"],
    countries: ["США", "Германия"],
    director: "Дэвид Финчер",
    cast: ["Брэд Питт", "Эдвард Нортон", "Хелена Бонем Картер"],
    ageRating: "18+",
    description:
      "Уставший от потребительской жизни клерк знакомится с харизматичным продавцом мыла Тайлером Дёрденом, и вместе они создают подпольный бойцовский клуб, который перерастает в нечто гораздо большее.",
    kinopoiskId: 374,
    featured: false,
    trending: false,
    views: 3540000,
  },
  {
    id: "forrest_gump",
    title: "Форрест Гамп",
    originalTitle: "Forrest Gump",
    year: 1994,
    rating: 8.9,
    duration: 142,
    genres: ["Драма", "Комедия", "Мелодрама"],
    countries: ["США"],
    director: "Роберт Земекис",
    cast: ["Том Хэнкс", "Робин Райт", "Гари Синиз"],
    ageRating: "12+",
    description:
      "История человека с невысоким IQ, который, сам того не ведая, становится участником ключевых событий американской истории второй половины XX века — от Вьетнамской войны до Уотергейта.",
    kinopoiskId: 1917,
    featured: false,
    trending: false,
    views: 2870000,
  },
  {
    id: "shawshank",
    title: "Побег из Шоушенка",
    originalTitle: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    duration: 142,
    genres: ["Драма", "Криминал"],
    countries: ["США"],
    director: "Фрэнк Дарабонт",
    cast: ["Тим Роббинс", "Морган Фримен", "Боб Гантон"],
    ageRating: "16+",
    description:
      "Вице-президент банка Энди Дюфрейн обвинён в убийстве жены и отправлен в тюрьму Шоушенк. Там он заводит дружбу с заключённым Редом и годами готовит побег, обретая надежду там, где её не должно быть.",
    kinopoiskId: 326,
    featured: true,
    trending: true,
    views: 6240000,
  },
  {
    id: "avatar",
    title: "Аватар",
    originalTitle: "Avatar",
    year: 2009,
    rating: 8.0,
    duration: 162,
    genres: ["Фантастика", "Боевик", "Приключения"],
    countries: ["США"],
    director: "Джеймс Кэмерон",
    cast: ["Сэм Уортингтон", "Зои Салдана", "Сигурни Уивер"],
    ageRating: "12+",
    description:
      "Парализованный морпех Джейк Салли отправляется на планету Пандора в теле аватара, где встречает народ на’ви и оказывается перед выбором между долгом и новым домом.",
    kinopoiskId: 61640,
    featured: false,
    trending: false,
    views: 3210000,
  },
  {
    id: "gladiator",
    title: "Гладиатор",
    originalTitle: "Gladiator",
    year: 2000,
    rating: 8.5,
    duration: 155,
    genres: ["Боевик", "Драма", "Исторический"],
    countries: ["США", "Великобритания"],
    director: "Ридли Скотт",
    cast: ["Рассел Кроу", "Хоакин Феникс", "Конни Нильсен"],
    ageRating: "16+",
    description:
      "Римский генерал Максимус предан императором Коммодом, потерял семью и стал рабом-гладиатором. Теперь его цель — отомстить на арене Колизея и восстановить справедливость.",
    kinopoiskId: 4488,
    featured: false,
    trending: true,
    views: 2650000,
  },
  {
    id: "godfather",
    title: "Крёстный отец",
    originalTitle: "The Godfather",
    year: 1972,
    rating: 9.2,
    duration: 175,
    genres: ["Криминал", "Драма"],
    countries: ["США"],
    director: "Фрэнсис Форд Коппола",
    cast: ["Марлон Брандо", "Аль Пачино", "Джеймс Каан", "Роберт Дювалл"],
    ageRating: "18+",
    description:
      "Эпическая сага о семье итальянской мафии Корлеоне. Когда стареющий дон Вито передаёт дела сыну Майклу, тот превращается из честного героя войны в безжалостного главу криминальной империи.",
    kinopoiskId: 4517,
    featured: true,
    trending: true,
    views: 4890000,
  },
  {
    id: "parasite",
    title: "Паразиты",
    originalTitle: "Parasite",
    year: 2019,
    rating: 8.5,
    duration: 132,
    genres: ["Драма", "Триллер", "Комедия"],
    countries: ["Южная Корея"],
    director: "Пон Джун-хо",
    cast: ["Сон Кан-хо", "Ли Сон-гюн", "Чо Ё-джон"],
    ageRating: "18+",
    description:
      "Бедная семья Кимов ловко проникает в дом богатых Паков, выдавая друг друга за высококлассных специалистов. Но в роскошном особняке скрывается секрет, который перевернёт всё.",
    kinopoiskId: 1195653,
    featured: false,
    trending: true,
    views: 1980000,
  },
  {
    id: "joker",
    title: "Джокер",
    originalTitle: "Joker",
    year: 2019,
    rating: 8.4,
    duration: 122,
    genres: ["Криминал", "Драма", "Триллер"],
    countries: ["США", "Канада"],
    director: "Тодд Филлипс",
    cast: ["Хоакин Феникс", "Роберт Де Ниро", "Зази Битц"],
    ageRating: "18+",
    description:
      "Готэм конца 1970-х. Комик-неудачник Артур Флек страдает от психического расстройства и равнодушия общества. Постепенно он срывается и превращается в культового злодея Джокера.",
    kinopoiskId: 1143242,
    featured: false,
    trending: false,
    views: 3450000,
  },
  {
    id: "dune",
    title: "Дюна",
    originalTitle: "Dune",
    year: 2021,
    rating: 8.0,
    duration: 155,
    genres: ["Фантастика", "Приключения", "Боевик"],
    countries: ["США", "Канада"],
    director: "Дени Вильнёв",
    cast: ["Тимоти Шаламе", "Ребекка Фергюсон", "Оскар Айзек", "Зендея"],
    ageRating: "12+",
    description:
      "Далёкое будущее. Дом Атрейдесов получает в управление планету Арракис — единственный источник драгоценной пряности. Юный Пол Атрейдес оказывается в центре судьбоносной борьбы за пустынный мир.",
    kinopoiskId: 1309369,
    featured: true,
    trending: true,
    views: 2560000,
  },
  {
    id: "blade_runner",
    title: "Бегущий по лезвию 2049",
    originalTitle: "Blade Runner 2049",
    year: 2017,
    rating: 8.0,
    duration: 164,
    genres: ["Фантастика", "Триллер", "Драма"],
    countries: ["США", "Великобритания"],
    director: "Дени Вильнёв",
    cast: ["Райан Гослинг", "Харрисон Форд", "Ана де Армас"],
    ageRating: "16+",
    description:
      "Офицер К — охотник на репликантов — раскрывает тайну, которая может погрузить остатки общества в хаос. Его путь ведёт к легендарному Рику Декарду, пропавшему тридцать лет назад.",
    kinopoiskId: 846021,
    featured: false,
    trending: false,
    views: 1870000,
  },
  {
    id: "mad_max",
    title: "Безумный Макс: Дорога ярости",
    originalTitle: "Mad Max: Fury Road",
    year: 2015,
    rating: 8.1,
    duration: 120,
    genres: ["Боевик", "Фантастика", "Приключения"],
    countries: ["Австралия", "США"],
    director: "Джордж Миллер",
    cast: ["Том Харди", "Шарлиз Терон", "Николас Холт"],
    ageRating: "16+",
    description:
      "В постапокалиптической пустыне Макс Рокатанский присоединяется к беглянке Фиосе, чтобы спасти группу женщин от тирана Иммортана Джо в безумной погоне через пыльные земли.",
    kinopoiskId: 755961,
    featured: false,
    trending: false,
    views: 2140000,
  },
  {
    id: "whiplash",
    title: "Одержимость",
    originalTitle: "Whiplash",
    year: 2014,
    rating: 8.5,
    duration: 107,
    genres: ["Драма", "Музыка"],
    countries: ["США"],
    director: "Дэмьен Шазелл",
    cast: ["Майлз Теллер", "Джей Кей Симмонс"],
    ageRating: "16+",
    description:
      "Юный барабанщик Эндрю мечтает стать великим. Его наставник — жестокий и требовательный дирижёр Флетчер — доводит учеников до предела, проверяя, кто из них станет по-настоящему великим.",
    kinopoiskId: 784834,
    featured: false,
    trending: false,
    views: 1760000,
  },
  {
    id: "brat",
    title: "Брат",
    originalTitle: "Brat",
    year: 1997,
    rating: 8.4,
    duration: 99,
    genres: ["Криминал", "Драма"],
    countries: ["Россия"],
    director: "Алексей Балабанов",
    cast: ["Сергей Бодров-младший", "Виктор Сухоруков", "Светлана Письмиченко"],
    ageRating: "16+",
    description:
      "Дембель Данила Багров возвращается из Чечни в родной Петербург. Не найдя себя в мирной жизни, он втягивается в криминальные разборки, доказывая, что у «брата» есть своё понятие правды.",
    kinopoiskId: 309,
    featured: false,
    trending: true,
    views: 2340000,
  },
];

/** Полный каталог фильмов с подставленными постерами, backdrops и видео. */
export const MOVIES: Movie[] = movieData.map((m, i) => ({
  ...m,
  posterUrl: POSTERS[m.id] ?? "",
  backdropUrl: BACKDROPS[m.id] ?? "",
  videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
  trailerUrl: SAMPLE_VIDEOS[(i + 3) % SAMPLE_VIDEOS.length],
}));

// ----- In-memory кэш для частых запросов -----
let _moviesCache: Movie[] | null = null;
function movies(): Movie[] {
  if (!_moviesCache) _moviesCache = MOVIES;
  return _moviesCache;
}

export function getAllMovies(): Movie[] {
  return movies();
}

export function getFeaturedMovies(): Movie[] {
  return movies().filter((m) => m.featured);
}

export function getTrendingMovies(): Movie[] {
  return [...movies()].sort((a, b) => b.views - a.views).slice(0, 10);
}

export function getNewReleases(): Movie[] {
  return [...movies()].sort((a, b) => b.year - a.year).slice(0, 10);
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
  return movies().filter((m) => {
    const haystack = [
      m.title,
      m.originalTitle,
      m.director,
      m.description,
      m.genres.join(" "),
      m.cast.join(" "),
      String(m.year),
      String(m.kinopoiskId),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getMoviesByGenre(genre: string): Movie[] {
  if (!genre || genre === "Все") return movies();
  return movies().filter((m) => m.genres.includes(genre));
}

export function getAllGenres(): Genre[] {
  const counts = new Map<string, number>();
  for (const m of movies()) {
    for (const g of m.genres) {
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  return [{ name: "Все", count: movies().length }, ...Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)];
}

export function getSimilarMovies(id: string, limit = 6): Movie[] {
  const current = getMovieById(id);
  if (!current) return [];
  return movies()
    .filter((m) => m.id !== id)
    .map((m) => ({
      m,
      score: m.genres.filter((g) => current.genres.includes(g)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}
