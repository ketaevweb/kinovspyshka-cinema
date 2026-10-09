"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Send, Loader2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Movie } from "@/lib/types";

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  author: string;
}

interface ReviewSectionProps {
  movie: Movie;
}

export function ReviewSection({ movie }: ReviewSectionProps) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Загрузка отзывов
  useEffect(() => {
    let active = true;
    fetch(`/api/reviews?movieId=${encodeURIComponent(movie.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setReviews(data.reviews ?? []);
        setAvgRating(data.avgRating ?? null);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [movie.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error(t("review.loginRequired"));
      return;
    }
    if (userRating === 0) {
      toast.error(t("review.ratingRequired"));
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error(t("review.tooShort"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          kinopoiskId: movie.kinopoiskId,
          rating: userRating,
          text: reviewText.trim(),
        }),
      });
      if (res.ok) {
        toast.success(t("review.published"));
        setReviewText("");
        setUserRating(0);
        // Перезагружаем отзывы
        const data = await fetch(`/api/reviews?movieId=${encodeURIComponent(movie.id)}`).then((r) => r.json());
        setReviews(data.reviews ?? []);
        setAvgRating(data.avgRating ?? null);
      } else {
        const err = await res.json();
        toast.error(err.error || t("auth.error"));
      }
    } catch {
      toast.error(t("auth.networkError"));
    }
    setSubmitting(false);
  };

  const handleLike = async (reviewId: string) => {
    if (!session) {
      toast.error(t("review.loginToReview"));
      return;
    }
    const wasLiked = likedReviews[reviewId];
    // Оптимистичное обновление
    setLikedReviews((prev) => ({ ...prev, [reviewId]: !wasLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + (wasLiked ? -1 : 1),
    }));
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Откат при ошибке
        setLikedReviews((prev) => ({ ...prev, [reviewId]: wasLiked }));
        setLikeCounts((prev) => ({
          ...prev,
          [reviewId]: (prev[reviewId] || 0) + (wasLiked ? 1 : -1),
        }));
      }
    } catch {
      setLikedReviews((prev) => ({ ...prev, [reviewId]: wasLiked }));
    }
  };

  return (
    <div className="mt-8">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <MessageSquare className="h-5 w-5 text-cinema" />
        {t("review.title")}
      </h3>

      {/* Средняя оценка пользователей */}
      {avgRating !== null && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-card/40 p-4">
          <div className="flex items-center gap-1 text-2xl font-bold text-yellow-400">
            <Star className="h-6 w-6 fill-yellow-400" />
            {avgRating.toFixed(1)}
          </div>
          <div>
            <p className="text-sm font-medium">{t("review.usersRating")}</p>
            <p className="text-xs text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? t("review.reviewSingular") : t("review.reviewPlural")} · {t("review.kinopoisk")}: ★ {movie.rating.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Форма отзыва */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("review.yourRating")}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(star)}
                  className="transition"
                  aria-label={`${star}/10`}
                >
                  <Star
                    className={cn(
                      "h-5 w-5 transition",
                      star <= (hoverRating || userRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder={t("review.placeholder")}
            rows={3}
            className="bg-background/60"
          />
          <Button type="submit" disabled={submitting} className="gap-2 bg-cinema hover:bg-cinema/90">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("review.publish")}
          </Button>
        </form>
      ) : (
        <div className="mb-6 rounded-xl border border-white/5 bg-card/30 p-4 text-center text-sm text-muted-foreground">
          {t("review.loginToReview")}
        </div>
      )}

      {/* Список отзывов */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-cinema" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t("review.noReviews")}
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/5 bg-card/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cinema/20 text-xs font-bold text-cinema">
                    {r.author[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                  <Star className="h-4 w-4 fill-yellow-400" />
                  {r.rating}/10
                </div>
              </div>
              <p className="text-sm text-foreground/80">{r.text}</p>
              {/* Кнопка лайка */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleLike(r.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                    likedReviews[r.id]
                      ? "border-cinema bg-cinema/10 text-cinema"
                      : "border-white/10 text-muted-foreground hover:border-cinema/50 hover:text-foreground"
                  )}
                >
                  <ThumbsUp className={cn("h-3.5 w-3.5", likedReviews[r.id] && "fill-cinema")} />
                  {likedReviews[r.id] ? "Полезно" : "Полезно"}
                  {likeCounts[r.id] ? ` · ${likeCounts[r.id]}` : ""}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
