"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ src, poster, title, autoPlay = false, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Синхронизируем свойство muted с video-элементом (React prop `muted` ненадёжен)
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const seek = useCallback((time: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(time, v.duration || 0));
    setCurrent(v.currentTime);
  }, []);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    seek(v.currentTime + delta);
  }, [seek]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const setVideoVolume = useCallback((vol: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = vol;
    v.muted = vol === 0;
    setVolume(vol);
    setMuted(vol === 0);
  }, []);

  const changeSpeed = useCallback((s: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = s;
    setSpeed(s);
    setShowSpeed(false);
  }, []);

  // Автоскрытие контролов
  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
      revealControls();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
  }, [togglePlay, skip, toggleMute, toggleFullscreen, revealControls]);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="group relative aspect-video w-full select-none overflow-hidden rounded-xl bg-black outline-none"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        // Клик по видео (не по контролам) — play/pause
        if ((e.target as HTMLElement).tagName === "VIDEO") togglePlay();
      }}
      role="region"
      aria-label={`Видеоплеер: ${title}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        className="h-full w-full bg-black"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          revealControls();
        }}
        onPause={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (videoRef.current) videoRef.current.muted = muted;
          setLoading(false);
        }}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length > 0) {
            setBuffered(v.buffered.end(v.buffered.length - 1));
          }
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onEnded={() => {
          setPlaying(false);
          setShowControls(true);
          onEnded?.();
        }}
      />

      {/* Большая центральная кнопка play/pause */}
      {!playing && !loading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center"
          aria-label="Воспроизвести"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cinema/90 text-white shadow-2xl transition hover:scale-110 hover:bg-cinema">
            <Play className="h-7 w-7 translate-x-0.5 fill-white" />
          </span>
        </button>
      )}

      {/* Спиннер загрузки */}
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-cinema" />
        </div>
      )}

      {/* Подсказка включить звук (когда играет без звука) */}
      {playing && muted && (
        <button
          onClick={toggleMute}
          className="absolute right-3 top-3 z-30 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-cinema"
        >
          <VolumeX className="h-4 w-4" />
          Включить звук
        </button>
      )}

      {/* Градиент под контролы */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 sm:px-4",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Прогресс-бар */}
        <div className="group/bar relative mb-2 h-1.5 w-full cursor-pointer rounded-full bg-white/25">
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            style={{ width: `${bufferedPct}%` }}
          />
          {/* Progress */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-cinema"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cinema opacity-0 shadow transition group-hover/bar:opacity-100"
            style={{ left: `${progress}%` }}
          />
          {/* Clickable overlay */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => seek(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
            aria-label="Перемотка"
          />
        </div>

        {/* Кнопки управления */}
        <div className="flex items-center gap-2 text-white">
          <button onClick={togglePlay} className="p-1.5 transition hover:text-cinema" aria-label={playing ? "Пауза" : "Воспроизвести"}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
          </button>
          <button onClick={() => skip(-10)} className="p-1.5 transition hover:text-cinema" aria-label="Назад 10 секунд">
            <RotateCcw className="h-5 w-5" />
          </button>
          <button onClick={() => skip(10)} className="p-1.5 transition hover:text-cinema" aria-label="Вперёд 10 секунд">
            <RotateCw className="h-5 w-5" />
          </button>

          {/* Громкость */}
          <div className="group/vol flex items-center gap-1">
            <button onClick={toggleMute} className="p-1.5 transition hover:text-cinema" aria-label={muted ? "Включить звук" : "Выключить звук"}>
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVideoVolume(Number(e.target.value))}
              className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100 accent-cinema"
              aria-label="Громкость"
            />
          </div>

          {/* Время */}
          <span className="ml-1 select-none text-xs font-medium tabular-nums text-white/90">
            {formatTime(current)} <span className="text-white/50">/ {formatTime(duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-1">
            {/* Скорость */}
            <div className="relative">
              <button
                onClick={() => setShowSpeed((s) => !s)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition hover:text-cinema"
                aria-label="Скорость воспроизведения"
              >
                <Settings className="h-4 w-4" />
                {speed}×
              </button>
              {showSpeed && (
                <div className="absolute bottom-full right-0 mb-2 w-24 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 py-1 backdrop-blur">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={cn(
                        "block w-full px-3 py-1.5 text-left text-xs transition hover:bg-cinema/20",
                        s === speed ? "text-cinema" : "text-white/80"
                      )}
                    >
                      {s}× {s === 1 && "(норм.)"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="p-1.5 transition hover:text-cinema" aria-label={fullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}>
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
