import type { Movie } from "@/lib/types";

/** Простой строковый хеш → число (детерминированный). */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** HSL-палитра из id фильма — единый «характер» для постера. */
export function posterPalette(id: string) {
  const h = hashString(id);
  const hue = h % 360;
  const hue2 = (hue + 35 + (h % 40)) % 360;
  const sat = 45 + (h % 25); // приглушённая насыщенность
  return {
    hue,
    hue2,
    sat,
    bg1: `hsl(${hue}, ${sat}%, 22%)`,
    bg2: `hsl(${hue2}, ${sat - 10}%, 10%)`,
    accent: `hsl(${(hue + 180) % 360}, 80%, 60%)`,
    glow: `hsl(${hue}, ${sat}%, 35%)`,
  };
}

/** Иконка-строка (path d) по хешу — для декора постера. */
function iconFor(id: string): string {
  const h = hashString(id) % 4;
  switch (h) {
    case 0:
      // play
      return "M50 30 L72 50 L50 70 Z";
    case 1:
      // film reel circle
      return "M50 50 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M50 50 m-4 -14 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M50 50 m-4 -2 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M50 50 m14 -2 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M50 50 m-4 14 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0";
    case 2:
      // aperture-ish star
      return "M50 25 L58 44 L78 44 L62 56 L68 76 L50 64 L32 76 L38 56 L22 44 L42 44 Z";
    default:
      // camera
      return "M28 40 H58 V62 H28 Z M58 46 L72 38 V64 L58 56 Z";
  }
}

/** Разбить заголовок на строки (до maxChars символов) для SVG-текст. */
function wrapTitle(title: string, maxChars: number): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 4);
}

export interface PosterSvgProps {
  movie: Pick<Movie, "id" | "title" | "originalTitle" | "year" | "genres">;
  className?: string;
}

/** Процедурный портретный постер 2:3 (SVG). */
export function PosterSvg({ movie, className }: PosterSvgProps) {
  const p = posterPalette(movie.id);
  const lines = wrapTitle(movie.title, movie.title.length > 22 ? 11 : 13);
  const genre = movie.genres[0] ?? "";
  const gid = `pg-${movie.id}`;

  const lineCount = lines.length;
  const fontSize = lineCount >= 4 ? 15 : lineCount === 3 ? 17 : lineCount === 2 ? 20 : 24;
  const startY = 168 - ((lineCount - 1) * (fontSize + 2)) / 2;

  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`Постер фильма «${movie.title}»`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.bg1} />
          <stop offset="100%" stopColor={p.bg2} />
        </linearGradient>
        <radialGradient id={`${gid}-v`} cx="50%" cy="42%" r="75%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
      </defs>

      {/* Фон */}
      <rect width="200" height="300" fill={`url(#${gid})`} />
      <rect width="200" height="300" fill={`url(#${gid}-v)`} />

      {/* Декоративная плёнка по краям */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={`l-${i}`} opacity="0.18">
          <rect x="6" y={14 + i * 32} width="8" height="20" rx="1.5" fill="#fff" />
          <rect x="186" y={14 + i * 32} width="8" height="20" rx="1.5" fill="#fff" />
        </g>
      ))}

      {/* Большая полупрозрачная иконка-водяной знак */}
      <g opacity="0.12" fill="#fff">
        <path d={iconFor(movie.id)} />
      </g>

      {/* Жанр сверху */}
      {genre && (
        <text
          x="100"
          y="48"
          textAnchor="middle"
          fontSize="9"
          letterSpacing="2"
          fill={p.accent}
          fontFamily="sans-serif"
          fontWeight="700"
        >
          {genre.toUpperCase()}
        </text>
      )}

      {/* Разделитель */}
      <line x1="70" y1="58" x2="130" y2="58" stroke={p.accent} strokeWidth="1" opacity="0.7" />

      {/* Название */}
      {lines.map((ln, i) => (
        <text
          key={i}
          x="100"
          y={startY + i * (fontSize + 2)}
          textAnchor="middle"
          fontSize={fontSize}
          fill="#fff"
          fontFamily="sans-serif"
          fontWeight="800"
        >
          {ln}
        </text>
      ))}

      {/* Год снизу */}
      <text
        x="100"
        y="268"
        textAnchor="middle"
        fontSize="11"
        fill="rgba(255,255,255,0.65)"
        fontFamily="sans-serif"
        fontWeight="600"
        letterSpacing="1"
      >
        {movie.year}
      </text>
      <text
        x="100"
        y="284"
        textAnchor="middle"
        fontSize="7"
        fill="rgba(255,255,255,0.4)"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        HD · КиноВспышка
      </text>
    </svg>
  );
}

/** Процедурный широкий backdrop 16:9 (SVG) — для hero/modal без реального фото. */
export function BackdropSvg({ movie, className }: PosterSvgProps) {
  const p = posterPalette(movie.id);
  const gid = `bg-${movie.id}`;
  const title = movie.title;
  return (
    <svg
      viewBox="0 0 1280 720"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`Кадр из фильма «${movie.title}»`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.bg1} />
          <stop offset="100%" stopColor={p.bg2} />
        </linearGradient>
        <radialGradient id={`${gid}-r`} cx="70%" cy="35%" r="60%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill={`url(#${gid})`} />
      <rect width="1280" height="720" fill={`url(#${gid}-r)`} />
      <g opacity="0.08" fill="#fff">
        <path d="M640 360 m-260 0 a260 260 0 1 0 520 0 a260 260 0 1 0 -520 0" />
      </g>
      <text
        x="80"
        y="660"
        fontSize="40"
        fill="rgba(255,255,255,0.18)"
        fontFamily="sans-serif"
        fontWeight="800"
      >
        {title}
      </text>
    </svg>
  );
}
