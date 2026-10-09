import { NextResponse } from "next/server";
import { getAllMovies } from "@/lib/movies";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const API_KEY = "9f85569619584f92af8381b9eb8e49e1.RpYZ4XUKjbGABiCj";
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

/** Построить список фильмов для контекста AI (топ-200 по рейтингу) */
function buildMovieContext(): string {
  const movies = getAllMovies()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 200)
    .map((m) => `${m.title} (${m.year}, ${m.genres.join("/")}, реж. ${m.director}, ★${m.rating.toFixed(1)})`)
    .join("\n");
  return movies;
}

const SYSTEM_PROMPT = `Ты — КиноАссистент, AI-помощник онлайн-кинотеатра «КиноВспышка».

В каталоге 1258 фильмов. Вот топ-200 по рейтингу (формат: Название (Год, Жанры, Режиссёр, Рейтинг)):

${buildMovieContext()}

Твои задачи:
1. Помогать найти фильм по описанию, настроению, жанру, году, режиссёру или актёру
2. Отвечать на вопросы о фильмах (сюжет, актёры, награды, похожие фильмы)
3. Рекомендовать фильмы ИЗ КАТАЛОГА ВЫШЕ — только те, что есть в списке
4. Предлагать, что посмотреть вечером, для семьи, для настроения

ПРАВИЛА:
- Отвечай кратко, дружелюбно, на русском языке
- Когда рекомендуешь фильм, ВСЕГДА указывай его точное название в кавычках: «Название»
- Предлагай 3-5 фильмов с кратким описанием (1-2 предложения каждый)
- Если фильма нет в каталоге — скажи об этом честно
- Если спрашивают про конкретный фильм — дай краткое описание и предложи похожие ИЗ КАТАЛОГА`;

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-8).map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      return NextResponse.json({ error: "Ошибка AI сервиса" }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Извините, не удалось получить ответ.";

    // Извлекаем названия фильмов из ответа AI и сопоставляем с каталогом
    const allMovies = getAllMovies();
    const mentionedMovies: { title: string; slug: string; kinopoiskId: number }[] = [];

    // Ищем названия в кавычках «...» или "..."
    const titleRegex = /[««"]([^»»"]+)[»»"]/g;
    let match;
    while ((match = titleRegex.exec(reply)) !== null) {
      const mentioned = match[1].trim();
      // Точный поиск по названию
      const found = allMovies.find(
        (m) =>
          m.title.toLowerCase() === mentioned.toLowerCase() ||
          m.originalTitle.toLowerCase() === mentioned.toLowerCase()
      );
      if (found && !mentionedMovies.find((mm) => mm.slug === found.id)) {
        mentionedMovies.push({
          title: found.title,
          slug: found.id,
          kinopoiskId: found.kinopoiskId,
        });
      }
    }

    // Также ищем по частичному совпадению (без кавычек)
    allMovies.forEach((m) => {
      if (mentionedMovies.find((mm) => mm.slug === m.id)) return; // уже найден
      // Проверяем, упоминается ли название фильма в ответе AI
      if (reply.includes(m.title) && m.title.length > 4) {
        mentionedMovies.push({
          title: m.title,
          slug: m.id,
          kinopoiskId: m.kinopoiskId,
        });
      }
    });

    return NextResponse.json({ reply, mentionedMovies: mentionedMovies.slice(0, 8) });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
