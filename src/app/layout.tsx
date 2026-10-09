import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

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
    default: "КиноВспышка — онлайн-кинотеатр: 600 фильмов в HD",
    template: "%s · КиноВспышка",
  },
  description:
    "Онлайн-кинотеатр КиноВспышка — 600 реальных фильмов с данными Кинопоиска. Смотрите онлайн в HD, ищите по названию или ID Кинопоиска, фильтруйте по жанрам. Приятного просмотра!",
  keywords: [
    "онлайн кинотеатр",
    "смотреть фильмы онлайн",
    "сериалы онлайн",
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
    title: "КиноВспышка — онлайн-кинотеатр: 600 фильмов в HD",
    description:
      "600 реальных фильмов с данными Кинопоиска. Смотрите онлайн в HD, ищите по названию или ID Кинопоиска.",
    siteName: "КиноВспышка",
    locale: "ru_RU",
    type: "website",
    url: "https://kino.kataevweb.ru",
  },
  twitter: {
    card: "summary_large_image",
    title: "КиноВспышка — онлайн-кинотеатр",
    description: "600 фильмов в HD. Смотрите онлайн, ищите по ID Кинопоиска.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.webmanifest",
};

// JSON-LD structured data для Google Rich Results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "КиноВспышка",
  url: "https://kino.kataevweb.ru",
  description: "Онлайн-кинотеатр с 600 реальными фильмами в HD",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
