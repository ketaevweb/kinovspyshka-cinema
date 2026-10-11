"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Play, Search, Menu, LogIn, LogOut, Heart, GitCompare, Shuffle, User, Clock, Star, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthDialog } from "./auth-dialog";
import { ThemeToggle } from "./theme-toggle";
import { LangToggle } from "./lang-toggle";
import { AccentToggle } from "./accent-toggle";
import { MobileMenu } from "./mobile-menu";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearchClick: () => void;
  onLogoClick: () => void;
  favoritesCount?: number;
  onFavoritesClick?: () => void;
  onCompareClick?: () => void;
  compareCount?: number;
  onRandomClick?: () => void;
  onProfileClick?: () => void;
  watchHistoryCount?: number;
  authOpen?: boolean;
  onAuthOpenChange?: (open: boolean) => void;
}

export function Header({
  onSearchClick,
  onLogoClick,
  favoritesCount = 0,
  onFavoritesClick,
  onCompareClick,
  compareCount = 0,
  onRandomClick,
  onProfileClick,
  watchHistoryCount = 0,
  authOpen,
  onAuthOpenChange,
}: HeaderProps) {
  const { data: session, status } = useSession();
  const [internalAuthOpen, setInternalAuthOpen] = useState(false);
  const authenticated = status === "authenticated";

  const isAuthOpen = authOpen ?? internalAuthOpen;
  const setAuthOpen = onAuthOpenChange ?? setInternalAuthOpen;
  const { t } = useI18n();

  const userName = session?.user?.name || session?.user?.email || "Пользователь";
  const initials = userName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onLogoClick}
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label={t("nav.home")}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cinema shadow-[0_0_20px_oklch(0.605_0.234_27.4/0.5)]">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Кино<span className="text-cinema">Вспышка</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: t("nav.home"), href: "#hero" },
            { label: t("nav.catalog"), href: "#catalog" },
            { label: t("nav.trending"), href: "#trending" },
            { label: t("nav.new"), href: "#new" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className={cn("gap-2 text-muted-foreground hover:text-foreground")}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.search")}</span>
          </Button>

          <ThemeToggle />
          <AccentToggle />
          <LangToggle />

          {/* Кнопка случайного фильма */}
          {onRandomClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRandomClick}
              className="gap-1.5 text-muted-foreground transition hover:text-cinema"
              title="Случайный фильм"
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden lg:inline">Случайное</span>
            </Button>
          )}

          {/* Кнопка сравнения */}
          {onCompareClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCompareClick}
              className={cn(
                "gap-1.5 text-muted-foreground transition hover:text-cinema",
                compareCount > 0 && "text-cinema"
              )}
            >
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.compare")}</span>
              {compareCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cinema px-1 text-xs font-bold text-white">
                  {compareCount}
                </span>
              )}
            </Button>
          )}

          {/* Кнопка избранного */}
          {favoritesCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavoritesClick}
              className="gap-1.5 text-muted-foreground hover:text-cinema"
            >
              <Heart className="h-4 w-4 fill-cinema text-cinema" />
              <span className="hidden sm:inline">{favoritesCount}</span>
            </Button>
          )}

          {/* Кнопка входа / пользовательское меню */}
          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-card pl-1 pr-3 py-1 transition hover:border-cinema">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-cinema/20 text-xs font-bold text-cinema">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">
                    {userName.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{userName}</span>
                  {session?.user?.email && (
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onProfileClick && (
                  <DropdownMenuItem onClick={onProfileClick} className="gap-2">
                    <User className="h-4 w-4" />
                    Мой профиль
                  </DropdownMenuItem>
                )}
                {favoritesCount > 0 && (
                  <DropdownMenuItem onClick={onFavoritesClick} className="gap-2">
                    <Heart className="h-4 w-4 fill-cinema text-cinema" />
                    {t("catalog.favorites")} ({favoritesCount})
                  </DropdownMenuItem>
                )}
                {watchHistoryCount > 0 && (
                  <DropdownMenuItem onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })} className="gap-2">
                    <Clock className="h-4 w-4" />
                    История ({watchHistoryCount})
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })} className="gap-2">
                  <Film className="h-4 w-4" />
                  Каталог
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-2 text-red-400 focus:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="gap-2 bg-cinema text-white hover:bg-cinema/90"
              onClick={() => setAuthOpen(true)}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.login")}</span>
            </Button>
          )}

          <MobileMenu
            onNavigate={(anchor) => document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" })}
            onRandomClick={onRandomClick}
            onCompareClick={onCompareClick}
            favoritesCount={favoritesCount}
            watchHistoryCount={watchHistoryCount}
          />
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Меню">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
