"use client";

import { useState } from "react";
import { SlidersHorizontal, X, Star, Calendar, Globe2, ArrowUpDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Genre } from "@/lib/types";
import type { SortOption } from "@/lib/movies";

export interface FilterState {
  genre: string;
  country: string;
  yearFrom: number;
  yearTo: number;
  ratingFrom: number;
  ratingTo: number;
  sort: SortOption;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  genres: Genre[];
  countries: Genre[];
  yearRange: { min: number; max: number };
  resultCount: number;
}

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: "rating-desc", labelKey: "sort.ratingDesc" },
  { value: "rating-asc", labelKey: "sort.ratingAsc" },
  { value: "year-desc", labelKey: "sort.yearDesc" },
  { value: "year-asc", labelKey: "sort.yearAsc" },
  { value: "views-desc", labelKey: "sort.viewsDesc" },
  { value: "title-asc", labelKey: "sort.titleAsc" },
];

export function FilterPanel({
  filters,
  onChange,
  onReset,
  genres,
  countries,
  yearRange,
  resultCount,
}: FilterPanelProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<FilterState>) => {
    onChange({ ...filters, ...patch });
  };

  const activeCount =
    (filters.genre !== "Все" ? 1 : 0) +
    (filters.country !== "Все" ? 1 : 0) +
    (filters.yearFrom > yearRange.min || filters.yearTo < yearRange.max ? 1 : 0) +
    (filters.ratingFrom > 0 || filters.ratingTo < 10 ? 1 : 0) +
    (filters.sort !== "rating-desc" ? 1 : 0);

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "gap-2 rounded-full border-white/10 bg-card",
            open && "border-cinema text-cinema",
            activeCount > 0 && "border-cinema"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters.title")}
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cinema px-1.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Сортировка — всегда видна */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={filters.sort} onValueChange={(v) => update({ sort: v as SortOption })}>
            <SelectTrigger className="h-9 w-[180px] rounded-full border-white/10 bg-card text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 rounded-full text-xs text-muted-foreground hover:text-cinema"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("filters.reset")}
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {t("filters.found")}: <span className="font-semibold text-foreground">{resultCount}</span>
        </span>
      </div>

      {/* Раскрывающаяся панель фильтров */}
      {open && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-card/80 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("filters.advanced")}</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              aria-label="Закрыть фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* Жанр */}
            <FilterGroup icon={Star} label={t("filters.genre")}>
              <Select value={filters.genre} onValueChange={(v) => update({ genre: v })}>
                <SelectTrigger className="h-9 w-full rounded-lg border-white/10 bg-background/60 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {genres.map((g) => (
                    <SelectItem key={g.name} value={g.name}>
                      {g.name} ({g.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>

            {/* Страна */}
            <FilterGroup icon={Globe2} label={t("filters.country")}>
              <Select value={filters.country} onValueChange={(v) => update({ country: v })}>
                <SelectTrigger className="h-9 w-full rounded-lg border-white/10 bg-background/60 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {countries.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>

            {/* Год: диапазон */}
            <FilterGroup icon={Calendar} label={`${t("filters.year")}: ${filters.yearFrom} — ${filters.yearTo}`}>
              <div className="px-2 pt-3">
                <Slider
                  value={[filters.yearFrom, filters.yearTo]}
                  min={yearRange.min}
                  max={yearRange.max}
                  step={1}
                  onValueChange={(val) => update({ yearFrom: val[0], yearTo: val[1] })}
                  className="py-1"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{yearRange.min}</span>
                  <span>{yearRange.max}</span>
                </div>
              </div>
            </FilterGroup>

            {/* Рейтинг: диапазон */}
            <FilterGroup
              icon={Star}
              label={`${t("filters.rating")}: ${filters.ratingFrom.toFixed(1)} — ${filters.ratingTo.toFixed(1)}`}
            >
              <div className="px-2 pt-3">
                <Slider
                  value={[filters.ratingFrom, filters.ratingTo]}
                  min={0}
                  max={10}
                  step={0.1}
                  onValueChange={(val) =>
                    update({ ratingFrom: val[0], ratingTo: val[1] })
                  }
                  className="py-1"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>0.0</span>
                  <span>10.0</span>
                </div>
              </div>
            </FilterGroup>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Star;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      {children}
    </div>
  );
}
