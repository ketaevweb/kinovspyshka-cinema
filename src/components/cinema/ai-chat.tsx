"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Movie } from "@/lib/types";

interface MentionedMovie {
  title: string;
  slug: string;
  kinopoiskId: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  mentionedMovies?: MentionedMovie[];
}

const SUGGESTIONS = [
  "Что посмотреть вечером?",
  "Порекомендуй аниме для новичка",
  "Найди фильм с Леонардо ДиКаприо",
  "Лучшие советские комедии",
  "Фильмы похожие на «Начало»",
];

interface AIChatProps {
  onMovieClick?: (slug: string) => void;
}

export function AIChat({ onMovieClick }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Глобальный обработчик клика по фильму из AI-чата
  const handleMovieClick = (slug: string) => {
    if (onMovieClick) {
      onMovieClick(slug);
    } else {
      // Fallback: диспатчим глобальное событие
      window.dispatchEvent(new CustomEvent("cinema:open-movie", { detail: slug }));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            mentionedMovies: data.mentionedMovies || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Извините, произошла ошибка. Попробуйте ещё раз." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ошибка сети. Проверьте подключение." },
      ]);
    }
    setLoading(false);
  };

  // Рендер текста с подсветкой названий фильмов
  const renderContent = (content: string, mentioned: MentionedMovie[] | undefined) => {
    if (!mentioned || mentioned.length === 0) {
      return <span className="whitespace-pre-wrap">{content}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /[«""]([^»""]+)[»""]/g;
    let match;
    let key = 0;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
      }
      const title = match[1].trim();
      const movie = mentioned.find((m) => m.title.toLowerCase() === title.toLowerCase());
      if (movie) {
        parts.push(
          <button
            key={key++}
            onClick={() => handleMovieClick(movie.slug)}
            className="inline-flex items-center gap-1 rounded bg-cinema/15 px-1.5 py-0.5 text-cinema transition hover:bg-cinema/25"
          >
            <Film className="h-3 w-3" />
            {match[0]}
          </button>
        );
      } else {
        parts.push(<span key={key++} className="font-semibold text-cinema">{match[0]}</span>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(<span key={key++}>{content.slice(lastIndex)}</span>);
    }

    return <span className="whitespace-pre-wrap">{parts}</span>;
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cinema text-white shadow-[0_0_30px_oklch(0.605_0.234_27.4/0.5)] transition-all hover:scale-110",
          open && "rotate-90"
        )}
        aria-label="AI-ассистент"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Чат */}
      {open && (
        <div className="fixed bottom-24 left-6 z-40 flex h-[460px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl">
          {/* Заголовок */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-cinema/5 px-4 py-3">
            <Bot className="h-5 w-5 text-cinema" />
            <div>
              <p className="text-sm font-bold">КиноАссистент</p>
              <p className="text-[10px] text-muted-foreground">AI · 1258 фильмов в каталоге · GLM-4.5</p>
            </div>
          </div>

          {/* Сообщения */}
          <div ref={scrollRef} className="cinema-scroll flex-1 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Sparkles className="h-10 w-10 text-cinema/40" />
                <p className="text-sm text-muted-foreground">
                  Привет! Я КиноАссистент. Спросите меня о фильмах, попросите рекомендацию или опишите, что хотите посмотреть.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-white/10 bg-background/40 px-2.5 py-1 text-[11px] text-foreground/70 transition hover:border-cinema/40 hover:text-cinema"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "mb-2 flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-cinema text-white"
                      : "bg-background/60 text-foreground/90"
                  )}
                >
                  {renderContent(m.content, m.mentionedMovies)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-xl bg-background/60 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cinema" />
                  <span className="text-xs text-muted-foreground">Подбираю фильмы...</span>
                </div>
              </div>
            )}
          </div>

          {/* Поле ввода */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 border-t border-white/5 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросите о фильмах..."
              className="flex-1 rounded-full bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-cinema/50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cinema text-white transition hover:bg-cinema/90 disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
