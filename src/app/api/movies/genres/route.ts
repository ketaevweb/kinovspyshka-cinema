import { NextResponse } from "next/server";
import { getAllGenres } from "@/lib/movies";

export const revalidate = 3600; // ISR: кэш час

export async function GET() {
  return NextResponse.json({ genres: getAllGenres() });
}
