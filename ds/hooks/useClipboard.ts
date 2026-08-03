"use client";
import { useState, useCallback } from "react";

export interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
  read: () => Promise<string>;
}

/**
 * 클립보드 읽기/쓰기 훅
 * @example
 * const { copied, copy, read } = useClipboard();
 * <button onClick={() => copy("Hello!")}>복사 {copied && "✓"}</button>
 */
export function useClipboard(timeout: number = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout],
  );

  const read = useCallback(async () => {
    return navigator.clipboard.readText();
  }, []);

  return { copied, copy, read };
}
