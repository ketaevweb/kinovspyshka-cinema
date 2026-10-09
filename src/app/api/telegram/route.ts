import { NextResponse } from "next/server";
import { Bot } from "grammy";

/**
 * Telegram webhook для КиноВспышки (serverless на Vercel).
 *
 * Принимает обновления от Telegram, отправляет ссылки на сайт.
 * Настройка webhook: GET /api/telegram?action=setwebhook
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const SITE_URL = process.env.NEXTAUTH_URL || "https://kinovspyshka-cinema.vercel.app";

export const dynamic = "force-dynamic";

function createBot() {
  if (!BOT_TOKEN) return null;
  const bot = new Bot(BOT_TOKEN);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Добро пожаловать в КиноВспышку! 🎬\n\n" +
      "Онлайн-кинотеатр с 600 реальными фильмами в HD.\n\n" +
      "Команды:\n/search <название> — найти фильм\n/popular — топ фильмов\n/help — помощь",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎬 Открыть кинотеатр", url: SITE_URL }],
            [{ text: "🔍 Поиск фильма", url: `${SITE_URL}/#search` }],
            [{ text: "🔥 В тренде", url: `${SITE_URL}/#trending` }],
          ],
        },
      }
    );
  });

  bot.command("search", async (ctx) => {
    const query = ctx.match?.trim();
    if (!query) {
      await ctx.reply("Использование: /search <название фильма>\nПример: /search Начало");
      return;
    }
    const searchUrl = `${SITE_URL}/?q=${encodeURIComponent(query)}`;
    await ctx.reply(`Поиск фильма «${query}»:\n${searchUrl}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `🔍 Открыть «${query}»`, url: searchUrl }],
        ],
      },
    });
  });

  bot.command("popular", async (ctx) => {
    await ctx.reply(
      "🔥 Топ фильмов недели на КиноВспышке:\n\n" +
      "🥇 Побег из Шоушенка (9.3)\n🥈 Зелёная миля (9.1)\n🥉 Крёстный отец (9.2)\n\n" +
      "Смотрите полный топ:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏆 Топ фильмов", url: `${SITE_URL}/#trending` }],
            [{ text: "📊 Топ-250", url: `${SITE_URL}/#collection-top250` }],
          ],
        },
      }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Помощь по КиноВспышке 🎬\n\n" +
      "Команды:\n/start — начать\n/search <название> — найти фильм\n/popular — топ\n/help — справка\n\n" +
      `Сайт: ${SITE_URL}`
    );
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    if (text && !text.startsWith("/")) {
      const searchUrl = `${SITE_URL}/?q=${encodeURIComponent(text)}`;
      await ctx.reply(`Ищем «${text}»...`, {
        reply_markup: {
          inline_keyboard: [[{ text: `🔍 Открыть «${text}»`, url: searchUrl }]],
        },
      });
    }
  });

  return bot;
}

// GET: установка webhook (или информация)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!BOT_TOKEN) {
    return NextResponse.json({
      status: "disabled",
      message: "TELEGRAM_BOT_TOKEN не задан. Получите токен у @BotFather.",
    });
  }

  if (action === "setwebhook") {
    const webhookUrl = `${SITE_URL}/api/telegram`;
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,
      { method: "POST" }
    );
    const data = await tgRes.json();
    return NextResponse.json({
      action: "setwebhook",
      webhookUrl,
      result: data,
    });
  }

  return NextResponse.json({
    status: "active",
    bot: "КиноВспышка",
    site: SITE_URL,
    commands: ["/start", "/search <название>", "/popular", "/help"],
    setWebhook: `${SITE_URL}/api/telegram?action=setwebhook`,
  });
}

// POST: обработка обновлений от Telegram
export async function POST(request: Request) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }

  try {
    const update = await request.json();
    const bot = createBot();
    if (!bot) {
      return NextResponse.json({ error: "Bot init failed" }, { status: 500 });
    }
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
