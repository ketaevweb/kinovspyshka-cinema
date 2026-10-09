"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

export function HeroCarousel({ movies, onPlay, onInfo }: HeroCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  // Автопрокрутка
  useEffect(() => {
    if (!embla || movies.length <= 1) return;
    const id = setInterval(() => embla.scrollNext(), 7000);
    return () => clearInterval(id);
  }, [embla, movies.length]);

  if (movies.length === 0) return null;

  return (
    <section id="hero" className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="relative min-w-0 flex-[0_0_100%]"
            >
              {/* Backdrop */}
              <div className="relative h-[60vh] min-h-[420px] w-full sm:h-[68vh] md:h-[78vh]">
                <BackdropImage src={movie.backdropUrl} alt={movie.title} />
                {/* Градиенты для читаемости */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

                {/* Контент */}
                <div className="absolute inset-0 flex items-end">
                  <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 md:pb-20 lg:px-8">
                    <div className="max-w-2xl">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge className="bg-cinema text-white hover:bg-cinema">
                          В центре внимания
                        </Badge>
                        {movie.trending && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            В тренде
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
                        {movie.title}
                      </h1>
                      <p className="mt-1 text-sm font-medium text-white/70 sm:text-base">
                        {movie.originalTitle} · {movie.year}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                        <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          {movie.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>{movie.duration} мин</span>
                        <span>·</span>
                        <span>{movie.genres.join(", ")}</span>
                        <span>·</span>
                        <span className="rounded border border-white/30 px-1.5 py-0.5 text-xs">
                          {movie.ageRating}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 max-w-xl text-sm text-white/80 sm:text-base">
                        {movie.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Button
                          size="lg"
                          onClick={() => onPlay(movie)}
                          className="gap-2 bg-cinema text-white hover:bg-cinema/90"
                        >
                          <Play className="h-5 w-5 fill-white" />
                          Смотреть
                        </Button>
                        <Button
                          size="lg"
                          variant="secondary"
                          onClick={() => onInfo(movie)}
                          className="gap-2 bg-white/15 text-white backdrop-blur hover:bg-white/25"
                        >
                          <Info className="h-5 w-5" />
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Стрелки */}
      {movies.length > 1 && (
        <>
          <button
            onClick={() => embla?.scrollPrev()}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-cinema md:flex"
            aria-label="Назад"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => embla?.scrollNext()}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-cinema md:flex"
            aria-label="Вперёд"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Точки */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Слайд ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === selectedIndex ? "w-7 bg-cinema" : "w-2 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function BackdropImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="absolute inset-0">
      {src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
      )}
    </div>
  );
}
