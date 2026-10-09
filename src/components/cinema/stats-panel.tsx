"use client";

import { BarChart3, Clock, Star, Heart, Film, Globe } from "lucide-react";
import type { CinemaStats } from "@/hooks/use-cinema-stats";

interface StatsPanelProps {
  stats: CinemaStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  if (stats.totalWatched === 0) return null;

  const maxGenre = Math.max(...stats.topGenres.map((g) => g.count), 1);
  const maxDecade = Math.max(...stats.decadeStats.map((d) => d.count), 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <BarChart3 className="h-5 w-5 text-cinema" />
        Ваша статистика
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Карточки-метрики */}
        <StatCard icon={Film} label="Просмотрено" value={String(stats.totalWatched)} color="text-cinema" />
        <StatCard icon={Heart} label="В избранном" value={String(stats.totalFavorites)} color="text-red-400" />
        <StatCard icon={Star} label="Средний рейтинг" value={`★ ${stats.avgRating.toFixed(1)}`} color="text-yellow-400" />
        <StatCard icon={Clock} label="Часов кино" value={`${stats.totalHours}ч`} color="text-blue-400" />
      </div>

      {/* График по жанрам */}
      {stats.topGenres.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/5 bg-card/40 p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-cinema" />
            По жанрам
          </h3>
          <div className="space-y-2">
            {stats.topGenres.map((g) => (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{g.genre}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-full bg-background/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cinema to-cinema/60 transition-all"
                    style={{ width: `${(g.count / maxGenre) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-semibold">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* По десятилетиям */}
      {stats.decadeStats.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/5 bg-card/40 p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Clock className="h-4 w-4 text-cinema" />
            По десятилетиям
          </h3>
          <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ minHeight: "80px" }}>
            {stats.decadeStats.map((d) => (
              <div key={d.decade} className="flex shrink-0 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-cinema">{d.count}</span>
                <div
                  className="w-8 rounded-t bg-cinema/60 transition-all hover:bg-cinema"
                  style={{ height: `${Math.max((d.count / maxDecade) * 60, 4)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.decade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Топ страны */}
      {stats.countries.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-card/40 p-4">
          <Globe className="h-4 w-4 text-cinema" />
          <span className="text-xs text-muted-foreground">Страны:</span>
          {stats.countries.map((c) => (
            <span key={c.country} className="rounded-full bg-cinema/10 px-2 py-0.5 text-xs text-cinema">
              {c.country} · {c.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-card/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
