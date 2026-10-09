"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AccentColor = "red" | "green" | "purple" | "blue" | "orange";

const COLORS: Record<AccentColor, { name: string; hex: string; oklch: string; flag: string }> = {
  red: { name: "Красный", hex: "#e50914", oklch: "0.605 0.234 27.4", flag: "🇷🇺" },
  green: { name: "Зелёный", hex: "#00b894", oklch: "0.65 0.17 165", flag: "🌿" },
  purple: { name: "Фиолетовый", hex: "#a855f7", oklch: "0.55 0.25 300", flag: "🔮" },
  blue: { name: "Синий", hex: "#3b82f6", oklch: "0.55 0.2 250", flag: "🌊" },
  orange: { name: "Оранжевый", hex: "#f97316", oklch: "0.7 0.19 55", flag: "🔥" },
};

const STORAGE_KEY = "cinema:accent";

export function AccentToggle() {
  const [accent, setAccent] = useState<AccentColor>("red");

  const applyAccent = useCallback((color: AccentColor) => {
    const root = document.documentElement;
    const c = COLORS[color];
    root.style.setProperty("--cinema", c.oklch);
    root.style.setProperty("--primary", c.oklch);
    root.style.setProperty("--ring", c.oklch);
    root.style.setProperty("--sidebar-primary", c.oklch);
    root.style.setProperty("--destructive", c.oklch);
    root.style.setProperty("--chart-1", c.oklch);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as AccentColor | null;
        if (saved && COLORS[saved]) {
          setAccent(saved);
          applyAccent(saved);
        }
      } catch {
        /* ignore */
      }
    });
  }, [applyAccent]);

  const changeAccent = (color: AccentColor) => {
    setAccent(color);
    applyAccent(color);
    try {
      localStorage.setItem(STORAGE_KEY, color);
    } catch {
      /* ignore */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full border border-white/10 bg-card" aria-label="Цвет акцента">
          <Palette className="h-4 w-4" style={{ color: COLORS[accent].hex }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Цвет акцента</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(COLORS) as AccentColor[]).map((key) => {
          const c = COLORS[key];
          const active = accent === key;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => changeAccent(key)}
              className="gap-2"
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2",
                  active ? "border-white" : "border-transparent"
                )}
                style={{ backgroundColor: c.hex }}
              />
              <span className="flex-1">{c.flag} {c.name}</span>
              {active && <span className="text-xs">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
