import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Редирект якорных маршрутов на главную с якорем.
 * /catalog → /#catalog
 * /trending → /#trending
 * /new → /#new
 * /search → /#search
 * /movie/kp-326 → /?film=kp-326 (откроется через модалку)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");

  const anchorMap: Record<string, string> = {
    catalog: "#catalog",
    trending: "#trending",
    new: "#new",
    search: "#search",
    favorites: "#favorites",
    history: "#history",
    recommendations: "#recommendations",
    stats: "#stats",
  };

  if (anchorMap[path]) {
    return NextResponse.redirect(new URL(`/${anchorMap[path]}`, request.url), 301);
  }

  if (slug[0] === "movie" && slug[1]) {
    return NextResponse.redirect(new URL(`/?film=${slug[1]}`, request.url), 301);
  }

  if (slug[0] === "person") {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }

  if (slug[0] === "collection" && slug[1]) {
    return NextResponse.redirect(new URL(`/#collection-${slug[1]}`, request.url), 301);
  }

  return NextResponse.redirect(new URL("/", request.url), 301);
}
