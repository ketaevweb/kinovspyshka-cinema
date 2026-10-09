import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/watchlists/{id}/movies — добавить фильм в список
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const { movieId, kinopoiskId } = await request.json();

  if (!movieId || !kinopoiskId) {
    return NextResponse.json({ error: "movieId и kinopoiskId обязательны" }, { status: 400 });
  }

  // Проверяем, что список принадлежит пользователю
  const watchlist = await db.watchlist.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!watchlist) {
    return NextResponse.json({ error: "Список не найден" }, { status: 404 });
  }

  await db.watchlistMovie.upsert({
    where: {
      watchlistId_movieId: {
        watchlistId: id,
        movieId,
      },
    },
    update: {},
    create: { watchlistId: id, movieId, kinopoiskId },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/watchlists/{id}/movies?movieId=... — удалить фильм из списка
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get("movieId");

  if (!movieId) {
    return NextResponse.json({ error: "movieId обязателен" }, { status: 400 });
  }

  await db.watchlistMovie.deleteMany({
    where: { watchlistId: id, movieId },
  });

  return NextResponse.json({ ok: true });
}
