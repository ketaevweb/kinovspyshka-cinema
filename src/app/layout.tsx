import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "КиноВспышка — онлайн-кинотеатр",
  description:
    "Смотрите фильмы и сериалы онлайн в HD. Большая коллекция, удобный поиск по названию и ID Кинопоиска, трейлеры и плеер. Приятного просмотра!",
  keywords: [
    "онлайн кинотеатр",
    "смотреть фильмы онлайн",
    "сериалы",
    "Кинопоиск",
    "HD фильмы",
    "трейлеры",
  ],
  authors: [{ name: "КиноВспышка" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "КиноВспышка — онлайн-кинотеатр",
    description:
      "Смотрите фильмы и сериалы онлайн в HD. Большая коллекция и удобный поиск.",
    siteName: "КиноВспышка",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "КиноВспышка — онлайн-кинотеатр",
    description: "Смотрите фильмы и сериалы онлайн в HD.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
