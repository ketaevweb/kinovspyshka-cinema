"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  Film,
  TrendingUp,
  Sparkles,
  Heart,
  GitCompare,
  Sun,
  Moon,
  Languages,
  LogIn,
  Play,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Movie } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allMovies: Movie[];
  favoritesCount: number;
  onPlay: (movie: Movie) => void;
  onNavigate: (anchor: string) => void;
  onCompare: () => void;
  onLogin: () => void;
  isAuthed: boolean;
}

export function CommandPalette({
  open,
  onOpenChange,
  allMovies,
  favoritesCount,
  onPlay,
  onNavigate,
  onCompare,
  onLogin,
  isAuthed,
}: CommandPaletteProps) {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  // Производный поиск — без setState в effect
  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allMovies
      .filter((m) =>
        [m.title, m.originalTitle, String(m.year), m.genres.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 8);
  }, [debouncedQuery, allMovies]);

  // Глобальный hotkey Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const handleNavigate = useCallback(
    (anchor: string) => {
      onOpenChange(false);
      onNavigate(anchor);
    },
    [onOpenChange, onNavigate]
  );

  const handlePlay = useCallback(
    (movie: Movie) => {
      onOpenChange(false);
      onPlay(movie);
    },
    [onOpenChange, onPlay]
  );

  const toggleTheme = useCallback(() => {
    onOpenChange(false);
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Поиск фильма или команда..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>Ничего не найдено. Попробуйте другой запрос.</CommandEmpty>

        {/* Результаты поиска фильмов */}
        {results.length > 0 && (
          <CommandGroup heading="Фильмы" className="text-muted-foreground">
            {results.map((m) => (
              <CommandItem
                key={m.id}
                value={`${m.title} ${m.year}`}
                onSelect={() => handlePlay(m)}
                className="gap-3"
              >
                <Film className="h-4 w-4 shrink-0 text-cinema" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate font-medium">{m.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {m.year} · ★ {m.rating.toFixed(1)}
                  </span>
                </div>
                <Play className="h-3.5 w-3.5 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Быстрая навигация */}
        {!query && (
          <>
            <CommandGroup heading="Навигация" className="text-muted-foreground">
              <CommandItem onSelect={() => handleNavigate("#hero")} className="gap-3">
                <Play className="h-4 w-4 text-cinema" />
                Главная
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("#catalog")} className="gap-3">
                <Film className="h-4 w-4 text-cinema" />
                Каталог
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("#trending")} className="gap-3">
                <TrendingUp className="h-4 w-4 text-cinema" />
                В тренде
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("#new")} className="gap-3">
                <Sparkles className="h-4 w-4 text-cinema" />
                Новинки
              </CommandItem>
              <CommandItem onSelect={() => handleNavigate("#search")} className="gap-3">
                <Search className="h-4 w-4 text-cinema" />
                Поиск
              </CommandItem>
              {favoritesCount > 0 && (
                <CommandItem onSelect={() => handleNavigate("#favorites")} className="gap-3">
                  <Heart className="h-4 w-4 fill-cinema text-cinema" />
                  Избранное ({favoritesCount})
                </CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Действия" className="text-muted-foreground">
              <CommandItem onSelect={() => { onOpenChange(false); onCompare(); }} className="gap-3">
                <GitCompare className="h-4 w-4 text-cinema" />
                Сравнить фильмы
              </CommandItem>
              <CommandItem onSelect={toggleTheme} className="gap-3">
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 text-cinema" />
                    Светлая тема
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-cinema" />
                    Тёмная тема
                  </>
                )}
              </CommandItem>
              {!isAuthed && (
                <CommandItem onSelect={() => { onOpenChange(false); onLogin(); }} className="gap-3">
                  <LogIn className="h-4 w-4 text-cinema" />
                  Войти
                </CommandItem>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Подсказки" className="text-muted-foreground">
              <CommandItem disabled className="gap-3 opacity-60">
                <Languages className="h-4 w-4" />
                <span className="text-xs">
                  Нажмите <kbd className="rounded bg-muted px-1">⌘K</kbd> для открытия ·
                  Введите название для поиска · Стрелки для навигации
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
