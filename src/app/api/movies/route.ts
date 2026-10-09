import { NextResponse } from "next/server";
import { getAllMovies, getMoviesByGenre } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") ?? "Все";

  const list = genre && genre !== "Все" ? getMoviesByGenre(genre) : getAllMovies();
  return NextResponse.json({ movies: list, total: list.length });
}
