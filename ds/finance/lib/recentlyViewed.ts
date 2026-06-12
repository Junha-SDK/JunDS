"use client";

import { useEffect, useState } from "react";

const KEY = "buttermoney.recent.v1";
const MAX = 12;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function write(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("recent:change"));
  } catch {
    // ignore quota errors
  }
}

export function recordVisit(name: string): void {
  if (!name) return;
  const cur = read();
  const next = [name, ...cur.filter((x) => x !== name)].slice(0, MAX);
  write(next);
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const handler = () => setItems(read());
    window.addEventListener("recent:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("recent:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { items, hydrated };
}

export function clearRecent(): void {
  write([]);
}
