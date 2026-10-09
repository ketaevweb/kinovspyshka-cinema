import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/watchlists — списки пользователя
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ watchlists: [], authenticated: false });
  }

  const watchlists = await db.watchlist.findMany({
    where: { userId: session.user.id },
    include: { movies: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    watchlists: watchlists.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      isPublic: w.isPublic,
      movieCount: w.movies.length,
      movieIds: w.movies.map((m) => m.movieId),
    })),
    authenticated: true,
  });
}

// POST /api/watchlists — создать список
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { name, description } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const watchlist = await db.watchlist.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  return NextResponse.json({ watchlist });
}

// DELETE /api/watchlists?id=... — удалить список
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  }

  await db.watchlist.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
