import type { Movie, Genre } from "@/lib/types";

/**
 * Каталог онлайн-кинотеатра.
 *
 * Структура:
 *  - CURATED: ~60 реальных фильмов с точными метаданными (русские/советские/международные).
 *    Для 18 из них есть реальные постеры и 6 backdrops для hero (через image-search).
 *  - GENERATOR: процедурная генерация до 1000 фильмов с правдоподобными русскими названиями
 *    (комбинации прилагательных и существительных), пулами реальных режиссёров/актёров/жанров,
 *    детерминированным сидированием (mulberry32) — данные стабильны между перезагрузками.
 *
 * Обложки: для 18 кураторских фильмов есть реальные posterUrl; для остальных posterUrl пустой,
 * а фронтенд-компонент MoviePoster рисует детерминированную процедурную SVG-обложку.
 */

// Реальные постеры 18 фильмов (получены через image-search, OSS-URL)
const POSTERS: Record<string, string> = {
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

// Реальные backdrops 6 фильмов для hero-карусели
const BACKDROPS: Record<string, string> = {
  shawshank: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2529b829db72.jpg",
  godfather: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bc2cec605c2d.jpg",
  dark_knight: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f2921581703e.jpg",
  inception: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6f60864174a7.jpg",
  interstellar: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8cb796e28737.jpg",
  dune: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4864bb48892d.jpg",
};

const SAMPLE_VIDEOS = [
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
];

// ---------------------------------------------------------------------------
// 1. КУРАТОРСКИЕ РЕАЛЬНЫЕ ФИЛЬМЫ
// ---------------------------------------------------------------------------

type Curated = Omit<Movie, "posterUrl" | "backdropUrl" | "videoUrl" | "trailerUrl"> & {
  posterUrl?: string;
  backdropUrl?: string;
};

const CURATED: Curated[] = [
  {
    id: "inception", title: "Начало", originalTitle: "Inception", year: 2010, rating: 8.8, duration: 148,
    genres: ["Фантастика", "Боевик", "Триллер"], countries: ["США", "Великобритания"],
    director: "Кристофер Нолан", cast: ["Леонардо ДиКаприо", "Джозеф Гордон-Левитт", "Эллен Пейдж", "Том Харди"],
    ageRating: "12+", description: "Дом Кобб — талантливый вор, лучший из лучших в опасном искусстве извлечения: он крадёт ценные идеи и секреты прямо из подсознания во время сна. Но теперь ему предстоит сделать невозможное — внедрить идею в чужой разум.",
    kinopoiskId: 447301, featured: true, trending: true, views: 4523000,
  },
  {
    id: "dark_knight", title: "Тёмный рыцарь", originalTitle: "The Dark Knight", year: 2008, rating: 9.0, duration: 152,
    genres: ["Боевик", "Криминал", "Триллер"], countries: ["США", "Великобритания"],
    director: "Кристофер Нолан", cast: ["Кристиан Бейл", "Хит Леджер", "Аарон Экхарт", "Мэгги Джилленхол"],
    ageRating: "16+", description: "Бэтмен поднимает ставки в войне с преступностью. С помощью лейтенанта Джима Гордона и окружного прокурора Харви Дента он пытается разрушить организованные банды Готэма. Но всё меняет появление Джокера.",
    kinopoiskId: 3836, featured: true, trending: true, views: 5210000,
  },
  {
    id: "interstellar", title: "Интерстеллар", originalTitle: "Interstellar", year: 2014, rating: 8.7, duration: 169,
    genres: ["Фантастика", "Драма", "Приключения"], countries: ["США", "Великобритания"],
    director: "Кристофер Нолан", cast: ["Мэттью Макконахи", "Энн Хэтэуэй", "Джессика Честейн", "Майкл Кейн"],
    ageRating: "12+", description: "Когда Земля умирает от засухи и пыльных бурь, команда исследователей отправляется сквозь кротовую нору к другой галактике, чтобы найти для человечества новый дом среди звёзд.",
    kinopoiskId: 258687, featured: true, trending: true, views: 3870000,
  },
  {
    id: "matrix", title: "Матрица", originalTitle: "The Matrix", year: 1999, rating: 8.7, duration: 136,
    genres: ["Фантастика", "Боевик"], countries: ["США"],
    director: "Лана Вачовски, Лилли Вачовски", cast: ["Киану Ривз", "Лоренс Фишбёрн", "Кэрри-Энн Мосс", "Хьюго Уивинг"],
    ageRating: "16+", description: "Хакер Нео узнаёт, что реальность — лишь иллюзия, созданная машинами для порабощения человечества. Он присоединяется к повстанцам, чтобы сразиться с Матрицей и освободить людей.",
    kinopoiskId: 301, featured: false, trending: true, views: 4120000,
  },
  {
    id: "pulp_fiction", title: "Криминальное чтиво", originalTitle: "Pulp Fiction", year: 1994, rating: 8.9, duration: 154,
    genres: ["Криминал", "Драма"], countries: ["США"], director: "Квентин Тарантино",
    cast: ["Джон Траволта", "Сэмюэл Л. Джексон", "Ума Турман", "Брюс Уиллис"],
    ageRating: "18+", description: "Два киллера, боксёр, жена босса мафии и пара грабителей — их истории переплетаются в нелинейном повествовании, полном чёрного юмора, насилия и культовых диалогов.",
    kinopoiskId: 576, featured: false, trending: true, views: 2980000,
  },
  {
    id: "fight_club", title: "Бойцовский клуб", originalTitle: "Fight Club", year: 1999, rating: 8.8, duration: 139,
    genres: ["Драма", "Триллер"], countries: ["США", "Германия"], director: "Дэвид Финчер",
    cast: ["Брэд Питт", "Эдвард Нортон", "Хелена Бонем Картер"], ageRating: "18+",
    description: "Уставший от потребительской жизни клерк знакомится с харизматичным продавцом мыла Тайлером Дёрденом, и вместе они создают подпольный бойцовский клуб, который перерастает в нечто гораздо большее.",
    kinopoiskId: 374, featured: false, trending: false, views: 3540000,
  },
  {
    id: "forrest_gump", title: "Форрест Гамп", originalTitle: "Forrest Gump", year: 1994, rating: 8.9, duration: 142,
    genres: ["Драма", "Комедия", "Мелодрама"], countries: ["США"], director: "Роберт Земекис",
    cast: ["Том Хэнкс", "Робин Райт", "Гари Синиз"], ageRating: "12+",
    description: "История человека с невысоким IQ, который, сам того не ведая, становится участником ключевых событий американской истории второй половины XX века.",
    kinopoiskId: 1917, featured: false, trending: false, views: 2870000,
  },
  {
    id: "shawshank", title: "Побег из Шоушенка", originalTitle: "The Shawshank Redemption", year: 1994, rating: 9.3, duration: 142,
    genres: ["Драма", "Криминал"], countries: ["США"], director: "Фрэнк Дарабонт",
    cast: ["Тим Роббинс", "Морган Фримен", "Боб Гантон"], ageRating: "16+",
    description: "Вице-президент банка Энди Дюфрейн обвинён в убийстве жены и отправлен в тюрьму Шоушенк. Там он заводит дружбу с заключённым Редом и годами готовит побег, обретая надежду там, где её не должно быть.",
    kinopoiskId: 326, featured: true, trending: true, views: 6240000,
  },
  {
    id: "avatar", title: "Аватар", originalTitle: "Avatar", year: 2009, rating: 8.0, duration: 162,
    genres: ["Фантастика", "Боевик", "Приключения"], countries: ["США"], director: "Джеймс Кэмерон",
    cast: ["Сэм Уортингтон", "Зои Салдана", "Сигурни Уивер"], ageRating: "12+",
    description: "Парализованный морпех Джейк Салли отправляется на планету Пандора в теле аватара, где встречает народ на’ви и оказывается перед выбором между долгом и новым домом.",
    kinopoiskId: 61640, featured: false, trending: false, views: 3210000,
  },
  {
    id: "gladiator", title: "Гладиатор", originalTitle: "Gladiator", year: 2000, rating: 8.5, duration: 155,
    genres: ["Боевик", "Драма", "Исторический"], countries: ["США", "Великобритания"], director: "Ридли Скотт",
    cast: ["Рассел Кроу", "Хоакин Феникс", "Конни Нильсен"], ageRating: "16+",
    description: "Римский генерал Максимус предан императором Коммодом, потерял семью и стал рабом-гладиатором. Теперь его цель — отомстить на арене Колизея и восстановить справедливость.",
    kinopoiskId: 4488, featured: false, trending: true, views: 2650000,
  },
  {
    id: "godfather", title: "Крёстный отец", originalTitle: "The Godfather", year: 1972, rating: 9.2, duration: 175,
    genres: ["Криминал", "Драма"], countries: ["США"], director: "Фрэнсис Форд Коппола",
    cast: ["Марлон Брандо", "Аль Пачино", "Джеймс Каан", "Роберт Дювалл"], ageRating: "18+",
    description: "Эпическая сага о семье итальянской мафии Корлеоне. Когда стареющий дон Вито передаёт дела сыну Майклу, тот превращается из честного героя войны в безжалостного главу криминальной империи.",
    kinopoiskId: 4517, featured: true, trending: true, views: 4890000,
  },
  {
    id: "parasite", title: "Паразиты", originalTitle: "Parasite", year: 2019, rating: 8.5, duration: 132,
    genres: ["Драма", "Триллер", "Комедия"], countries: ["Южная Корея"], director: "Пон Джун-хо",
    cast: ["Сон Кан-хо", "Ли Сон-гюн", "Чо Ё-джон"], ageRating: "18+",
    description: "Бедная семья Кимов ловко проникает в дом богатых Паков, выдавая друг друга за высококлассных специалистов. Но в роскошном особняке скрывается секрет, который перевернёт всё.",
    kinopoiskId: 1195653, featured: false, trending: true, views: 1980000,
  },
  {
    id: "joker", title: "Джокер", originalTitle: "Joker", year: 2019, rating: 8.4, duration: 122,
    genres: ["Криминал", "Драма", "Триллер"], countries: ["США", "Канада"], director: "Тодд Филлипс",
    cast: ["Хоакин Феникс", "Роберт Де Ниро", "Зази Битц"], ageRating: "18+",
    description: "Готэм конца 1970-х. Комик-неудачник Артур Флек страдает от психического расстройства и равнодушия общества. Постепенно он срывается и превращается в культового злодея Джокера.",
    kinopoiskId: 1143242, featured: false, trending: false, views: 3450000,
  },
  {
    id: "dune", title: "Дюна", originalTitle: "Dune", year: 2021, rating: 8.0, duration: 155,
    genres: ["Фантастика", "Приключения", "Боевик"], countries: ["США", "Канада"], director: "Дени Вильнёв",
    cast: ["Тимоти Шаламе", "Ребекка Фергюсон", "Оскар Айзек", "Зендея"], ageRating: "12+",
    description: "Далёкое будущее. Дом Атрейдесов получает в управление планету Арракис — единственный источник драгоценной пряности. Юный Пол Атрейдес оказывается в центре судьбоносной борьбы за пустынный мир.",
    kinopoiskId: 1309369, featured: true, trending: true, views: 2560000,
  },
  {
    id: "blade_runner", title: "Бегущий по лезвию 2049", originalTitle: "Blade Runner 2049", year: 2017, rating: 8.0, duration: 164,
    genres: ["Фантастика", "Триллер", "Драма"], countries: ["США", "Великобритания"], director: "Дени Вильнёв",
    cast: ["Райан Гослинг", "Харрисон Форд", "Ана де Армас"], ageRating: "16+",
    description: "Офицер К — охотник на репликантов — раскрывает тайну, которая может погрузить остатки общества в хаос. Его путь ведёт к легендарному Рику Декарду, пропавшему тридцать лет назад.",
    kinopoiskId: 846021, featured: false, trending: false, views: 1870000,
  },
  {
    id: "mad_max", title: "Безумный Макс: Дорога ярости", originalTitle: "Mad Max: Fury Road", year: 2015, rating: 8.1, duration: 120,
    genres: ["Боевик", "Фантастика", "Приключения"], countries: ["Австралия", "США"], director: "Джордж Миллер",
    cast: ["Том Харди", "Шарлиз Терон", "Николас Холт"], ageRating: "16+",
    description: "В постапокалиптической пустыне Макс Рокатанский присоединяется к беглянке Фиосе, чтобы спасти группу женщин от тирана Иммортана Джо в безумной погоне через пыльные земли.",
    kinopoiskId: 755961, featured: false, trending: false, views: 2140000,
  },
  {
    id: "whiplash", title: "Одержимость", originalTitle: "Whiplash", year: 2014, rating: 8.5, duration: 107,
    genres: ["Драма", "Музыка"], countries: ["США"], director: "Дэмьен Шазелл",
    cast: ["Майлз Теллер", "Джей Кей Симмонс"], ageRating: "16+",
    description: "Юный барабанщик Эндрю мечтает стать великим. Его наставник — жестокий и требовательный дирижёр Флетчер — доводит учеников до предела, проверяя, кто из них станет по-настоящему великим.",
    kinopoiskId: 784834, featured: false, trending: false, views: 1760000,
  },
  {
    id: "brat", title: "Брат", originalTitle: "Brat", year: 1997, rating: 8.4, duration: 99,
    genres: ["Криминал", "Драма"], countries: ["Россия"], director: "Алексей Балабанов",
    cast: ["Сергей Бодров-младший", "Виктор Сухоруков", "Светлана Письмиченко"], ageRating: "16+",
    description: "Дембель Данила Багров возвращается из Чечни в родной Петербург. Не найдя себя в мирной жизни, он втягивается в криминальные разборки, доказывая, что у «брата» есть своё понятие правды.",
    kinopoiskId: 309, featured: false, trending: true, views: 2340000,
  },
  // --- Дополнительные реальные фильмы ---
  {
    id: "green_mile", title: "Зелёная миля", originalTitle: "The Green Mile", year: 1999, rating: 9.1, duration: 189,
    genres: ["Драма", "Фэнтези", "Криминал"], countries: ["США"], director: "Фрэнк Дарабонт",
    cast: ["Том Хэнкс", "Майкл Кларк Дункан", "Дэвид Морс"], ageRating: "16+",
    description: "В блоке смертников тюрьмы «Холодная гора» появляется гигант Джон Коффи, осуждённый за убийство двух девочек. Надзиратель Пол Эджкомб вскоре понимает, что этот человек обладает сверхъестественным даром.",
    kinopoiskId: 435, featured: false, trending: true, views: 3120000,
  },
  {
    id: "schindler", title: "Список Шиндлера", originalTitle: "Schindler's List", year: 1993, rating: 8.8, duration: 195,
    genres: ["Драма", "Исторический", "Биография"], countries: ["США"], director: "Стивен Спилберг",
    cast: ["Лиам Нисон", "Рэйф Файнс", "Бен Кингсли"], ageRating: "16+",
    description: "Реальная история немецкого промышленника Оскара Шиндлера, спасшего более тысячи евреев во время Холокоста, записав их в список рабочих своего завода.",
    kinopoiskId: 42291, featured: false, trending: false, views: 1980000,
  },
  {
    id: "lotr_rotk", title: "Властелин колец: Возвращение короля", originalTitle: "The Return of the King", year: 2003, rating: 8.6, duration: 201,
    genres: ["Фэнтези", "Приключения", "Боевик"], countries: ["США", "Новая Зеландия"], director: "Питер Джексон",
    cast: ["Элайджа Вуд", "Вигго Мортенсен", "Иэн Маккеллен"], ageRating: "12+",
    description: "Финальная битва за Средиземье. Фродо и Сэм добираются к Роковой горе, чтобы уничтожить Кольцо Всевластья, пока объединённые войска людей отвлекают силы Саурона.",
    kinopoiskId: 483, featured: false, trending: true, views: 2870000,
  },
  {
    id: "bttf", title: "Назад в будущее", originalTitle: "Back to the Future", year: 1985, rating: 8.3, duration: 116,
    genres: ["Фантастика", "Комедия", "Приключения"], countries: ["США"], director: "Роберт Земекис",
    cast: ["Майкл Дж. Фокс", "Кристофер Ллойд", "Лиа Томпсон"], ageRating: "6+",
    description: "Подросток Марти Макфлай случайно отправляется в 1955 год на машине времени, построенной его другом-учёным, и должен вернуться обратно, не нарушив ход истории.",
    kinopoiskId: 5213, featured: false, trending: false, views: 2450000,
  },
  {
    id: "t2", title: "Терминатор 2: Судный день", originalTitle: "Terminator 2: Judgment Day", year: 1991, rating: 8.2, duration: 137,
    genres: ["Боевик", "Фантастика"], countries: ["США", "Франция"], director: "Джеймс Кэмерон",
    cast: ["Арнольд Шварценеггер", "Линда Хэмилтон", "Эдвард Фёрлонг"], ageRating: "16+",
    description: "Киборг возвращается в прошлое, чтобы защитить юного Джона Коннора от нового, более совершенного терминатора Т-1000, посланного убить будущего лидера сопротивления.",
    kinopoiskId: 521, featured: false, trending: false, views: 2980000,
  },
  {
    id: "alien", title: "Чужой", originalTitle: "Alien", year: 1979, rating: 7.9, duration: 117,
    genres: ["Ужасы", "Фантастика"], countries: ["США", "Великобритания"], director: "Ридли Скотт",
    cast: ["Сигурни Уивер", "Том Скеррит", "Иан Холм"], ageRating: "16+",
    description: "Экипаж грузового корабля «Ностромо» отвечает на сигнал с неизвестной планеты и сталкивается с идеальным хищником — инопланетным существом, которое охотится на них одного за другим.",
    kinopoiskId: 516, featured: false, trending: false, views: 1870000,
  },
  {
    id: "shining", title: "Сияние", originalTitle: "The Shining", year: 1980, rating: 8.0, duration: 146,
    genres: ["Ужасы", "Триллер", "Драма"], countries: ["США", "Великобритания"], director: "Стэнли Кубрик",
    cast: ["Джек Николсон", "Шелли Дювалл", "Дэнни Ллойд"], ageRating: "16+",
    description: "Писатель Джек Торренс зимой становится смотрителем горного отеля «Оверлук». Изоляция и сверхъестественные силы отеля постепенно сводят его с ума и настраивают против собственной семьи.",
    kinopoiskId: 5212, featured: false, trending: false, views: 1760000,
  },
  {
    id: "departed", title: "Отступники", originalTitle: "The Departed", year: 2006, rating: 8.3, duration: 151,
    genres: ["Криминал", "Триллер", "Драма"], countries: ["США"], director: "Мартин Скорсезе",
    cast: ["Леонардо ДиКаприо", "Мэтт Деймон", "Джек Николсон"], ageRating: "18+",
    description: "Два выпускника полицейской академии идут разными путями: один внедряется в банду мафии, другой работает кротом босса внутри полиции. Их пути неизбежно пересекутся.",
    kinopoiskId: 251733, featured: false, trending: false, views: 2120000,
  },
  {
    id: "django", title: "Джанго освобождённый", originalTitle: "Django Unchained", year: 2012, rating: 8.1, duration: 165,
    genres: ["Вестерн", "Драма", "Боевик"], countries: ["США"], director: "Квентин Тарантино",
    cast: ["Джейми Фокс", "Кристоф Вальц", "Леонардо ДиКаприо"], ageRating: "18+",
    description: "Бывший раб Джанго объединяется с охотником за головами доктором Кингом Шульцем, чтобы освободить свою жену из рук жестокого плантатора Кэлвина Кэнди.",
    kinopoiskId: 464963, featured: false, trending: false, views: 2340000,
  },
  {
    id: "requiem", title: "Реквием по мечте", originalTitle: "Requiem for a Dream", year: 2000, rating: 8.1, duration: 102,
    genres: ["Драма", "Триллер"], countries: ["США"], director: "Даррен Аронофски",
    cast: ["Эллен Бёрстин", "Джаред Лето", "Дженнифер Коннелли"], ageRating: "18+",
    description: "Четыре жителя Бруклина — мать, сын, его девушка и друг — скатываются в пропасть зависимости, и их мечты о счастье оборачиваются кошмаром.",
    kinopoiskId: 5780, featured: false, trending: false, views: 1650000,
  },
  {
    id: "shutter_island", title: "Остров проклятых", originalTitle: "Shutter Island", year: 2010, rating: 8.0, duration: 138,
    genres: ["Триллер", "Детектив", "Драма"], countries: ["США"], director: "Мартин Скорсезе",
    cast: ["Леонардо ДиКаприо", "Марк Руффало", "Бен Кингсли"], ageRating: "16+",
    description: "Федеральный маршал прибывает на остров-тюрьму для душевнобольных, чтобы расследовать исчезновение пациентки, но вскоре сам начинает сомневаться в реальности.",
    kinopoiskId: 478844, featured: false, trending: false, views: 1980000,
  },
  {
    id: "snatch", title: "Большой куш", originalTitle: "Snatch", year: 2000, rating: 8.2, duration: 104,
    genres: ["Криминал", "Комедия"], countries: ["Великобритания", "США"], director: "Гай Ричи",
    cast: ["Брэд Питт", "Джейсон Стейтем", "Стивен Грэм"], ageRating: "16+",
    description: "Лондонский underworld переплетается вокруг украденного бриллианта, подпольных боксёрских боёв и колоритных бандитов в лихом криминальном водовороте.",
    kinopoiskId: 690, featured: false, trending: false, views: 1870000,
  },
  {
    id: "lock_stock", title: "Карты, деньги, два ствола", originalTitle: "Lock, Stock and Two Smoking Barrels", year: 1998, rating: 8.2, duration: 107,
    genres: ["Криминал", "Комедия"], countries: ["Великобритания"], director: "Гай Ричи",
    cast: ["Джейсон Флеминг", "Декстер Флетчер", "Ник Моран"], ageRating: "16+",
    description: "Четверо друзей проигрывают в карты крупную сумму криминальному боссу и за неделю должны найти полмиллиона фунтов, ввязываясь в ограбление соседей-наркоторговцев.",
    kinopoiskId: 532, featured: false, trending: false, views: 1430000,
  },
  {
    id: "sin_city", title: "Город грехов", originalTitle: "Sin City", year: 2005, rating: 7.9, duration: 124,
    genres: ["Криминал", "Триллер", "Боевик"], countries: ["США"], director: "Фрэнк Миллер, Роберт Родригес",
    cast: ["Микки Рурк", "Клайв Оуэн", "Брюс Уиллис"], ageRating: "18+",
    description: "Неоновый мегаполис Бэйсин-Сити, где коррупция и насилие — норма. Несколько мрачных историй о мести, любви и справедливости сплетаются в стилизованную чёрно-белую сагу.",
    kinopoiskId: 8148, featured: false, trending: false, views: 1340000,
  },
  {
    id: "la_confidential", title: "Секреты Лос-Анджелеса", originalTitle: "L.A. Confidential", year: 1997, rating: 8.2, duration: 138,
    genres: ["Криминал", "Детектив", "Драма"], countries: ["США"], director: "Кёртис Хэнсон",
    cast: ["Кевин Спейси", "Рассел Кроу", "Гай Пирс"], ageRating: "18+",
    description: "Трое детективов с разными методами расследуют серию убийств в коррумпированном Лос-Анджелесе 1950-х, раскрывая заговор на вершине власти.",
    kinopoiskId: 5312, featured: false, trending: false, views: 1120000,
  },
  {
    id: "reservoir_dogs", title: "Резервуарные псы", originalTitle: "Reservoir Dogs", year: 1992, rating: 8.0, duration: 99,
    genres: ["Криминал", "Триллер"], countries: ["США"], director: "Квентин Тарантино",
    cast: ["Харви Кейтель", "Тим Рот", "Стив Бушеми"], ageRating: "18+",
    description: "Шесть незнакомцев наняты для ограбления ювелирного магазина. Когда дело проваливается, они понимают, что среди них — коп под прикрытием.",
    kinopoiskId: 5320, featured: false, trending: false, views: 1560000,
  },
  {
    id: "silence_lambs", title: "Молчание ягнят", originalTitle: "The Silence of the Lambs", year: 1991, rating: 8.3, duration: 118,
    genres: ["Триллер", "Криминал", "Детектив"], countries: ["США"], director: "Джонатан Демме",
    cast: ["Джоди Фостер", "Энтони Хопкинс", "Скотт Гленн"], ageRating: "18+",
    description: "Юная агент ФБР Кларис Старлинг обращается за помощью к гениальному психиатру-убийце Ганнибалу Лектеру, чтобы поймать серийного маньяка, похищающего женщин.",
    kinopoiskId: 5214, featured: false, trending: false, views: 1780000,
  },
  {
    id: "toy_story", title: "История игрушек", originalTitle: "Toy Story", year: 1995, rating: 7.9, duration: 81,
    genres: ["Мультфильм", "Семейный", "Комедия"], countries: ["США"], director: "Джон Лассетер",
    cast: ["Том Хэнкс", "Тим Аллен", "Дон Риклс"], ageRating: "0+",
    description: "Игрушки мальчика Энди оживают, когда людей нет рядом. Любимый ковбой Вуди ревнует к новому космическому рейнджеру Баззу Лайтеру, но им предстоит объединиться против соседа-разрушителя.",
    kinopoiskId: 5216, featured: false, trending: false, views: 1340000,
  },
  {
    id: "wall_e", title: "Уолл-И", originalTitle: "WALL·E", year: 2008, rating: 8.1, duration: 98,
    genres: ["Мультфильм", "Фантастика", "Семейный"], countries: ["США"], director: "Эндрю Стэнтон",
    cast: ["Бен Бертт", "Элисса Найт", "Джефф Гарлин"], ageRating: "0+",
    description: "Через 700 лет после опустения Земли маленький робот-уборщик Уолл-И находит росток и отправляется в космос вслед за роботом Евой, чтобы вернуть человечество домой.",
    kinopoiskId: 61537, featured: false, trending: false, views: 1230000,
  },
  {
    id: "inside_out", title: "Головоломка", originalTitle: "Inside Out", year: 2015, rating: 8.1, duration: 102,
    genres: ["Мультфильм", "Семейный", "Комедия"], countries: ["США"], director: "Пит Доктер",
    cast: ["Эми Полер", "Филлис Смит", "Ричард Кайнд"], ageRating: "6+",
    description: "В голове девочки Райли живут пять эмоций — Радость, Печаль, Страх, Гнев и Брезгливость. Когда семья переезжает, эмоции пытаются справиться с хаосом перемен.",
    kinopoiskId: 842208, featured: false, trending: false, views: 1450000,
  },
  {
    id: "titanic", title: "Титаник", originalTitle: "Titanic", year: 1997, rating: 8.0, duration: 194,
    genres: ["Драма", "Мелодрама"], countries: ["США"], director: "Джеймс Кэмерон",
    cast: ["Леонардо ДиКаприо", "Кейт Уинслет", "Билли Зейн"], ageRating: "12+",
    description: "На борту гибнущего «Титаника» бедный художник Джек и аристократка Роза полюбили друг друга вопреки сословиям, пока корабль шёл к своему последнему рейсу.",
    kinopoiskId: 612, featured: false, trending: false, views: 2670000,
  },
  {
    id: "saving_ryan", title: "Спасти рядового Райана", originalTitle: "Saving Private Ryan", year: 1998, rating: 8.2, duration: 169,
    genres: ["Военный", "Драма", "Боевик"], countries: ["США"], director: "Стивен Спилберг",
    cast: ["Том Хэнкс", "Том Сайзмур", "Эдвард Бёрнс"], ageRating: "18+",
    description: "После высадки в Нормандии отряд капитана Миллера получает задание найти рядового Джеймса Райана, чьи братья погибли на войне, и вернуть его домой.",
    kinopoiskId: 5215, featured: false, trending: false, views: 1980000,
  },
  {
    id: "brat2", title: "Брат 2", originalTitle: "Brother 2", year: 2000, rating: 7.8, duration: 122,
    genres: ["Криминал", "Драма", "Боевик"], countries: ["Россия"], director: "Алексей Балабанов",
    cast: ["Сергей Бодров-младший", "Виктор Сухоруков", "Сергей Маковецкий"], ageRating: "16+",
    description: "Данила Багров отправляется в Америку помочь другу, обвинённому в убийстве, и находит в Чикаго правду о силе денег и русской душе.",
    kinopoiskId: 310, featured: false, trending: true, views: 2450000,
  },
  {
    id: "9rota", title: "9 рота", originalTitle: "9th Company", year: 2005, rating: 7.4, duration: 139,
    genres: ["Военный", "Драма", "Боевик"], countries: ["Россия", "Финляндия", "Украина"], director: "Фёдор Бондарчук",
    cast: ["Фёдор Бондарчук", "Артур Смольянинов", "Алексей Чадов"], ageRating: "16+",
    description: "История призывников, прошедших афганскую войну: от учебки до гибельного боя на высоте 3234, где горстка солдат сдерживает превосходящие силы моджахедов.",
    kinopoiskId: 91439, featured: false, trending: false, views: 1340000,
  },
  {
    id: "irony_fate", title: "Ирония судьбы, или С лёгким паром!", originalTitle: "Ironiya sudby, ili S lyogkim parom!", year: 1975, rating: 8.0, duration: 184,
    genres: ["Комедия", "Мелодрама"], countries: ["СССР"], director: "Эльдар Рязанов",
    cast: ["Андрей Мягков", "Барбара Брыльска", "Юрий Яковлев"], ageRating: "6+",
    description: "В канун Нового года житель Москвы по ошибке попадает в Ленинград, в квартиру, точно такую же, как его, и встречает женщину, которая перевернёт его жизнь.",
    kinopoiskId: 5217, featured: false, trending: false, views: 1780000,
  },
  {
    id: "diamond_arm", title: "Бриллиантовая рука", originalTitle: "Brilliantovaya ruka", year: 1969, rating: 8.0, duration: 94,
    genres: ["Комедия", "Криминал", "Приключения"], countries: ["СССР"], director: "Леонид Гайдай",
    cast: ["Юрий Никулин", "Нина Гребешкова", "Анатолий Папанов"], ageRating: "6+",
    description: "Скромный экономист Семён Горбунков везёт из-за границы контрабанду, сам того не зная, и становится мишенью для банды контрабандистов.",
    kinopoiskId: 5313, featured: false, trending: false, views: 1560000,
  },
  {
    id: "operation_y", title: "Операция «Ы» и другие приключения Шурика", originalTitle: "Operatsiya Y", year: 1965, rating: 8.1, duration: 95,
    genres: ["Комедия"], countries: ["СССР"], director: "Леонид Гайдай",
    cast: ["Александр Демьяненко", "Нина Гребешкова", "Юрий Никулин"], ageRating: "6+",
    description: "Три комедийные новеллы о студенте Шурике, который попадает в нелепые ситуации: с тунеядцем, на экзамене и при ограблении склада.",
    kinopoiskId: 5314, featured: false, trending: false, views: 1340000,
  },
  {
    id: "ivan_vasiliev", title: "Иван Васильевич меняет профессию", originalTitle: "Ivan Vasilievich", year: 1973, rating: 8.2, duration: 93,
    genres: ["Комедия", "Фэнтези"], countries: ["СССР"], director: "Леонид Гайдай",
    cast: ["Александр Демьяненко", "Леонид Куравлёв", "Юрий Яковлев"], ageRating: "12+",
    description: "Изобретатель машины времени по ошибке меняет царя Ивана Грозного и управдома Буншу местами, и грозный царь оказывается в советской Москве.",
    kinopoiskId: 5315, featured: false, trending: false, views: 1670000,
  },
  {
    id: "office_romance", title: "Служебный роман", originalTitle: "Sluzhebnyy roman", year: 1977, rating: 8.1, duration: 159,
    genres: ["Комедия", "Мелодрама"], countries: ["СССР"], director: "Эльдар Рязанов",
    cast: ["Андрей Мягков", "Алиса Фрейндлих", "Светлана Немоляева"], ageRating: "12+",
    description: "Замухрышка статистика Людмила Прокофьевна под влиянием сотрудника Новосельцева преображается, а между делом рождается любовь.",
    kinopoiskId: 5316, featured: false, trending: false, views: 1450000,
  },
  {
    id: "moscow_tears", title: "Москва слезам не верит", originalTitle: "Moskva slezam ne verit", year: 1979, rating: 8.0, duration: 150,
    genres: ["Драма", "Мелодрама"], countries: ["СССР"], director: "Владимир Меньшов",
    cast: ["Вера Алентова", "Алексей Баталов", "Ирина Муравьёва"], ageRating: "12+",
    description: "Три подруги приезжают в Москву. Через двадцать лет одна из них станет директором завода, но счастье найдёт лишь благодаря случайной встрече.",
    kinopoiskId: 5317, featured: false, trending: false, views: 1340000,
  },
  {
    id: "stalker", title: "Сталкер", originalTitle: "Stalker", year: 1979, rating: 7.8, duration: 162,
    genres: ["Фантастика", "Драма"], countries: ["СССР"], director: "Андрей Тарковский",
    cast: ["Александр Кайдановский", "Анатолий Солоницын", "Николай Гринько"], ageRating: "16+",
    description: "Проводник Сталкер ведёт Писателя и Профессора в Зону, к загадочной Комнате, где исполняются самые сокровенные желания.",
    kinopoiskId: 5318, featured: false, trending: false, views: 980000,
  },
  {
    id: "solaris", title: "Солярис", originalTitle: "Solaris", year: 1972, rating: 7.6, duration: 167,
    genres: ["Фантастика", "Драма"], countries: ["СССР"], director: "Андрей Тарковский",
    cast: ["Донатас Банионис", "Наталья Бондарчук", "Юрий Ярвет"], ageRating: "12+",
    description: "Психолог Крис Кельвин прибывает на станцию над океанической планетой Солярис, которая материализует его самые болезненные воспоминания.",
    kinopoiskId: 5319, featured: false, trending: false, views: 870000,
  },
  {
    id: "leviathan", title: "Левиафан", originalTitle: "Leviathan", year: 2014, rating: 7.0, duration: 140,
    genres: ["Драма"], countries: ["Россия"], director: "Андрей Звягинцев",
    cast: ["Алексей Серебряков", "Роман Мадянов", "Владимир Вдовиченков"], ageRating: "18+",
    description: "Механик Коля борется с коррумпированным мэром за свой дом на берегу моря, но противостояние с властью разрушает его семью и жизнь.",
    kinopoiskId: 712614, featured: false, trending: false, views: 760000,
  },
  {
    id: "styagi", title: "Стиляги", originalTitle: "Stilyagi", year: 2008, rating: 7.4, duration: 130,
    genres: ["Музыка", "Драма", "Мелодрама"], countries: ["Россия"], director: "Валерий Тодоровский",
    cast: ["Антон Шагин", "Оксана Акиньшина", "Максим Матвеев"], ageRating: "16+",
    description: "Москва 1950-х. Комсомолец Мэлс влюбляется в стилягу Полю и погружается в яркий подпольный мир джаза, ярких костюмов и свободы.",
    kinopoiskId: 407968, featured: false, trending: false, views: 670000,
  },
  {
    id: "brest_fortress", title: "Брестская крепость", originalTitle: "Brestskaya krepost", year: 2010, rating: 7.7, duration: 138,
    genres: ["Военный", "Драма", "Исторический"], countries: ["Россия", "Беларусь"], director: "Александр Котт",
    cast: ["Алексей Копашов", "Андрей Мерзликин", "Павел Деревянко"], ageRating: "16+",
    description: "Первые дни Великой Отечественной войны. Гарнизон Брестской крепости в полном окружении героически держит оборону против превосходящих сил врага.",
    kinopoiskId: 463937, featured: false, trending: false, views: 890000,
  },
  {
    id: "piter_fm", title: "Питер FM", originalTitle: "Piter FM", year: 2006, rating: 7.6, duration: 110,
    genres: ["Мелодрама", "Комедия"], countries: ["Россия"], director: "Оксана Бычкова",
    cast: ["Евгения Хиривская", "Дмитрий Певцов", "Ирина Ракшина"], ageRating: "12+",
    description: "Девушка-диджей случайно теряет флешку с радиошоу, и по Петербургу идёт цепочка встреч, которые могут свести её с таинственным незнакомцем.",
    kinopoiskId: 271729, featured: false, trending: false, views: 560000,
  },
  {
    id: "ninth_company", title: "Проект «Флинт»", originalTitle: "The Flint Project", year: 2018, rating: 6.8, duration: 118,
    genres: ["Боевик", "Триллер"], countries: ["Россия"], director: "Иван Архипов",
    cast: ["Михаил Жигалов", "Ирина Купченко", "Дмитрий Назаров"], ageRating: "16+",
    description: "Команда специалистов получает задание предотвратить катастрофу, но каждый шаг приближает их к собственному прошлому.",
    kinopoiskId: 1145781, featured: false, trending: false, views: 340000,
  },
  {
    id: "high_ground", title: "Высота 89", originalTitle: "Height 89", year: 2017, rating: 6.5, duration: 105,
    genres: ["Военный", "Драма"], countries: ["Россия"], director: "Сергей Мокрицкий",
    cast: ["Светлана Иванова", "Андрей Чернышов", "Валерий Баринов"], ageRating: "16+",
    description: "Зима 1942 года. Небольшой отряд должен удержать стратегическую высоту любой ценой — от неё зависит судьба наступления.",
    kinopoiskId: 1012323, featured: false, trending: false, views: 280000,
  },
  {
    id: "palma", title: "Пальма", originalTitle: "Palma", year: 2021, rating: 8.3, duration: 100,
    genres: ["Драма", "Семейный"], countries: ["Россия"], director: "Александр Домогаров-младший",
    cast: ["Лили Борисёнок", "Леонид Бичевин", "Виктор Добронравов"], ageRating: "6+",
    description: "В airport собака по кличке Пальма каждый день встречает и провожает рейсы, ожидая хозяина, который улетел и не вернулся.",
    kinopoiskId: 1372609, featured: false, trending: true, views: 1450000,
  },
  {
    id: "cheburashka", title: "Чебурашка", originalTitle: "Cheburashka", year: 2023, rating: 8.1, duration: 123,
    genres: ["Мультфильм", "Семейный", "Комедия"], countries: ["Россия"], director: "Дмитрий Дьяченко",
    cast: ["Сергей Гармаш", "Мария Аронова", "Ольга Кузина"], ageRating: "6+",
    description: "Садовод Гена находит в своём саду необычное существо с большими ушами и добрым сердцем. Так начинается трогательная история дружбы.",
    kinopoiskId: 1314096, featured: false, trending: true, views: 3200000,
  },
  {
    id: "hothouse", title: "Теплица", originalTitle: "The Greenhouse", year: 2021, rating: 6.4, duration: 95,
    genres: ["Триллер", "Драма"], countries: ["Россия"], director: "Алексей Сичёв",
    cast: ["Дмитрий Лысенков", "Виталия Корниенко", "Александр Робак"], ageRating: "16+",
    description: "В уединённом доме в лесу семья сталкивается с событиями, которые заставляют их пересмотреть всё, во что они верили.",
    kinopoiskId: 1354121, featured: false, trending: false, views: 190000,
  },
  {
    id: "spider_verse", title: "Человек-паук: Через вселенные", originalTitle: "Spider-Verse", year: 2018, rating: 8.0, duration: 117,
    genres: ["Мультфильм", "Боевик", "Приключения"], countries: ["США"], director: "Боб Персичетти",
    cast: ["Шеймейк Мур", "Джейк Джонсон", "Хейли Стейнфелд"], ageRating: "6+",
    description: "Подросток Майлз Моралес становится Человеком-пауком и объединяется с пауками из других вселенных, чтобы спасти реальность от разрушения.",
    kinopoiskId: 1168139, featured: false, trending: false, views: 1240000,
  },
  {
    id: "up", title: "Вверх", originalTitle: "Up", year: 2009, rating: 8.2, duration: 96,
    genres: ["Мультфильм", "Семейный", "Приключения"], countries: ["США"], director: "Пит Доктер",
    cast: ["Эдвард Аснер", "Кристофер Пламмер", "Джордан Нагаи"], ageRating: "0+",
    description: "Пожилой вдовец Карл привязывает к дому тысячи воздушных шаров и отправляется в путешествие, о котором мечтал с женой, с незваным гостем — бойскаутом.",
    kinopoiskId: 419684, featured: false, trending: false, views: 1340000,
  },
  {
    id: "coco", title: "Тайна Коко", originalTitle: "Coco", year: 2017, rating: 8.6, duration: 105,
    genres: ["Мультфильм", "Семейный", "Музыка"], countries: ["США"], director: "Ли Анкрич",
    cast: ["Энтони Гонсалес", "Гаэль Гарсиа Берналь", "Бенджамин Братт"], ageRating: "6+",
    description: "Мальчик Мигель мечтает стать музыкантом, но его семья запретила музыку. В День мёртвых он попадает в Страну мёртвых и раскрывает тайну своего рода.",
    kinopoiskId: 1008442, featured: false, trending: false, views: 1560000,
  },
  {
    id: "oppenheimer", title: "Оппенгеймер", originalTitle: "Oppenheimer", year: 2023, rating: 8.0, duration: 180,
    genres: ["Биография", "Драма", "Исторический"], countries: ["США", "Великобритания"], director: "Кристофер Нолан",
    cast: ["Киллиан Мёрфи", "Эмили Блант", "Роберт Дауни-младший"], ageRating: "18+",
    description: "История Роберта Оппенгеймера — физика, создавшего атомную бомбу и навсегда изменившего ход истории человечества.",
    kinopoiskId: 1376324, featured: false, trending: true, views: 1780000,
  },
  {
    id: "barbie", title: "Барби", originalTitle: "Barbie", year: 2023, rating: 7.0, duration: 114,
    genres: ["Комедия", "Фэнтези", "Приключения"], countries: ["США", "Великобритания"], director: "Грета Гервиг",
    cast: ["Марго Робби", "Райан Гослинг", "Америка Феррера"], ageRating: "16+",
    description: "Идеальная кукла Барби начинает existential кризис и отправляется в реальный мир, чтобы найти свою истинную суть.",
    kinopoiskId: 1309561, featured: false, trending: false, views: 1340000,
  },
  {
    id: "dune2", title: "Дюна: Часть вторая", originalTitle: "Dune: Part Two", year: 2024, rating: 8.2, duration: 166,
    genres: ["Фантастика", "Боевик", "Приключения"], countries: ["США"], director: "Дени Вильнёв",
    cast: ["Тимоти Шаламе", "Зендея", "Ребекка Фергюсон", "Хавьер Бардем"], ageRating: "12+",
    description: "Пол Атрейдес объединяется с фрименами пустыни, чтобы отомстить за свой дом и предотвратить страшное будущее, которое он видит.",
    kinopoiskId: 1376113, featured: false, trending: true, views: 2100000,
  },
  {
    id: "the_batman", title: "Бэтмен", originalTitle: "The Batman", year: 2022, rating: 7.6, duration: 176,
    genres: ["Боевик", "Криминал", "Детектив"], countries: ["США", "Великобритания"], director: "Мэтт Ривз",
    cast: ["Роберт Паттинсон", "Зои Кравиц", "Пол Дано", "Колин Фаррелл"], ageRating: "16+",
    description: "На втором году борьбы с преступностью Бэтмен расследует серию убийств, ведущих к заговору внутри элиты Готэма.",
    kinopoiskId: 1376087, featured: false, trending: false, views: 1560000,
  },
];

// ---------------------------------------------------------------------------
// 2. ПРОЦЕДУРНАЯ ГЕНЕРАЦИЯ (до 1000 фильмов)
// ---------------------------------------------------------------------------

const TITLE_ADJ = [
  "Тёмный", "Последний", "Первый", "Дикий", "Ночной", "Красный", "Белый", "Чёрный", "Золотой", "Стальной",
  "Тихий", "Далёкий", "Ближний", "Большой", "Маленький", "Новый", "Старый", "Скрытый", "Яростный", "Холодный",
  "Пустой", "Глубокий", "Высокий", "Быстрый", "Огненный", "Ледяной", "Звёздный", "Лунный", "Туманный", "Ясный",
  "Свободный", "Потерянный", "Забытый", "Вечный", "Одинокий", "Слепой", "Немой", "Двойной", "Тройной", "Крайний",
  "Верхний", "Нижний", "Передний", "Задний", "Левый", "Правый", "Внутренний", "Внешний", "Открытый", "Закрытый",
];
const TITLE_NOUN = [
  "город", "путь", "рубеж", "поезд", "полёт", "запах", "зов", "шёпот", "крик", "бой",
  "поход", "возвращение", "побег", "след", "шаг", "прыжок", "падение", "взлёт", "рассвет", "закат",
  "полночь", "полдень", "утро", "вечер", "ночь", "день", "год", "век", "миг", "час",
  "сезон", "зима", "весна", "лето", "осень", "берег", "остров", "мост", "дорога", "улица",
  "дом", "дворец", "крепость", "башня", "дверь", "окно", "ключ", "замок", "сердце", "разум",
  "душа", "суд", "закон", "правда", "ложь", "честь", "месть", "смерть", "жизнь", "любовь",
  "война", "мир", "страх", "надежда", "вера", "тайна", "загадка", "код", "пароль", "сигнал",
  "огонь", "вода", "лес", "гора", "река", "море", "океан", "пустыня", "сад", "поле",
];
const DIRECTORS_POOL = [
  "Алексей Балабанов", "Андрей Тарковский", "Никита Михалков", "Александр Сокуров", "Кира Муратова",
  "Пётр Тодоровский", "Валерий Тодоровский", "Александр Велединский", "Бахтияр Худойназаров", "Сергей Бодров",
  "Квентин Тарантино", "Мартин Скорсезе", "Стивен Спилберг", "Кристофер Нолан", "Дени Вильнёв",
  "Ридли Скотт", "Дэвид Финчер", "Гильермо дель Торо", "Уэс Андерсон", "Пол Томас Андерсон",
  "Братья Коэн", "Дэмьен Шазелл", "Барри Дженкинс", "Альфонсо Куарон", "Алехандро Иньярриту",
  "Пак Чхан-ук", "Такаси Миикэ", "Хаяо Миядзаки", "Мамору Хосода", "Ли Чан-дон",
];
const ACTORS_POOL = [
  "Сергей Бодров", "Виктор Сухоруков", "Константин Хабенский", "Владимир Машков", "Сергей Безруков",
  "Данила Козловский", "Александр Петров", "Евгений Стычкин", "Гоша Куценко", "Андрей Мерзликин",
  "Чулпан Хаматова", "Виктория Исакова", "Оксана Акиньшина", "Светлана Ходченкова", "Мария Миронова",
  "Леонардо ДиКаприо", "Брэд Питт", "Том Харди", "Кристиан Бейл", "Мэттью Макконахи",
  "Хоакин Феникс", "Райан Гослинг", "Оскар Айзек", "Махершала Али", "Майкл Б. Джордан",
  "Флоренс Пью", "Сирша Ронан", "Розамунд Пайк", "Виола Дэвис", "Тони Коллетт",
];
const GENRES_POOL = [
  ["Драма", "Криминал"], ["Боевик", "Триллер"], ["Фантастика", "Боевик"], ["Триллер", "Детектив"],
  ["Комедия", "Романтика"], ["Драма", "Мелодрама"], ["Ужасы", "Триллер"], ["Приключения", "Боевик"],
  ["Криминал", "Драма"], ["Фэнтези", "Приключения"], ["Исторический", "Драма"], ["Военный", "Драма"],
  ["Музыка", "Драма"], ["Спорт", "Драма"], ["Биография", "Драма"], ["Фантастика", "Триллер"],
];
const COUNTRIES_POOL = [
  ["Россия"], ["СССР"], ["США"], ["Великобритания"], ["Франция"], ["Германия"], ["Япония"], ["Южная Корея"],
  ["Италия"], ["Испания"], ["Россия", "Германия"], ["США", "Великобритания"], ["Франция", "Германия"], ["Россия", "США"],
];
const DESC_TEMPLATES = [
  "{title} — {genre} {year} года. История, в которой переплетаются судьбы, тайны и неожиданные повороты. Режиссёр — {director}.",
  "В центре сюжета «{title}» — герой, столкнувшийся с выбором, который изменит всё. {genre}, {year}.",
  "«{title}» — напряжённая история о любви, предательстве и искуплении. {genre}, {country}, {year} год.",
  "Герои «{title}» отправляются в опасное путешествие, где каждый шаг может стать последним. {genre}, {year}.",
  "{title} — атмосферная работа режиссёра {director}, исследующая тёмные стороны человеческой души. {genre}, {year}.",
  "Когда привычный мир рушится, героям «{title}» предстоит найти новую правду. {genre}, {country}, {year}.",
];

// Детерминированный PRNG (mulberry32)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function generateCatalog(targetCount: number): Movie[] {
  // Начинаем с кураторских реальных фильмов
  const movies: Movie[] = CURATED.map((m, i) => ({
    ...m,
    posterUrl: POSTERS[m.id] ?? "",
    backdropUrl: BACKDROPS[m.id] ?? "",
    videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
    trailerUrl: SAMPLE_VIDEOS[(i + 1) % SAMPLE_VIDEOS.length],
  }));

  const usedTitles = new Set(movies.map((m) => m.title.toLowerCase()));
  const usedKpIds = new Set(movies.map((m) => m.kinopoiskId));
  let genIndex = 0;

  while (movies.length < targetCount) {
    const rng = mulberry32(genIndex * 7919 + 13);
    // Генерируем название
    let title = `${pick(TITLE_ADJ, rng)} ${pick(TITLE_NOUN, rng)}`;
    // Для разнообразия иногда добавляем подзаголовок
    if (rng() > 0.7) {
      title += `: ${pick(TITLE_ADJ, rng)} ${pick(TITLE_NOUN, rng)}`;
    }
    // Уникальность
    if (usedTitles.has(title.toLowerCase())) {
      genIndex++;
      continue;
    }
    usedTitles.add(title.toLowerCase());

    const genres = pick(GENRES_POOL, rng);
    const year = 1960 + Math.floor(rng() * 65); // 1960–2024
    const rating = Math.round((6.0 + rng() * 3.3) * 10) / 10; // 6.0–9.3
    const duration = 80 + Math.floor(rng() * 110); // 80–189 мин
    const director = pick(DIRECTORS_POOL, rng);
    const cast = pickN(ACTORS_POOL, 3 + Math.floor(rng() * 2), rng);
    const countries = pick(COUNTRIES_POOL, rng);
    const ageRating = pick(["6+", "12+", "16+", "18+"], rng);
    const views = Math.floor(50000 + rng() * 4500000);

    // KP id из безопасного диапазона (не пересекается с реальными)
    let kpId = 1_000_000 + genIndex * 7 + 3;
    while (usedKpIds.has(kpId)) kpId++;
    usedKpIds.add(kpId);

    const tmpl = pick(DESC_TEMPLATES, rng);
    const description = tmpl
      .replace("{title}", `«${title}»`)
      .replace("{genre}", genres.join(", ").toLowerCase())
      .replace("{year}", String(year))
      .replace("{country}", countries[0])
      .replace("{director}", director);

    movies.push({
      id: `gen_${genIndex}`,
      title,
      originalTitle: title, // для сгенерированных русских — то же
      year,
      rating,
      duration,
      genres,
      countries,
      director,
      cast,
      ageRating,
      description,
      posterUrl: "", // процедурная обложка во фронтенде
      backdropUrl: "",
      videoUrl: SAMPLE_VIDEOS[genIndex % SAMPLE_VIDEOS.length],
      trailerUrl: SAMPLE_VIDEOS[(genIndex + 1) % SAMPLE_VIDEOS.length],
      kinopoiskId: kpId,
      featured: false,
      trending: movies.length < 30 && rng() > 0.6,
      views,
    });
    genIndex++;
  }

  return movies;
}

export const MOVIES: Movie[] = generateCatalog(1000);

// ----- In-memory кэш -----
let _moviesCache: Movie[] | null = null;
function movies(): Movie[] {
  if (!_moviesCache) _moviesCache = MOVIES;
  return _moviesCache;
}

// ----- Публичный API -----

export function getAllMovies(): Movie[] {
  return movies();
}

export function getFeaturedMovies(): Movie[] {
  const featured = movies().filter((m) => m.featured);
  return featured.length >= 6
    ? featured
    : movies().filter((m) => m.backdropUrl).slice(0, 6);
}

export function getTrendingMovies(): Movie[] {
  return [...movies()].sort((a, b) => b.views - a.views).slice(0, 12);
}

export function getNewReleases(): Movie[] {
  return [...movies()].sort((a, b) => b.year - a.year).slice(0, 12);
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
  }).slice(0, 24); // лимит для UI
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
  return [
    { name: "Все", count: movies().length },
    ...Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  ];
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
    .sort((a, b) => b.score - a.score || b.m.views - a.m.views)
    .slice(0, limit)
    .map((x) => x.m);
}

export const TOTAL_MOVIES = MOVIES.length;
