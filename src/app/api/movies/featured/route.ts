import { NextResponse } from "next/server";
import { getFeaturedMovies } from "@/lib/movies";

export const revalidate = 3600; // ISR: кэш час

export async function GET() {
  return NextResponse.json({ movies: getFeaturedMovies() });
}
