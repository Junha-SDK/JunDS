"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "buttermoney.watchlist.v1";
const META_KEY = "buttermoney.watchlist.meta.v1";

export interface WatchlistEntry {
  name: string;
  color?: string;
  note?: string;
  addedAt: string;
}

interface MetaRecord {
  color?: string;
  note?: string;
  addedAt?: string;
}

function readNames(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function writeNames(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("watchlist:change"));
  } catch {
    // ignore
  }
}

function readMeta(): Record<string, MetaRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, MetaRecord>;
    }
    return {};
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, MetaRecord>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
    window.dispatchEvent(new CustomEvent("watchlist:change"));
  } catch {
    // ignore
  }
}

function buildEntries(names: string[], meta: Record<string, MetaRecord>): WatchlistEntry[] {
  return names.map((name) => {
    const m = meta[name] ?? {};
    return {
      name,
      color: typeof m.color === "string" ? m.color : undefined,
      note: typeof m.note === "string" ? m.note : undefined,
      addedAt: typeof m.addedAt === "string" ? m.addedAt : new Date().toISOString(),
    };
  });
}

export function useWatchlist() {
  const [items, setItems] = useState<string[]>([]);
  const [meta, setMeta] = useState<Record<string, MetaRecord>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readNames());
    setMeta(readMeta());
    setHydrated(true);
    const handler = () => {
      setItems(readNames());
      setMeta(readMeta());
    };
    window.addEventListener("watchlist:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("watchlist:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggle = useCallback((name: string) => {
    const cur = readNames();
    let next: string[];
    if (cur.includes(name)) {
      next = cur.filter((x) => x !== name);
      // 메타도 정리 — 빠진 종목의 색/노트는 가비지.
      const m = readMeta();
      delete m[name];
      writeMeta(m);
      setMeta(m);
    } else {
      next = [name, ...cur];
      // 추가 시각 기록 (정렬·표시용).
      const m = readMeta();
      m[name] = { ...m[name], addedAt: m[name]?.addedAt ?? new Date().toISOString() };
      writeMeta(m);
      setMeta(m);
    }
    writeNames(next);
    setItems(next);
  }, []);

  const remove = useCallback((name: string) => {
    const next = readNames().filter((x) => x !== name);
    const m = readMeta();
    delete m[name];
    writeMeta(m);
    setMeta(m);
    writeNames(next);
    setItems(next);
  }, []);

  const has = useCallback((name: string) => items.includes(name), [items]);

  /** 색/노트 부분 갱신 — 다른 필드는 보존. */
  const setEntryMeta = useCallback(
    (name: string, patch: { color?: string | null; note?: string | null }) => {
      const m = readMeta();
      const cur = m[name] ?? {};
      const next: MetaRecord = { ...cur };
      if (patch.color !== undefined) {
        if (patch.color === null) delete next.color;
        else next.color = patch.color;
      }
      if (patch.note !== undefined) {
        if (patch.note === null) delete next.note;
        else next.note = patch.note;
      }
      if (!next.addedAt) next.addedAt = new Date().toISOString();
      m[name] = next;
      writeMeta(m);
      setMeta(m);
    },
    [],
  );

  const entries = buildEntries(items, meta);

  return { items, entries, toggle, remove, has, setEntryMeta, hydrated };
}
