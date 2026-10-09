import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/favorites — список избранного пользователя
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [], authenticated: false });
  }

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    favorites: favorites.map((f) => f.movieId),
    kinopoiskIds: favorites.map((f) => f.kinopoiskId),
    authenticated: true,
  });
}

// POST /api/favorites — добавить в избранное
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { movieId, kinopoiskId } = await request.json();
    if (!movieId || !kinopoiskId) {
      return NextResponse.json(
        { error: "movieId и kinopoiskId обязательны" },
        { status: 400 }
      );
    }

    const favorite = await db.favorite.upsert({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        movieId,
        kinopoiskId,
      },
    });

    return NextResponse.json({ ok: true, favorite });
  } catch (e) {
    console.error("Add favorite error:", e);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

// DELETE /api/favorites?movieId=... — удалить из избранного
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get("movieId");
  if (!movieId) {
    return NextResponse.json({ error: "movieId обязателен" }, { status: 400 });
  }

  await db.favorite.deleteMany({
    where: {
      userId: session.user.id,
      movieId,
    },
  });

  return NextResponse.json({ ok: true });
}
