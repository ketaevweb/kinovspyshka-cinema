"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Person } from "@/lib/persons";
import type { Movie } from "@/lib/types";

interface PersonDialogProps {
  person: Person | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allMovies: Movie[];
  onPlay: (movie: Movie) => void;
}

export function PersonDialog({
  person,
  open,
  onOpenChange,
  allMovies,
  onPlay,
}: PersonDialogProps) {
  const { t } = useI18n();
  if (!person) return null;

  // Фильмы из каталога, где снималась персона
  const filmographyMovies = person.filmography
    .map((f) => allMovies.find((m) => m.id === f.slug))
    .filter(Boolean) as Movie[];

  const profLabel = person.profession === "director" ? t("person.director") : t("person.actor");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-3xl overflow-hidden border-white/10 bg-background/95 p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">{person.name}</DialogTitle>
        <ScrollArea className="cinema-scroll max-h-[92vh]">
          <div className="p-4 sm:p-6">
            {/* Шапка персоны */}
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-cinema/30">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl font-black text-white/40">
                    {person.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{person.name}</h2>
                {person.enName && (
                  <p className="text-sm text-muted-foreground">{person.enName}</p>
                )}
                <span className="mt-2 inline-block rounded-full bg-cinema/15 px-3 py-1 text-xs font-medium text-cinema">
                  {profLabel}
                </span>
              </div>
            </div>

            {/* Фильмография */}
            {filmographyMovies.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <Film className="h-5 w-5 text-cinema" />
                  {t("person.filmography")} ({filmographyMovies.length})
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filmographyMovies.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onOpenChange(false);
                        onPlay(m);
                      }}
                      className="group overflow-hidden rounded-lg border border-white/5 bg-card text-left transition hover:border-cinema/50"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-semibold">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.year} · ★ {m.rating.toFixed(1)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filmographyMovies.length === 0 && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {t("person.noMovies", { name: person.name })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
