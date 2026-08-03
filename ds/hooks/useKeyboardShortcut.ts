"use client";
import { useEffect, useRef } from "react";

export type KeyboardShortcut = string | string[];

export interface UseKeyboardShortcutOptions {
  /** 활성/비활성 (기본 true) */
  enabled?: boolean;
  /** input/textarea 포커스 시에도 트리거 (기본 false) */
  allowInInputs?: boolean;
  /** preventDefault 호출 (기본 true) */
  preventDefault?: boolean;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * 토큰을 표준 형식으로 정규화. "Cmd+K", "ctrl+shift+s", "?", "ArrowUp" 모두 지원.
 * Mac에서 "Mod"는 Cmd, Windows/Linux에서는 Ctrl로 매핑.
 */
function normalize(combo: string): string {
  return combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .map((p) =>
      p === "mod" ? (isMac ? "meta" : "ctrl") : p === "cmd" ? "meta" : p === "option" ? "alt" : p,
    )
    .sort((a, b) => {
      const order = ["ctrl", "meta", "alt", "shift"];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    })
    .join("+");
}

function eventToCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.metaKey) parts.push("meta");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  // 단일 키 (영문은 lowercase, 특수키는 e.key 그대로)
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  if (!["control", "meta", "alt", "shift"].includes(k)) parts.push(k);
  return normalize(parts.join("+"));
}

/**
 * 키보드 단축키 등록. "Cmd+K"는 Mac에서 ⌘K, Windows에서 Ctrl+K로 자동 매핑.
 *
 * @example
 *   useKeyboardShortcut("mod+k", () => openCommandPalette());
 *   useKeyboardShortcut(["?", "shift+/"], () => showHelp());
 *   useKeyboardShortcut("escape", () => close(), { allowInInputs: true });
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: (event: KeyboardEvent) => void,
  { enabled = true, allowInInputs = false, preventDefault = true }: UseKeyboardShortcutOptions = {},
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const targets = useRef<Set<string>>(new Set());
  targets.current = new Set((Array.isArray(shortcut) ? shortcut : [shortcut]).map(normalize));

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!allowInInputs) {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        const editable = t?.isContentEditable;
        if (editable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      }
      const combo = eventToCombo(e);
      if (targets.current.has(combo)) {
        if (preventDefault) e.preventDefault();
        handlerRef.current(e);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, allowInInputs, preventDefault]);
}
