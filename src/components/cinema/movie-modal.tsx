"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlayerPanel } from "./player-panel";
import { MovieCard } from "./movie-card";
import { ReviewSection } from "./review-section";
import { WatchOnLinks } from "./watch-on-links";
import { useI18n } from "@/lib/i18n";
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
  Send,
  MessageCircle,
  Copy,
  Trophy,
  Lightbulb,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { getExtendedData } from "@/lib/extended-data";
import { findPersonByName, type Person } from "@/lib/persons";
import type { Movie } from "@/lib/types";

interface MovieModalProps {
  movie: Movie | null;
  similar: Movie[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlay: (movie: Movie) => void;
  onAddToFavorites?: (movie: Movie) => void;
  favoriteIds?: Set<string>;
  onPersonClick?: (person: Person) => void;
}

export function MovieModal({
  movie,
  similar,
  open,
  onOpenChange,
  onPlay,
  onAddToFavorites,
  favoriteIds,
  onPersonClick,
}: MovieModalProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const { t } = useI18n();

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
            {/* Панель просмотра — открывает видео в новой вкладке */}
            <PlayerPanel
              key={movie.id}
              kinopoiskId={movie.kinopoiskId}
              title={movie.title}
              originalTitle={movie.originalTitle}
              year={movie.year}
              backdropUrl={movie.backdropUrl}
              posterUrl={movie.posterUrl}
            />

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
                    <dt className="col-span-1 flex items-start gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Film className="mt-0.5 h-3.5 w-3.5" />
                      Режиссёр
                    </dt>
                    <dd className="col-span-1 mt-0.5 text-sm text-foreground/90">
                      {(() => {
                        const person = findPersonByName(movie.director);
                        if (person && onPersonClick) {
                          return (
                            <button
                              onClick={() => onPersonClick(person)}
                              className="text-cinema underline-offset-2 hover:underline"
                            >
                              {movie.director}
                            </button>
                          );
                        }
                        return movie.director;
                      })()}
                    </dd>
                    <Detail icon={Globe} label="Страны" value={movie.countries.join(", ")} />
                    <Detail
                      icon={Users}
                      label="В ролях"
                      value={movie.cast.slice(0, 3).join(", ")}
                      full
                    />
                  </dl>

                  {/* Визуальные чипы актёров (кликабельные) */}
                  {movie.cast.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        Актёрский состав
                      </p>
                      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                        {movie.cast.map((actor) => {
                          const person = findPersonByName(actor);
                          return (
                            <button
                              key={actor}
                              onClick={() => person && onPersonClick(person)}
                              disabled={!person}
                              className="flex w-20 shrink-0 flex-col items-center gap-1.5 transition hover:scale-105"
                            >
                              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-cinema/30 to-zinc-800 text-lg font-black text-white/80">
                                {person?.photo ? (
                                  <img
                                    src={person.photo}
                                    alt={actor}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  actor
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join("")
                                    .toUpperCase()
                                )}
                              </div>
                              <p className="line-clamp-2 text-center text-[11px] leading-tight text-foreground/80">
                                {actor}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Боковые действия */}
                <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  {onAddToFavorites && (
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => onAddToFavorites(movie)}
                    >
                      {isFav ? (
                        <>
                          <Check className="h-4 w-4" /> {t("movie.favorited")}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> {t("movie.favorites")}
                        </>
                      )}
                    </Button>
                  )}
                  <ShareMenu movie={movie} />
                  <Button variant="secondary" className="gap-2" asChild>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        `${movie.originalTitle} ${movie.year} трейлер`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Film className="h-4 w-4" /> {t("movie.trailer")}
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => setShowTrailer((v) => !v)}
                  >
                    <Play className="h-4 w-4" /> {showTrailer ? t("movie.hideTrailer") : t("movie.watchTrailer")}
                  </Button>
                </div>
              </div>

              {/* Встроенный трейлер (YouTube) */}
              {showTrailer && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                        `${movie.originalTitle} ${movie.year} официальный трейлер`
                      )}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Трейлер ${movie.title}`}
                    />
                  </div>
                </div>
              )}

              {/* Партнёрские ссылки — смотреть на платформах */}
              <WatchOnLinks movie={movie} />

              {/* Награды и факты */}
              {(() => {
                const ext = getExtendedData(movie.kinopoiskId);
                if (!ext) return null;
                const hasAwards = ext.awards.length > 0;
                const hasFacts = ext.facts.length > 0;
                if (!hasAwards && !hasFacts) return null;
                return (
                  <div className="mt-8 space-y-6">
                    {/* Топ-250 */}
                    {ext.top250 && (
                      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                        <Trophy className="h-8 w-8 text-amber-500" />
                        <div>
                          <p className="font-bold text-amber-400">#{ext.top250} в Топ-250 Кинопоиска</p>
                          <p className="text-xs text-muted-foreground">Входит в число лучших фильмов всех времён</p>
                        </div>
                      </div>
                    )}

                    {/* Награды */}
                    {hasAwards && (
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          Награды
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {ext.awards.map((aw, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-lg border border-white/10 bg-card/60 px-3 py-2"
                            >
                              <Trophy className="h-4 w-4 text-amber-500" />
                              <div>
                                <p className="text-sm font-medium">{aw.title}</p>
                                {aw.year > 0 && (
                                  <p className="text-xs text-muted-foreground">{aw.year}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Факты */}
                    {hasFacts && (
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Интересные факты
                        </h3>
                        <div className="space-y-2">
                          {ext.facts.map((fact, i) => (
                            <div
                              key={i}
                              className="flex gap-2 rounded-lg border border-white/5 bg-card/40 p-3 text-sm text-foreground/80"
                            >
                              <span className="text-cinema">→</span>
                              <p>{fact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Отзывы и оценки */}
              <ReviewSection movie={movie} />

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

function ShareMenu({ movie }: { movie: Movie }) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kino.kataevweb.ru";
  const filmUrl = `${siteUrl}/?film=${movie.kinopoiskId}`;
  const shareText = `🎬 Смотрите «${movie.title}» (${movie.year}) на КиноВспышке!`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(filmUrl)}&text=${encodeURIComponent(shareText)}`;
  const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(filmUrl)}&title=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + filmUrl)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Share2 className="h-4 w-4" /> Поделиться
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
            <Send className="h-4 w-4 text-cinema" /> Telegram
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={vkUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
            <Share2 className="h-4 w-4" /> ВКонтакте
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard?.writeText(filmUrl);
            toast.success("Ссылка скопирована!", {
              description: filmUrl,
            });
          }}
          className="gap-2"
        >
          <Copy className="h-4 w-4" /> Копировать ссылку
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
