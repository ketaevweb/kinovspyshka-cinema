"use client";

import { ExternalLink } from "lucide-react";
import type { Movie } from "@/lib/types";

interface WatchOnLinksProps {
  movie: Movie;
}

interface Platform {
  name: string;
  color: string;
  icon: string;
  getUrl: (movie: Movie) => string;
}

const PLATFORMS: Platform[] = [
  {
    name: "Кинопоиск",
    color: "bg-[#FF6600]/15 border-[#FF6600]/30 text-[#FF6600] hover:bg-[#FF6600]/25",
    icon: "🎬",
    getUrl: (m) => `https://www.kinopoisk.ru/film/${m.kinopoiskId}/`,
  },
  {
    name: "Иви",
    color: "bg-[#FF0033]/15 border-[#FF0033]/30 text-[#FF0033] hover:bg-[#FF0033]/25",
    icon: "📺",
    getUrl: (m) => `https://www.ivi.ru/search/?q=${encodeURIComponent(m.title)}`,
  },
  {
    name: "Okko",
    color: "bg-[#7B61FF]/15 border-[#7B61FF]/30 text-[#7B61FF] hover:bg-[#7B61FF]/25",
    icon: "🔵",
    getUrl: (m) => `https://okko.tv/search?query=${encodeURIComponent(m.title)}`,
  },
  {
    name: "Кинопоиск HD",
    color: "bg-[#FF6600]/15 border-[#FF6600]/30 text-[#FF6600] hover:bg-[#FF6600]/25",
    icon: "⭐",
    getUrl: (m) => `https://hd.kinopoisk.ru/film/${m.kinopoiskId}`,
  },
  {
    name: "Premier",
    color: "bg-[#E60023]/15 border-[#E60023]/30 text-[#E60023] hover:bg-[#E60023]/25",
    icon: "🔴",
    getUrl: (m) => `https://premier.one/search?query=${encodeURIComponent(m.title)}`,
  },
  {
    name: "Apple TV",
    color: "bg-white/10 border-white/20 text-white hover:bg-white/15",
    icon: "🍎",
    getUrl: (m) => `https://tv.apple.com/search?term=${encodeURIComponent(m.originalTitle || m.title)}`,
  },
];

export function WatchOnLinks({ movie }: WatchOnLinksProps) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Смотреть на платформах
      </p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.getUrl(movie)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${p.color}`}
          >
            <span>{p.icon}</span>
            {p.name}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground/60">
        Рекомендуем смотреть на официальных платформах. Ссылки ведут на легальные источники.
      </p>
    </div>
  );
}
