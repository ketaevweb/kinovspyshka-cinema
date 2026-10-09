"use client";

import { Heart, History, SearchX, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface EmptyStateProps {
  variant: "favorites" | "history" | "search";
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ variant, className, onAction, actionLabel }: EmptyStateProps) {
  const { t } = useI18n();

  const config = {
    favorites: {
      icon: Heart,
      title: t("empty.favorites.title"),
      description: t("empty.favorites.description"),
      actionLabel: t("empty.favorites.action"),
    },
    history: {
      icon: History,
      title: t("empty.history.title"),
      description: t("empty.history.description"),
      actionLabel: t("empty.history.action"),
    },
    search: {
      icon: SearchX,
      title: t("empty.search.title"),
      description: t("empty.search.description"),
      actionLabel: t("empty.search.action"),
    },
  }[variant];

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
