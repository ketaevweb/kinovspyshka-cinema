import { NextResponse } from "next/server";
import { getAllCountries, getYearRange } from "@/lib/movies";

export const revalidate = 3600; // ISR: кэш час

export async function GET() {
  return NextResponse.json({
    countries: getAllCountries(),
    yearRange: getYearRange(),
  });
}
