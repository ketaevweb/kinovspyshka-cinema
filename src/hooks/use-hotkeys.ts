"use client";

import { useEffect } from "react";

interface HotkeyConfig {
  key: string;
  handler: () => void;
  /** Не срабатывать когда фокус в input/textarea */
  skipInputs?: boolean;
}

/**
 * Хук для регистрации глобальных горячих клавиш.
 * Автоматически пропускает события из input/textarea/contenteditable.
 */
export function useHotkeys(hotkeys: HotkeyConfig[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Пропускаем если фокус в поле ввода (если skipInputs не false)
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const hotkey of hotkeys) {
        if (hotkey.skipInputs !== false && inInput) continue;
        if (e.key.toLowerCase() === hotkey.key.toLowerCase()) {
          e.preventDefault();
          hotkey.handler();
          break;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [hotkeys]);
}
