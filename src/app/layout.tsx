import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { getFeaturedMovies } from "@/lib/movies";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "КиноВспышка — онлайн-кинотеатр: 1258 фильмов в HD",
    template: "%s · КиноВспышка",
  },
  description:
    "Онлайн-кинотеатр КиноВспышка — 1258 реальных фильмов с данными Кинопоиска. Смотрите онлайн в HD, ищите по названию или ID Кинопоиска, фильтруйте по жанрам. AI-ассистент, отзывы, рейтинги.",
  keywords: [
    "онлайн кинотеатр",
    "смотреть фильмы онлайн",
    "сериалы онлайн",
    "аниме онлайн",
    "Кинопоиск",
    "HD фильмы",
    "трейлеры",
    "бесплатные фильмы",
    "kinopoisk",
    "кино в HD",
  ],
  authors: [{ name: "КиноВспышка" }],
  metadataBase: new URL("https://kino.kataevweb.ru"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "КиноВспышка",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "КиноВспышка — онлайн-кинотеатр: 1258 фильмов в HD",
    description:
      "1258 реальных фильмов с данными Кинопоиска. Смотрите онлайн в HD, AI-ассистент, отзывы, рейтинги.",
    siteName: "КиноВспышка",
    locale: "ru_RU",
    type: "website",
    url: "https://kino.kataevweb.ru",
  },
  twitter: {
    card: "summary_large_image",
    title: "КиноВспышка — онлайн-кинотеатр",
    description: "1258 фильмов в HD. Смотрите онлайн, ищите по ID Кинопоиска.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.webmanifest",
};

// JSON-LD: WebSite schema + Movie schemas для топ-фильмов
function buildJsonLd() {
  const featured = getFeaturedMovies();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "КиноВспышка",
    url: "https://kino.kataevweb.ru",
    description: "Онлайн-кинотеатр с 1258 реальными фильмами в HD",
    inLanguage: "ru-RU",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kino.kataevweb.ru/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const movieSchemas = featured.map((movie) => ({
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    alternateName: movie.originalTitle,
    datePublished: String(movie.year),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: movie.rating,
      bestRating: 10,
      ratingCount: movie.views > 1000 ? Math.floor(movie.views / 1000) : 1,
    },
    director: {
      "@type": "Person",
      name: movie.director,
    },
    actor: movie.cast.slice(0, 4).map((name) => ({
      "@type": "Person",
      name,
    })),
    genre: movie.genres.join(", "),
    duration: `PT${movie.duration}M`,
    contentRating: movie.ageRating,
    description: movie.description.slice(0, 300),
    image: movie.posterUrl.startsWith("/")
      ? `https://kino.kataevweb.ru${movie.posterUrl}`
      : movie.posterUrl,
    url: `https://kino.kataevweb.ru/?film=${movie.id}`,
  }));

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "КиноВспышка",
    url: "https://kino.kataevweb.ru",
    logo: "https://kino.kataevweb.ru/icon-192.png",
    description: "Онлайн-кинотеатр с 1258 фильмами в HD",
  };

  return [websiteSchema, ...movieSchemas, orgSchema];
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemas = buildJsonLd();

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
