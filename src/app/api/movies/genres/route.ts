import { NextResponse } from "next/server";
import { getAllGenres } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ genres: getAllGenres() });
}
