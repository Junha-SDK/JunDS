"use client";
import { useState, useCallback } from "react";

/** 클립보드 복사 훅 */
export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout],
  );

  return { copied, copy };
}
