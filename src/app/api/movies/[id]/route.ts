import { NextResponse } from "next/server";
import { getMovieById, getSimilarMovies } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) {
    return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
  }
  return NextResponse.json({ movie, similar: getSimilarMovies(id) });
}
