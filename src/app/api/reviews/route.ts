import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/reviews?movieId=... — отзывы к фильму
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get("movieId");

  if (movieId) {
    // Отзывы к конкретному фильму
    const reviews = await db.review.findMany({
      where: { movieId },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        author: r.user?.name || r.user?.email || "Аноним",
      })),
      avgRating: reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null,
      count: reviews.length,
    });
  }

  // Все отзывы пользователя
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ reviews: [], authenticated: false });
  }

  const reviews = await db.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      movieId: r.movieId,
      kinopoiskId: r.kinopoiskId,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
    })),
    authenticated: true,
  });
}

// POST /api/reviews/like — лайк/анлайк отзыва
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { reviewId } = await request.json();
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId обязателен" }, { status: 400 });
  }

  // Проверяем, есть ли уже лайк
  const existing = await db.reviewLike.findUnique({
    where: {
      userId_reviewId: {
        userId: session.user.id,
        reviewId,
      },
    },
  });

  if (existing) {
    // Убираем лайк
    await db.reviewLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  } else {
    // Ставим лайк
    await db.reviewLike.create({
      data: { userId: session.user.id, reviewId },
    });
    return NextResponse.json({ liked: true });
  }
}

// POST /api/reviews — создать/обновить отзыв
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { movieId, kinopoiskId, rating, text } = await request.json();
  if (!movieId || !kinopoiskId || !rating || !text?.trim()) {
    return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
  }

  if (rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Рейтинг 1-10" }, { status: 400 });
  }

  const review = await db.review.upsert({
    where: {
      userId_movieId: {
        userId: session.user.id,
        movieId,
      },
    },
    update: { rating, text: text.trim() },
    create: {
      userId: session.user.id,
      movieId,
      kinopoiskId,
      rating,
      text: text.trim(),
    },
  });

  return NextResponse.json({ review });
}

// DELETE /api/reviews?id=... — удалить отзыв
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

  await db.review.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
