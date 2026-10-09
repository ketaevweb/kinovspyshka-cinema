import type { MetadataRoute } from "next";

const BASE_URL = "https://kinovspyshka-cinema.vercel.app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "КиноВспышка — онлайн-кинотеатр",
    short_name: "КиноВспышка",
    description:
      "Онлайн-кинотеатр с 600 реальными фильмами в HD. Смотрите онлайн, ищите по названию или ID Кинопоиска.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#e50914",
    orientation: "portrait-primary",
    lang: "ru-RU",
    dir: "ltr",
    categories: ["entertainment", "video"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "Каталог",
        short_name: "Каталог",
        url: "/#catalog",
      },
      {
        name: "Поиск",
        short_name: "Поиск",
        url: "/#search",
      },
      {
        name: "В тренде",
        short_name: "Тренды",
        url: "/#trending",
      },
    ],
  };
}
