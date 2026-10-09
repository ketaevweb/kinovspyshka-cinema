import { NextResponse } from "next/server";

/**
 * Прокси-эндпоинт для постеров Кинопоиска.
 *
 * Браузер не может напрямую грузить https://st.kp.yandex.net/images/film_iphone/iphone360_{id}.jpg —
 * Кинопоиск медленно отдаёт / блокирует по hotlink при прямом запросе с чужого домена.
 * Этот прокси делает запрос server-side (с правильным referer) и кэширует результат,
 * отдаёт изображение браузеру с нашего домена — быстро и без блокировок.
 */
export const dynamic = "force-dynamic";
export const revalidate = 86400; // кэш 24 часа

const KP_POSTER_BASE = "https://st.kp.yandex.net/images/film_iphone/iphone360_";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Валидация: только цифры
  if (!/^\d+$/.test(id)) {
    return new NextResponse("Invalid id", { status: 400 });
  }

  const upstream = `${KP_POSTER_BASE}${id}.jpg`;

  try {
    const upstreamRes = await fetch(upstream, {
      headers: {
        // Имитируем реальный браузер, чтобы Кинопоиск не заблокировал
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        Referer: "https://www.kinopoisk.ru/",
      },
      // Не следуем редиректам, Кинопоиск может редиректить
      redirect: "manual",
    });

    if (!upstreamRes.ok) {
      // Вернём 404, чтобы фронтенд переключился на фолбэк
      return new NextResponse("Poster not found", { status: 404 });
    }

    const buf = await upstreamRes.arrayBuffer();
    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch poster", { status: 502 });
  }
}
