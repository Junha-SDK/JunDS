"use client";

import { CommandPalette, type CommandItem } from "@junds/ui";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { STOCKS } from "./lib/stocks";

const PAGES: { label: string; href: string; description: string; group: string }[] = [
  { label: "대시보드", href: "/dashboard", description: "시장 요약 한눈에 보기", group: "마켓" },
  { label: "마켓중심", href: "/", description: "주도 테마와 종목 흐름", group: "마켓" },
  { label: "히트맵", href: "/heatmap", description: "시총 가중 트리맵", group: "마켓" },
  { label: "NXT 랭킹", href: "/nxt", description: "거래대금 통계", group: "마켓" },
  { label: "일별버터", href: "/themes/daily", description: "일자별 주도 테마", group: "마켓" },
  { label: "월별버터", href: "/themes/monthly", description: "월간 코스피·평가금액·테마 추이", group: "마켓" },
  { label: "시장종합", href: "/market", description: "투자자 매매동향", group: "마켓" },
  { label: "F존", href: "/fzone", description: "알고리즘 매매 구간", group: "분석" },
  { label: "종목 비교", href: "/compare", description: "여러 종목 한 번에", group: "분석" },
  { label: "AI 투자자 위원회", href: "/investors", description: "버핏·린치·멍거 8명의 거장 분석", group: "분석" },
  { label: "위원회 합의 스크리너", href: "/investors/consensus", description: "다수 매수 종목을 한눈에", group: "분석" },
  { label: "백테스트", href: "/backtest", description: "거장 룰을 과거 데이터에 적용", group: "분석" },
  { label: "마켓 일정", href: "/schedule", description: "실적·박람회·IPO", group: "분석" },
  { label: "매매손익", href: "/portfolio", description: "일별 실현 손익", group: "내 정보" },
  { label: "보유 종목", href: "/portfolio/holdings", description: "현재 포지션과 평가손익", group: "내 정보" },
  { label: "포지션 × 위원회", href: "/portfolio/council", description: "내 종목별 거장 의견", group: "내 정보" },
  { label: "매매 일지", href: "/journal", description: "매매 기록과 회고", group: "내 정보" },
  { label: "리서치 노트", href: "/notes", description: "종목별 투자 아이디어 복기", group: "내 정보" },
  { label: "가격 알림", href: "/alerts", description: "목표가 모니터링", group: "내 정보" },
  { label: "설정", href: "/settings", description: "테마·밀도·폰트 설정", group: "내 정보" },
];

/* ──────────────────────────────────────────────────────────────
 * 앱 측 확장 API — 동적 항목 프로바이더 등록.
 *
 * 앱(예: ButterMoney 리서치 노트)이 자체 데이터를 팔레트에 노출할 수 있게
 * 하는 최소 훅. 프로바이더는 현재 시점의 CommandItem[] 을 반환하고,
 * 데이터가 바뀌면 등록 해제 없이 notifyCommandItemsChanged() 만 호출하면
 * 열린 팔레트에도 반영된다.
 *
 *   const off = registerCommandItemsProvider(() => noteItems);
 *   // 데이터 갱신 시: notifyCommandItemsChanged();
 *   // 언마운트 시: off();
 * ────────────────────────────────────────────────────────────── */
export type CommandItemsProvider = () => CommandItem[];

const providers = new Set<CommandItemsProvider>();
const providerListeners = new Set<() => void>();
let providersVersion = 0;

function emitProvidersChanged() {
  providersVersion += 1;
  for (const cb of providerListeners) cb();
}

export function registerCommandItemsProvider(provider: CommandItemsProvider): () => void {
  providers.add(provider);
  emitProvidersChanged();
  return () => {
    providers.delete(provider);
    emitProvidersChanged();
  };
}

/** 프로바이더가 반환할 데이터가 바뀌었을 때 호출 — 팔레트 항목 재수집. */
export function notifyCommandItemsChanged(): void {
  emitProvidersChanged();
}

function subscribeProviders(cb: () => void): () => void {
  providerListeners.add(cb);
  return () => providerListeners.delete(cb);
}

function getProvidersVersion(): number {
  return providersVersion;
}

export function CommandPaletteHost() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const extraVersion = useSyncExternalStore(
    subscribeProviders,
    getProvidersVersion,
    getProvidersVersion,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ⌘K(Meta+K)는 CommandPalette 내부 useKeyboard(document 리스너)가 먼저
      // 처리하고 preventDefault 한다 — 여기서 또 토글하면 같은 키 한 번에
      // 열림+닫힘이 겹쳐 macOS 에서 팔레트가 영영 열리지 않는다.
      if (e.defaultPrevented) return;
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const stockItems: CommandItem[] = STOCKS.slice(0, 80).map((s) => ({
      id: `stock-${s.name}`,
      label: s.name,
      description: `${s.sector ?? ""}${s.price ? ` · ${s.price.toLocaleString("ko-KR")}` : ""}`,
      group: "종목",
      keywords: [s.name, s.sector ?? "", s.ticker ?? ""].filter(Boolean) as string[],
      action: () => {
        router.push(`/stock/${encodeURIComponent(s.name)}`);
      },
    }));

    const pageItems: CommandItem[] = PAGES.map((p) => ({
      id: `page-${p.href}`,
      label: p.label,
      description: p.description,
      group: p.group,
      keywords: [p.label, p.description],
      action: () => {
        router.push(p.href);
      },
    }));

    const extraItems: CommandItem[] = [];
    for (const provider of providers) {
      try {
        extraItems.push(...provider());
      } catch {
        /* 한 프로바이더 실패가 팔레트 전체를 막지 않게 */
      }
    }

    return [...pageItems, ...extraItems, ...stockItems];
    // extraVersion: 프로바이더 등록/데이터 변경 시 재수집
  }, [router, extraVersion]);

  return (
    <CommandPalette
      items={items}
      open={open}
      onOpenChange={setOpen}
      placeholder="페이지·종목 검색…  (⌘K)"
    />
  );
}
