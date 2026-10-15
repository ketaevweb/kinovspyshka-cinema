import { NextResponse } from "next/server";
import { getAllMovies, getMoviesByGenre, getMoviesByType, type SortOption } from "@/lib/movies";
import type { MovieType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") ?? "Все";
  const type = (searchParams.get("type") ?? "all") as MovieType | "all";
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24", 10), 60);
  const sort = (searchParams.get("sort") ?? "rating-desc") as SortOption;

  // Применяем фильтры последовательно: type → genre
  let all = getAllMovies();
  if (type && type !== "all") all = getMoviesByType(type);
  if (genre && genre !== "Все") all = all.filter((m) => m.genres.includes(genre));

  const sorted = [...all];
  switch (sort) {
    case "rating-desc": sorted.sort((a, b) => b.rating - a.rating); break;
    case "rating-asc": sorted.sort((a, b) => a.rating - b.rating); break;
    case "year-desc": sorted.sort((a, b) => b.year - a.year); break;
    case "year-asc": sorted.sort((a, b) => a.year - b.year); break;
    case "views-desc": sorted.sort((a, b) => b.views - a.views); break;
    case "title-asc": sorted.sort((a, b) => a.title.localeCompare(b.title, "ru")); break;
  }

  const start = (page - 1) * limit;
  const pageMovies = sorted.slice(start, start + limit);

  return NextResponse.json({
    movies: pageMovies,
    total: sorted.length,
    page,
    limit,
    totalPages: Math.ceil(sorted.length / limit),
  });
}
