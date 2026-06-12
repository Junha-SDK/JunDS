"use client";

import { useEffect, useState } from "react";

export interface Brokerage {
  id: string;
  name: string;
  /** Online commission rate, decimal (e.g. 0.00015 = 0.015%) */
  commission: number;
  note?: string;
}

/**
 * 거래세 (regulatory transaction tax) is independent of brokerage and applies on sells.
 * Combined rate (KOSPI/KOSDAQ): 0.18% as of 2026.
 */
export const TRANSACTION_TAX = 0.0018;

export const BROKERAGES: Brokerage[] = [
  { id: "kiwoom", name: "키움증권 (영웅문)", commission: 0.00015, note: "온라인 0.015%" },
  { id: "miraeasset", name: "미래에셋증권 (M-STOCK)", commission: 0.00014, note: "비대면 0.014%" },
  { id: "samsung", name: "삼성증권 (mPOP)", commission: 0.00036, note: "비대면 0.0036%" },
  { id: "kb", name: "KB증권 (M-able)", commission: 0.00014, note: "비대면 0.014%" },
  { id: "nh", name: "NH투자증권 (나무)", commission: 0.00014, note: "비대면 0.014%" },
  { id: "koreainvest", name: "한국투자증권", commission: 0.00014, note: "비대면 0.014%" },
  { id: "shinhan", name: "신한투자증권 (알파)", commission: 0.00012, note: "비대면 0.012%" },
  { id: "hana", name: "하나증권 (원큐)", commission: 0.00015, note: "비대면 0.015%" },
  { id: "toss", name: "토스증권", commission: 0.00015, note: "0.015%" },
  { id: "kakaopay", name: "카카오페이증권", commission: 0.00015, note: "0.015%" },
];

export const DEFAULT_BROKERAGE_ID = "kiwoom";

const KEY = "buttermoney.brokerage.v1";

function read(): string {
  if (typeof window === "undefined") return DEFAULT_BROKERAGE_ID;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v && BROKERAGES.some((b) => b.id === v)) return v;
  } catch {
    // ignore
  }
  return DEFAULT_BROKERAGE_ID;
}

export function getBrokerage(id: string): Brokerage {
  return BROKERAGES.find((b) => b.id === id) ?? BROKERAGES[0];
}

export function calcFees(buyAmount: number, sellAmount: number, b: Brokerage) {
  const commission = (buyAmount + sellAmount) * b.commission;
  const tax = sellAmount * TRANSACTION_TAX;
  return {
    commission: Math.round(commission),
    tax: Math.round(tax),
    total: Math.round(commission + tax),
  };
}

export function useBrokerage() {
  const [id, setId] = useState<string>(DEFAULT_BROKERAGE_ID);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setId(read());
    setHydrated(true);
    const handler = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue && BROKERAGES.some((b) => b.id === e.newValue)) {
        setId(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  function select(next: string) {
    if (!BROKERAGES.some((b) => b.id === next)) return;
    setId(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
  }

  return { id, brokerage: getBrokerage(id), select, hydrated };
}
