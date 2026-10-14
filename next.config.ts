import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Локальные постеры в /public/posters — форматы, которые Next/Image оптимизирует
    formats: ["image/avif", "image/webp"],
    // Размеры для responsive srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Локальные файлы — без remotePatterns
  },
  // ── Cache-заголовки для ускорения на мобильной сети T2/Ростелеком ──
  // Статика /_next/static/ уже immutable (Next.js по умолчанию).
  // Постеры и медиа в /public — добавляем долгий кэш, чтобы:
  //   1. Браузер не перекачивал постеры при каждом визите
  //   2. Прокси (Caddy на VPS / Cloudflare) мог кэшировать их на edge
  // (Next.js 16 = path-to-regexp v8 — используем :path(\d+) вместо :path*)
  async headers() {
    const cacheImmutable = "public, max-age=2592000, immutable"; // 30 дней
    const cacheWeek = "public, max-age=604800"; // 7 дней
    return [
      {
        source: "/posters/:path(\\d+).jpg",
        headers: [{ key: "Cache-Control", value: cacheImmutable }],
      },
      {
        source: "/backdrops/:path(\\d+).jpg",
        headers: [{ key: "Cache-Control", value: cacheImmutable }],
      },
      {
        source: "/icon-192.png",
        headers: [{ key: "Cache-Control", value: cacheImmutable }],
      },
      {
        source: "/icon-512.png",
        headers: [{ key: "Cache-Control", value: cacheImmutable }],
      },
      {
        source: "/favicon-32.png",
        headers: [{ key: "Cache-Control", value: cacheWeek }],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [{ key: "Cache-Control", value: cacheWeek }],
      },
      {
        source: "/logo.svg",
        headers: [{ key: "Cache-Control", value: cacheWeek }],
      },
    ];
  },
};

export default nextConfig;
