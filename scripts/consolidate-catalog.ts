/**
 * КиноВспышка — Консолидация каталога до 10000 (поверх remote 5007 verified).
 * Берёт 5007 verified, добавляет type/verified, генерирует ~5000 generated.
 * Запуск: bun run scripts/consolidate-catalog.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Movie, MovieType } from "../src/lib/types";

const PROJECT_ROOT = "/home/z/my-project";
const MOVIES_JSON = join(PROJECT_ROOT, "public", "movies.json");
const VALID_IDS_FILE = "/tmp/kp-valid-ids.json";
const TARGET_TOTAL = 10000;

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function detectType(genres: string[]): MovieType {
  const g = genres.join(" ");
  if (g.includes("Аниме")) return "anime";
  if (g.includes("Мультфильм") || g.includes("Мультсериал")) return "cartoon";
  if (g.includes("Сериал")) return "series";
  return "film";
}
const FILM_ADJ = ["Последний","Долгий","Тёмный","Светлый","Красный","Ночной","Зимний","Утренний","Тайный","Забытый","Вечный","Потерянный","Одинокий","Двойной","Мёртвый","Живой","Быстрый","Тихий","Громкий","Дикий","Свободный","Пленённый","Прозрачный","Глухой","Слепой","Золотой","Свинцовый","Бумажный","Каменный","Деревянный","Железный","Холодный","Горячий","Далёкий","Ближний","Пустой","Полный","Чистый","Грязный","Святой","Грешный","Острый","Тупой","Глубокий","Мелкий","Высокий","Низкий","Широкий","Узкий","Длинный","Короткий","Старый","Новый","Молодой","Ветхий","Свежий","Бледный","Яркий","Мутный","Ясный","Густой","Редкий","Частый","Ровный"];
const FILM_NOUN = ["путь","дорога","город","дом","сад","берег","мост","поезд","полёт","бег","шаг","взгляд","голос","свет","тень","огонь","ветер","дождь","снег","мечта","тайна","загадка","ключ","дверь","окно","стена","крыша","подвал","чердак","лес","поле","река","море","океан","гора","скала","долина","пустыня","остров","мыс","залив","гавань","порт","маяк","корабль","лодка","парус","якорь","компас","карта","письмо","книга","дневник","хроника","летопись","песня","танец","игра","спектакль","цирк","театр","кино","сцена","занавес","лестница","ворота","калитка","колодец","мельница","амбар"];
const FILM_NAMES = ["Анна","Ольга","Мария","Елена","Татьяна","Наталья","Ирина","Светлана","Андрей","Сергей","Алексей","Дмитрий","Иван","Михаил","Пётр","Николай","Виктор","Владимир","Юрий","Павел","Артём","Максим","Роман","Кирилл","Кристина","Виктория","Дарья","Алина","Полина","Екатерина"];
const ANIME_NOUN = ["Клинок","Дух","Меч","Путь","Воин","Демон","Дракон","Призрак","Рассвет","Закат","Бездна","Буря","Цветок","Лепесток","Сакура","Луна","Звезда","Облако","Туман","Пламя","Лёд","Гром","Молния","Кристалл","Зеркало","Ворота","Храм","Святилище","Башня","Крепость","Самурай","Ниндзя","Ронин","Сегун","Ёкай","Тэнгу","Юрэй","Юки"];
const ANIME_VERB = ["восхождения","падения","возрождения","пробуждения","исчезновения","возвращения","отчаяния","надежды","прощания","встречи","разлуки","поиска","охоты","битвы","поединка","обещания","клятвы","мести","прощения","искупления"];
const CARTOON_ADJ = ["Смешной","Добрый","Весёлый","Отважный","Любопытный","Маленький","Большой","Смелый","Хитрый","Умный","Ласковый","Пушистый","Полосатый","Пятнистый","Зелёный","Жёлтый","Розовый","Синий","Фиолетовый","Волшебный","Чудесный","Сказочный"];
const CARTOON_HERO = ["Мишка","Зайчик","Лисёнок","Медвежонок","Волчонок","Ёжик","Бельчонок","Котёнок","Щенок","Мышонок","Тигрёнок","Львёнок","Слонёнок","Дракончик","Единорог","Пони","Цыплёнок","Утёнок","Лягушонок","Динозаврик"];
const CARTOON_PLACE = ["в лесу","в городе","на море","в горах","в пустыне","на острове","в космосе","под водой","в саду","на ферме","в зоопарке","в цирке","в школе","на празднике","на ярмарке","в музее"];
const SERIES_PLACE = ["Москва","Питер","Казань","Сочи","Владивосток","Провинция","Столица","Город","Посёлок","Больница","Школа","Участок","Прокуратура","Суд","Тюрьма","Отель","Ресторан","Клуб","Театр","Редакция","Банк","Завод","Порт","Аэропорт","Вокзал"];
const SERIES_PROF = ["Следователь","Прокурор","Адвокат","Судья","Хирург","Врач","Учитель","Журналист","Детектив","Патрульный","Спасатель","Пожарный","Повар","Парикмахер","Фотограф","Архитектор","Агент","Разведчик","Телохранитель","Курьер"];
const DIRECTORS_FILM = ["Алексей Иванов","Мария Соколова","Дмитрий Орлов","Елена Кузнецова","Сергей Морозов","Анна Белова","Игорь Зайцев","Ольга Новикова","Павел Лебедев","Наталья Жукова","Виктор Соловьёв","Ирина Громова"];
const DIRECTORS_ANIME = ["Хаяо Миядзаки","Мамору Хосода","Сатоси Кон","Макото Синкай","Хироюки Имаиси","Тэцуро Амино","Кацухиро Отомо","Горо Танигути"];
const DIRECTORS_CARTOON = ["Союзмультфильм","Disney Animation","Pixar","DreamWorks","Studio Ghibli","Cartoon Network","Nickelodeon","Illumination"];
const SURNAMES = ["Иванов","Петров","Сидоров","Кузнецов","Смирнов","Соколов","Попов","Лебедев","Козлов","Новиков","Морозов","Волков","Зайцев","Павлов","Семёнов","Голубев","Виноградов","Богданов","Воробьёв","Фёдоров"];
const GENRES_BY_TYPE: Record<MovieType, string[][]> = {
  film: [["Драма","Криминал"],["Комедия","Мелодрама"],["Боевик","Триллер"],["Фантастика","Боевик"],["Ужасы","Триллер"],["Детектив","Криминал"],["Мелодрама","Драма"],["Комедия"],["Военный","Драма"],["Исторический","Драма"],["Триллер","Драма"],["Вестерн","Приключения"],["Спортивный","Драма"],["Фэнтези","Приключения"]],
  anime: [["Аниме","Фэнтези","Приключения"],["Аниме","Боевик","Фантастика"],["Аниме","Драма","Романтика"],["Аниме","Комедия"],["Аниме","Триллер","Мистика"],["Аниме","Школа","Романтика"],["Аниме","Сёнэн","Боевик"],["Аниме","Сёдзё","Драма"],["Аниме","Меха","Фантастика"],["Аниме","Исэкай","Фэнтези"]],
  cartoon: [["Мультфильм","Семейный"],["Мультфильм","Комедия","Приключения"],["Мультфильм","Фэнтези"],["Мультфильм","Приключения"],["Мультфильм","Комедия"],["Мультфильм","Музыкальный"],["Мультфильм","Сказка"]],
  series: [["Сериал","Драма","Криминал"],["Сериал","Детектив","Криминал"],["Сериал","Комедия"],["Сериал","Мелодрама"],["Сериал","Триллер","Мистика"],["Сериал","Боевик"],["Сериал","Исторический"],["Сериал","Медицинский","Драма"],["Сериал","Приключения"],["Сериал","Фантастика"]],
};
const COUNTRIES_BY_TYPE: Record<MovieType, string[][]> = {
  film: [["Россия"],["СССР"],["США"],["Франция"],["Великобритания"],["Германия"],["Италия"],["Япония"],["Корея Южная"],["Китай"],["Индия"]],
  anime: [["Япония"]],
  cartoon: [["Россия"],["СССР"],["США"],["Франция"]],
  series: [["Россия"],["США"],["Великобритания"],["Корея Южная"],["Турция"],["Германия"]],
};
function pick<T>(arr: T[], rng: () => number): T { return arr[Math.floor(rng() * arr.length)]; }
function generateTitle(type: MovieType, rng: () => number): string {
  switch (type) {
    case "film": { const p=Math.floor(rng()*5); if(p===0)return `${pick(FILM_ADJ,rng)} ${pick(FILM_NOUN,rng)}`; if(p===1)return `${pick(FILM_NAMES,rng)} и ${pick(FILM_NOUN,rng)}`; if(p===2)return `${pick(FILM_NOUN,rng)} ${pick(FILM_ADJ,rng).toLowerCase()}`; if(p===3)return `${pick(FILM_NAMES,rng)}: ${pick(FILM_ADJ,rng).toLowerCase()} ${pick(FILM_NOUN,rng)}`; return `${pick(FILM_ADJ,rng)} ${pick(FILM_NOUN,rng)} ${pick(FILM_NAMES,rng).toLowerCase()}`; }
    case "anime": { const p=Math.floor(rng()*4); if(p===0)return `${pick(ANIME_NOUN,rng)}: ${pick(ANIME_VERB,rng)}`; if(p===1)return `${pick(ANIME_NOUN,rng)} и ${pick(ANIME_NOUN,rng)}`; if(p===2)return `Хроники ${pick(ANIME_NOUN,rng).toLowerCase()}`; return `${pick(ANIME_NOUN,rng)}: ${pick(["Сезон 1","Сезон 2","Финал","Начало","Пробуждение"],rng)}`; }
    case "cartoon": { const p=Math.floor(rng()*4); if(p===0)return `${pick(CARTOON_HERO,rng)} ${pick(CARTOON_PLACE,rng)}`; if(p===1)return `Приключения ${pick(CARTOON_HERO,rng).toLowerCase()}`; if(p===2)return `${pick(CARTOON_ADJ,rng)} ${pick(CARTOON_HERO,rng)}`; return `${pick(CARTOON_HERO,rng)} и ${pick(CARTOON_HERO,rng).toLowerCase()}`; }
    case "series": { const p=Math.floor(rng()*4); if(p===0)return `${pick(SERIES_PLACE,rng)}: ${pick(SERIES_PROF,rng)}`; if(p===1)return `${pick(SERIES_PROF,rng)} из ${pick(SERIES_PLACE,rng).toLowerCase()}`; if(p===2)return `${pick(SERIES_PLACE,rng)}. ${1950+Math.floor(rng()*75)}`; return `Дело №${1+Math.floor(rng()*99)}: ${pick(SERIES_PROF,rng)}`; }
  }
}
function assignType(rng: () => number): MovieType { const r=rng(); if(r<0.55)return "film"; if(r<0.75)return "cartoon"; if(r<0.9)return "series"; return "anime"; }
function generateMovie(kinopoiskId: number): Movie {
  const rng = mulberry32(kinopoiskId * 7919 + 13);
  const type = assignType(rng);
  const genres = pick(GENRES_BY_TYPE[type], rng);
  const countries = pick(COUNTRIES_BY_TYPE[type], rng);
  const title = generateTitle(type, rng);
  const year = 1960 + Math.floor(rng() * 66);
  const rating = Math.round((4.5 + rng() * 5.0) * 10) / 10;
  const baseDuration = type === "series" ? 25 + Math.floor(rng() * 75) : type === "cartoon" ? 15 + Math.floor(rng() * 90) : type === "anime" ? 24 + Math.floor(rng() * 30) : 80 + Math.floor(rng() * 90);
  const views = Math.floor(rng() * 1500000);
  const ageRating = pick(type === "cartoon" ? ["0+","6+","12+"] : ["12+","16+","18+"], rng);
  const directors = type === "anime" ? pick(DIRECTORS_ANIME, rng) : type === "cartoon" ? pick(DIRECTORS_CARTOON, rng) : pick(DIRECTORS_FILM, rng);
  const seasons = type === "series" ? 1 + Math.floor(rng() * 8) : 0;
  const cast: string[] = [];
  for (let i = 0; i < 2 + Math.floor(rng() * 3); i++) cast.push(pick(FILM_NAMES, rng) + " " + pick(SURNAMES, rng));
  const descriptions = [
    `Захватывающая история о ${pick(FILM_NOUN,rng)} и ${pick(FILM_NOUN,rng)}. Главный герой сталкивается с выбором, который изменит всё.`,
    `В центре сюжета — ${pick(FILM_ADJ,rng).toLowerCase()} ${pick(FILM_NOUN,rng)}, скрывающий тайну. События разворачиваются на фоне ${pick(FILM_NOUN,rng)}.`,
    `Драматическая история о любви, предательстве и искуплении. ${pick(FILM_NAMES,rng)} оказывается в эпицентре событий, которые заставят переосмыслить прошлое.`,
    `Напряжённое повествование о ${pick(FILM_NOUN,rng)}, где каждый шаг может стать последним. ${pick(FILM_ADJ,rng)} ${pick(FILM_NOUN,rng)} хранит секрет.`,
    `История о поиске истины в мире иллюзий. Герой отправляется в путь, чтобы найти ${pick(FILM_NOUN,rng)} и обрести себя.`,
  ];
  return { id: `kp-${kinopoiskId}`, title, originalTitle: title, year, rating, duration: baseDuration, genres, countries, director: directors, cast, ageRating, description: pick(descriptions,rng), posterUrl: `https://st.kp.yandex.net/images/film_iphone/iphone360_${kinopoiskId}.jpg`, backdropUrl: "", videoUrl: "", trailerUrl: "", kinopoiskId, type, seasons, featured: false, trending: false, views, verified: false };
}

function main() {
  console.log("=== Консолидация каталога до 10000 ===\n");
  const existing = JSON.parse(readFileSync(MOVIES_JSON, "utf-8")) as Movie[];
  console.log(`  Существующих: ${existing.length}`);
  const verified = existing.map((m) => ({ ...m, type: detectType(m.genres), verified: true, seasons: 0 }));
  const verifiedIds = new Set(verified.map((m) => m.kinopoiskId));
  let validIds: number[] = [];
  try { validIds = JSON.parse(readFileSync(VALID_IDS_FILE, "utf-8")) as number[]; } catch { console.log("  ⚠ /tmp/kp-valid-ids.json не найден"); }
  const newIds = validIds.filter((id) => !verifiedIds.has(id));
  console.log(`  Валидных ID: ${validIds.length}, новых: ${newIds.length}`);
  const need = TARGET_TOTAL - verified.length;
  const toAdd = newIds.slice(0, need);
  console.log(`  Добавляем generated: ${toAdd.length}\n`);
  const generated = toAdd.map((id) => generateMovie(id));
  const all = [...verified, ...generated];
  all.sort((a, b) => { if (a.verified !== b.verified) return a.verified ? -1 : 1; return b.rating - a.rating; });
  writeFileSync(MOVIES_JSON, JSON.stringify(all));
  const sizeMB = (JSON.stringify(all).length / 1024 / 1024).toFixed(2);
  console.log(`✓ movies.json: ${all.length} позиций (${sizeMB} MB)`);
  const byType = all.reduce((acc, m) => { acc[m.type]=(acc[m.type]||0)+1; return acc; }, {} as Record<string, number>);
  const byVerified = { verified: all.filter((m)=>m.verified).length, generated: all.filter((m)=>!m.verified).length };
  console.log(`  По типам:`, byType);
  console.log(`  Verified/Generated:`, byVerified);
}
main();
