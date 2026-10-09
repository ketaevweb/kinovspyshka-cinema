import { NextResponse } from "next/server";
import { getAllCountries, getYearRange } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    countries: getAllCountries(),
    yearRange: getYearRange(),
  });
}
