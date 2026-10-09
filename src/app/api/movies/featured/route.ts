import { NextResponse } from "next/server";
import { getFeaturedMovies } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ movies: getFeaturedMovies() });
}
