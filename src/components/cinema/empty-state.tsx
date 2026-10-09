"use client";

import { Heart, History, SearchX, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  variant: "favorites" | "history" | "search";
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const CONFIG = {
  favorites: {
    icon: Heart,
    title: "Пока нет избранного",
    description: "Добавляйте фильмы в избранное кнопкой ♥ — они появятся здесь",
    actionLabel: "Смотреть каталог",
  },
  history: {
    icon: History,
    title: "История пуста",
    description: "Открывайте фильмы — они появятся в этой секции",
    actionLabel: "Начать просмотр",
  },
  search: {
    icon: SearchX,
    title: "Ничего не найдено",
    description: "Попробуйте изменить запрос или фильтры",
    actionLabel: "Сбросить фильтры",
  },
};

export function EmptyState({ variant, className, onAction, actionLabel }: EmptyStateProps) {
  const config = CONFIG[variant];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cinema/10">
        <Icon className="h-8 w-8 text-cinema/60" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{config.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cinema px-4 py-2 text-sm font-medium text-white transition hover:bg-cinema/90"
        >
          <Film className="h-4 w-4" />
          {actionLabel ?? config.actionLabel}
        </button>
      )}
    </div>
  );
}
