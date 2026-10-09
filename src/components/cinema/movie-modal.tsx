"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IframePlayer } from "./iframe-player";
import { MovieCard } from "./movie-card";
import {
  Star,
  Clock,
  Calendar,
  Film,
  Users,
  Globe,
  Eye,
  Share2,
  Plus,
  Check,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import type { Movie } from "@/lib/types";

interface MovieModalProps {
  movie: Movie | null;
  similar: Movie[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlay: (movie: Movie) => void;
  onAddToFavorites?: (movie: Movie) => void;
  favoriteIds?: Set<string>;
}

export function MovieModal({
  movie,
  similar,
  open,
  onOpenChange,
  onPlay,
  onAddToFavorites,
  favoriteIds,
}: MovieModalProps) {
  if (!movie) return null;

  const isFav = favoriteIds?.has(movie.id) ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden border-white/10 bg-background/95 p-0 sm:max-w-5xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">{movie.title}</DialogTitle>
        <ScrollArea className="cinema-scroll max-h-[92vh]">
          <div className="p-3 sm:p-4">
            {/* Плеер — iframe с референс-кинотеатром по ID Кинопоиска */}
            <div className="overflow-hidden rounded-xl">
              <IframePlayer
                key={movie.id}
                kinopoiskId={movie.kinopoiskId}
                title={movie.title}
              />
            </div>

            {/* Подпись под плеером */}
            <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-muted-foreground sm:px-2">
              <PlayCircle className="h-3.5 w-3.5 text-cinema" />
              Видео загружается с kinopoisk.ws по ID {movie.kinopoiskId}. Если
              плеер не появился —{" "}
              <a
                href={`https://fzz-0ejfn0o.troutcdn.site/${movie.kinopoiskId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-cinema hover:underline"
              >
                открыть в новой вкладке <ExternalLink className="h-3 w-3" />
              </a>
              .
            </p>

            {/* Инфо о фильме */}
            <div className="mt-4 px-1 sm:px-2">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {movie.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {movie.originalTitle} · {movie.year}
                  </p>

                  {/* Метрики */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                      <Star className="h-4 w-4 fill-yellow-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" /> {movie.duration} мин
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> {movie.year}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" /> {formatViews(movie.views)}
                    </span>
                    <Badge variant="outline" className="border-white/20">
                      {movie.ageRating}
                    </Badge>
                  </div>

                  {/* Жанры */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <Badge key={g} variant="secondary" className="bg-white/5">
                        {g}
                      </Badge>
                    ))}
                  </div>

                  {/* Описание */}
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">
                    {movie.description}
                  </p>

                  {/* Детали */}
                  <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <Detail icon={Film} label="Режиссёр" value={movie.director} />
                    <Detail icon={Globe} label="Страны" value={movie.countries.join(", ")} />
                    <Detail
                      icon={Users}
                      label="В ролях"
                      value={movie.cast.join(", ")}
                      full
                    />
                  </dl>
                </div>

                {/* Боковые действия */}
                <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:items-stretch">
                  {onAddToFavorites && (
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => onAddToFavorites(movie)}
                    >
                      {isFav ? (
                        <>
                          <Check className="h-4 w-4" /> В избранном
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> В избранное
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="secondary" className="gap-2">
                    <Share2 className="h-4 w-4" /> Поделиться
                  </Button>
                  <Button variant="secondary" className="gap-2" asChild>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        `${movie.originalTitle} ${movie.year} трейлер`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Film className="h-4 w-4" /> Трейлер
                    </a>
                  </Button>
                </div>
              </div>

              {/* Похожие фильмы */}
              {similar.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-lg font-bold">Похожие фильмы</h3>
                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                    {similar.map((m) => (
                      <div key={m.id} className="w-[150px] shrink-0 sm:w-[160px]">
                        <MovieCard movie={m} onPlay={onPlay} variant="row" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  full,
}: {
  icon: typeof Film;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground/90">{value}</dd>
    </div>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
