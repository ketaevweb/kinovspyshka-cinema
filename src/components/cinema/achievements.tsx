"use client";

import { Trophy, Star, Eye, Heart, MessageSquare, Flame, Award, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CinemaStats } from "@/hooks/use-cinema-stats";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  condition: (stats: CinemaStats) => boolean;
  progress: (stats: CinemaStats) => { current: number; target: number };
}

const BADGES: Badge[] = [
  {
    id: "first-fav",
    name: "Первый шаг",
    description: "Добавьте 1 фильм в избранное",
    icon: Heart,
    color: "text-red-400",
    condition: (s) => s.totalFavorites >= 1,
    progress: (s) => ({ current: Math.min(s.totalFavorites, 1), target: 1 }),
  },
  {
    id: "movie-fan",
    name: "Киноман",
    description: "Добавьте 10 фильмов в избранное",
    icon: Star,
    color: "text-yellow-400",
    condition: (s) => s.totalFavorites >= 10,
    progress: (s) => ({ current: Math.min(s.totalFavorites, 10), target: 10 }),
  },
  {
    id: "movie-master",
    name: "Киноэксперт",
    description: "Добавьте 50 фильмов в избранное",
    icon: Trophy,
    color: "text-amber-500",
    condition: (s) => s.totalFavorites >= 50,
    progress: (s) => ({ current: Math.min(s.totalFavorites, 50), target: 50 }),
  },
  {
    id: "explorer",
    name: "Исследователь",
    description: "Просмотрите 10 фильмов",
    icon: Eye,
    color: "text-blue-400",
    condition: (s) => s.totalWatched >= 10,
    progress: (s) => ({ current: Math.min(s.totalWatched, 10), target: 10 }),
  },
  {
    id: "cinephile",
    name: "Кинофил",
    description: "Просмотрите 50 фильмов",
    icon: Film,
    color: "text-purple-400",
    condition: (s) => s.totalWatched >= 50,
    progress: (s) => ({ current: Math.min(s.totalWatched, 50), target: 50 }),
  },
  {
    id: "marathon",
    name: "Марафонец",
    description: "Просмотрите 100 часов кино",
    icon: Flame,
    color: "text-orange-500",
    condition: (s) => s.totalHours >= 100,
    progress: (s) => ({ current: Math.min(Math.round(s.totalHours), 100), target: 100 }),
  },
  {
    id: "genre-diversity",
    name: "Эстет",
    description: "Откройте 5 разных жанров",
    icon: Award,
    color: "text-green-400",
    condition: (s) => s.topGenres.length >= 5,
    progress: (s) => ({ current: Math.min(s.topGenres.length, 5), target: 5 }),
  },
  {
    id: "high-taste",
    name: "Гурман",
    description: "Средний рейтинг ★ 8.0+",
    icon: Star,
    color: "text-cyan-400",
    condition: (s) => s.avgRating >= 8.0,
    progress: (s) => ({ current: Math.min(Math.round(s.avgRating * 10) / 10, 8.0), target: 8.0 }),
  },
];

interface AchievementsProps {
  stats: CinemaStats;
}

export function Achievements({ stats }: AchievementsProps) {
  const earned = BADGES.filter((b) => b.condition(stats));
  const inProgress = BADGES.filter((b) => !b.condition(stats));

  if (stats.totalWatched === 0 && stats.totalFavorites === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <Trophy className="h-5 w-5 text-cinema" />
        Достижения
        <span className="ml-1 rounded-full bg-cinema/15 px-2 py-0.5 text-xs font-bold text-cinema">
          {earned.length}/{BADGES.length}
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {earned.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-cinema/30 bg-cinema/5 p-4 text-center"
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-cinema/10", badge.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground">{badge.description}</p>
              </div>
              <span className="rounded-full bg-cinema/15 px-2 py-0.5 text-[10px] font-bold text-cinema">
                ✓ Получено
              </span>
            </div>
          );
        })}

        {inProgress.map((badge) => {
          const Icon = badge.icon;
          const prog = badge.progress(stats);
          const pct = Math.round((prog.current / prog.target) * 100);
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-card/30 p-4 text-center opacity-60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/40 text-muted-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground">{badge.description}</p>
              </div>
              <div className="w-full">
                <div className="h-1.5 overflow-hidden rounded-full bg-background/40">
                  <div
                    className="h-full rounded-full bg-muted-foreground/30"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {prog.current} / {prog.target}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
