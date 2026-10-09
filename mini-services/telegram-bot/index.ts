/**
 * Telegram-бот для КиноВспышки.
 *
 * Функции:
 *  - /start — приветствие + ссылка на сайт
 *  - /search <название> — поиск фильмов на сайте (ссылка)
 *  - /popular — топ фильмов недели
 *  - /help — список команд
 *  - inline-кнопка «Открыть кинотеатр» с ссылкой на сайт
 *
 * Запуск: bun run dev (порт 3001, для webhook на Vercel через XTransformPort)
 * Для production: можно деплоить как Vercel Serverless Function.
 */

import { Bot, InlineKeyboard } from "grammy";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const SITE_URL = process.env.SITE_URL || "https://kinovspyshka-cinema.vercel.app";
const PORT = 3001;

const bot = new Bot(BOT_TOKEN);

// /start
bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .url("🎬 Открыть кинотеатр", SITE_URL)
    .row()
    .url("🔍 Поиск фильма", `${SITE_URL}/#search`)
    .row()
    .url("🔥 В тренде", `${SITE_URL}/#trending`);

  await ctx.reply(
    "Добро пожаловать в КиноВспышку! 🎬\n\n" +
    "Онлайн-кинотеатр с 600 реальными фильмами в HD.\n\n" +
    "Команды:\n" +
    "/search <название> — найти фильм\n" +
    "/popular — топ фильмов\n" +
    "/help — помощь\n\n" +
    "Нажмите кнопку ниже, чтобы открыть кинотеатр:",
    { reply_markup: keyboard }
  );
});

// /search <query>
bot.command("search", async (ctx) => {
  const query = ctx.match?.trim();
  if (!query) {
    await ctx.reply(
      "Использование: /search <название фильма>\nПример: /search Начало"
    );
    return;
  }

  const searchUrl = `${SITE_URL}/?q=${encodeURIComponent(query)}`;
  const keyboard = new InlineKeyboard()
    .url(`🔍 Искать «${query}»`, searchUrl)
    .row()
    .url("🎬 Открыть кинотеатр", SITE_URL);

  await ctx.reply(
    `Поиск фильма «${query}» на КиноВспышке:\n${searchUrl}`,
    { reply_markup: keyboard }
  );
});

// /popular
bot.command("popular", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .url("🔥 Топ фильмов", `${SITE_URL}/#trending`)
    .row()
    .url("🏆 Топ-250", `${SITE_URL}/#collection-top250`);

  await ctx.reply(
    "Самые популярные фильмы недели на КиноВспышке:\n\n" +
    "🥇 Побег из Шоушенка (9.3)\n" +
    "🥈 Зелёная миля (9.1)\n" +
    "🥉 Крёстный отец (9.2)\n\n" +
    "Смотрите полный топ по ссылке:",
    { reply_markup: keyboard }
  );
});

// /help
bot.command("help", async (ctx) => {
  await ctx.reply(
    "Помощь по КиноВспышке 🎬\n\n" +
    "Команды:\n" +
    "/start — начать работу\n" +
    "/search <название> — найти фильм\n" +
    "/popular — топ фильмов недели\n" +
    "/help — эта справка\n\n" +
    `Сайт: ${SITE_URL}`
  );
});

// Обработка обычных сообщений — поиск
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  // Если это не команда, ищем как название фильма
  if (text && !text.startsWith("/")) {
    const searchUrl = `${SITE_URL}/?q=${encodeURIComponent(text)}`;
    const keyboard = new InlineKeyboard()
      .url(`🔍 Искать «${text}»`, searchUrl);

    await ctx.reply(
      `Ищем фильм «${text}» на КиноВспышке...`,
      { reply_markup: keyboard }
    );
  }
});

// Запуск
if (BOT_TOKEN) {
  bot.start({
    onStart: () => console.log(`Telegram-бот КиноВспышки запущен на порту ${PORT}`),
  });
} else {
  console.log("TELEGRAM_BOT_TOKEN не задан — бот не запущен");
  console.log("Получите токен у @BotFather и задайте env TELEGRAM_BOT_TOKEN");
}
