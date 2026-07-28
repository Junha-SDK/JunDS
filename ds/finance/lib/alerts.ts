"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "buttermoney.alerts.v1";

export type AlertDirection = "above" | "below";

export interface PriceAlert {
  id: string;
  name: string;
  target: number;
  direction: AlertDirection;
  /** Price recorded when alert was created — used so already-crossed alerts don't fire immediately */
  basePrice: number;
  createdAt: number;
  triggeredAt?: number;
  active: boolean;
}

function read(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x: unknown): x is PriceAlert =>
        typeof x === "object" && x !== null && "id" in x && "name" in x && "target" in x,
    );
  } catch {
    return [];
  }
}

function write(items: PriceAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("alerts:change"));
  } catch {
    // ignore
  }
}

export function getAlerts(): PriceAlert[] {
  return read();
}

export function addAlert(alert: Omit<PriceAlert, "id" | "createdAt" | "active">): PriceAlert {
  const items = read();
  const created: PriceAlert = {
    ...alert,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    active: true,
  };
  write([created, ...items]);
  return created;
}

export function removeAlert(id: string): void {
  write(read().filter((a) => a.id !== id));
}

export function markTriggered(id: string): void {
  write(read().map((a) => (a.id === id ? { ...a, active: false, triggeredAt: Date.now() } : a)));
}

export function reactivate(id: string): void {
  write(read().map((a) => (a.id === id ? { ...a, active: true, triggeredAt: undefined } : a)));
}

export function useAlerts() {
  const [items, setItems] = useState<PriceAlert[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const handler = () => setItems(read());
    window.addEventListener("alerts:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("alerts:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  const add = useCallback((a: Omit<PriceAlert, "id" | "createdAt" | "active">) => addAlert(a), []);
  const remove = useCallback((id: string) => removeAlert(id), []);
  const reactivateAlert = useCallback((id: string) => reactivate(id), []);
  return { items, add, remove, reactivate: reactivateAlert, hydrated };
}
