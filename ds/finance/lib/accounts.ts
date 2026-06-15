"use client";

/**
 * 증권 계좌 목록 — local-first. 사용자가 여러 증권 계좌를 추가/관리하고,
 * 보유(holdings)·매매일지(tradeJournal)를 accountId 로 계좌별 분리해 본다.
 * accountId 미지정 데이터는 기본 계좌("default")에 귀속(레거시 호환).
 */
import { useCallback, useEffect, useState } from "react";

export interface Account {
  id: string;
  name: string;
  /** 증권사 id(brokerages.ts) — 수수료 컨텍스트. 선택. */
  brokerageId?: string;
  createdAt: string;
}

const KEY = "buttermoney.accounts.v1";
const EVENT = "accounts:change";

/** 기본 계좌 — accountId 미지정 보유/매매가 귀속되는 곳. id 는 "default" 고정. */
export const DEFAULT_ACCOUNT: Account = {
  id: "default",
  name: "기본 계좌",
  createdAt: "1970-01-01T00:00:00.000Z",
};

function read(): Account[] {
  if (typeof window === "undefined") return [DEFAULT_ACCOUNT];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [DEFAULT_ACCOUNT];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [DEFAULT_ACCOUNT];
    const list = parsed.filter(
      (x): x is Account =>
        x && typeof x === "object" && typeof x.id === "string" && typeof x.name === "string",
    );
    // 기본 계좌는 항상 첫 번째로 보장.
    return list.some((a) => a.id === "default") ? list : [DEFAULT_ACCOUNT, ...list];
  } catch {
    return [DEFAULT_ACCOUNT];
  }
}

function write(items: Account[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

function genId(): string {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([DEFAULT_ACCOUNT]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAccounts(read());
    setHydrated(true);
    const handler = () => setAccounts(read());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  /** 계좌 추가 → 새 id 반환(빈 이름이면 ""). */
  const add = useCallback((name: string, brokerageId?: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    const acc: Account = {
      id: genId(),
      name: trimmed,
      brokerageId,
      createdAt: new Date().toISOString(),
    };
    const next = [...read(), acc];
    write(next);
    setAccounts(next);
    return acc.id;
  }, []);

  const rename = useCallback((id: string, name: string, brokerageId?: string) => {
    const trimmed = name.trim();
    const next = read().map((a) =>
      a.id === id ? { ...a, name: trimmed || a.name, brokerageId: brokerageId ?? a.brokerageId } : a,
    );
    write(next);
    setAccounts(next);
  }, []);

  /** 기본 계좌는 삭제 불가. */
  const remove = useCallback((id: string) => {
    if (id === "default") return;
    const next = read().filter((a) => a.id !== id);
    write(next);
    setAccounts(next);
  }, []);

  return { accounts, add, rename, remove, hydrated };
}

/** 계좌 id → 이름. 미지정/없음이면 기본 계좌명. */
export function accountName(accounts: Account[], id?: string): string {
  const target = id ?? "default";
  return accounts.find((a) => a.id === target)?.name ?? DEFAULT_ACCOUNT.name;
}
