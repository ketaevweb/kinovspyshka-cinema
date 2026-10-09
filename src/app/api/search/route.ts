import { NextResponse } from "next/server";
import { searchMovies, getMovieByKinopoiskId } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  // Если запрос — число, ищем также по ID Кинопоиска
  const asNum = Number(q);
  let results = searchMovies(q);
  if (!Number.isNaN(asNum) && q.trim() !== "") {
    const byKp = getMovieByKinopoiskId(asNum);
    if (byKp && !results.find((m) => m.id === byKp.id)) {
      results = [byKp, ...results];
    }
  }

  return NextResponse.json({ query: q, results, total: results.length });
}
