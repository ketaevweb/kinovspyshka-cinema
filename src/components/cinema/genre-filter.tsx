"use client";

import { cn } from "@/lib/utils";
import type { Genre } from "@/lib/types";

interface GenreFilterProps {
  genres: Genre[];
  selected: string;
  onSelect: (genre: string) => void;
}

export function GenreFilter({ genres, selected, onSelect }: GenreFilterProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
      {genres.map((g) => {
        const active = selected === g.name;
        return (
          <button
            key={g.name}
            onClick={() => onSelect(g.name)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              active
                ? "border-cinema bg-cinema text-white shadow-[0_0_18px_oklch(0.605_0.234_27.4/0.4)]"
                : "border-white/10 bg-card/60 text-muted-foreground hover:border-white/25 hover:text-foreground"
            )}
          >
            {g.name}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                active ? "bg-white/20" : "bg-white/5"
              )}
            >
              {g.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
