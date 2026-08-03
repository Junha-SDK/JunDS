"use client";
import { useEffect, useRef } from "react";

export type HotkeyHandler = (e: KeyboardEvent) => void;
export type HotkeyMap = Record<string, HotkeyHandler>;

export interface UseHotkeysOptions {
  /** 입력 요소(input/textarea/contenteditable)에서도 활성화 */
  enableOnFormTags?: boolean;
  /** 활성화 여부 (false면 리스너 미등록) */
  enabled?: boolean;
  /** 리스너 부착 대상 (기본 window) */
  target?: Window | HTMLElement | null;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function normalizeChord(chord: string): string {
  return chord
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .map((p) => {
      if (p === "mod") return isMac ? "meta" : "ctrl";
      if (p === "cmd") return "meta";
      if (p === "control") return "ctrl";
      if (p === "option") return "alt";
      if (p === "esc") return "escape";
      if (p === "space") return " ";
      return p;
    })
    .sort()
    .join("+");
}

function eventToChord(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.metaKey) parts.push("meta");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  const key = e.key.toLowerCase();
  if (!["control", "meta", "alt", "shift"].includes(key)) parts.push(key);
  return parts.sort().join("+");
}

/**
 * 키보드 단축키 (콤보 지원: "mod+k", "shift+?", "ctrl+alt+l").
 * `mod` = mac에서는 cmd, 그외 ctrl.
 * @example
 * useHotkeys({ "mod+k": () => openPalette(), "escape": () => close() });
 */
export function useHotkeys(map: HotkeyMap, options: UseHotkeysOptions = {}) {
  const { enableOnFormTags = false, enabled = true, target } = options;
  const handlersRef = useRef(map);
  handlersRef.current = map;

  useEffect(() => {
    if (!enabled) return;
    const el: EventTarget =
      target ?? (typeof window !== "undefined" ? window : ({} as EventTarget));
    if (!("addEventListener" in el)) return;

    const normalized = new Map<string, HotkeyHandler>();
    for (const [k, v] of Object.entries(handlersRef.current)) {
      normalized.set(normalizeChord(k), v);
    }

    const handler = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (!enableOnFormTags) {
        const t = ke.target as HTMLElement | null;
        if (
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.tagName === "SELECT" ||
            t.isContentEditable)
        )
          return;
      }
      const chord = eventToChord(ke);
      const fn = normalized.get(chord);
      if (fn) fn(ke);
    };

    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [enabled, enableOnFormTags, target]);
}
