import { NextResponse } from "next/server";
import { getCollections } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ collections: getCollections() });
}
