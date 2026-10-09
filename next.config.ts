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
};

export default nextConfig;
