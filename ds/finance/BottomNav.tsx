"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon, type IconName } from "./AppIcon";

interface TabItem {
  href: string;
  label: string;
  icon: IconName;
  matchPaths?: string[];
}

interface SheetItem {
  href: string;
  label: string;
  icon: IconName;
  description?: string;
}

const TABS: TabItem[] = [
  { href: "/dashboard", label: "대시보드", icon: "layoutDashboard" },
  { href: "/realtime", label: "실시간", icon: "activity" },
  { href: "/", label: "마켓", icon: "layoutGrid" },
  { href: "/heatmap", label: "히트맵", icon: "barChart" },
  { href: "/fzone", label: "F존", icon: "target" },
];

const SHEET_SECTIONS: { title: string; items: SheetItem[] }[] = [
  {
    title: "버터 데이터",
    items: [
      { href: "/feed", label: "정보 피드", icon: "newspaper", description: "뉴스·거시·외국인 매매 통합" },
      { href: "/themes/daily", label: "일별버터", icon: "calendarCheck", description: "일자별 주도 테마와 코스피·평가금액" },
      { href: "/themes/monthly", label: "월별버터", icon: "calendar", description: "월간 코스피·평가금액·테마 추이" },
      { href: "/nxt", label: "NXT 랭킹", icon: "listOrdered", description: "거래대금 통계" },
      { href: "/market", label: "시장종합", icon: "lineChart", description: "투자자 매매동향" },
    ],
  },
  {
    title: "분석",
    items: [
      { href: "/compare", label: "종목 비교", icon: "swap" },
      { href: "/schedule", label: "마켓 일정", icon: "calendar", description: "실적·박람회·휴장일·배당" },
      { href: "/tax", label: "세금 계산기", icon: "banknote", description: "양도소득세·배당세 추정" },
    ],
  },
  {
    title: "내 정보",
    items: [
      { href: "/portfolio", label: "매매손익", icon: "banknote" },
      { href: "/portfolio/holdings", label: "보유 종목", icon: "wallet" },
      { href: "/alerts", label: "가격 알림", icon: "bell" },
      { href: "/search", label: "검색", icon: "search" },
      { href: "/settings", label: "설정", icon: "settings" },
    ],
  },
];

export function BottomNav() {
  const path = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  // 라우트 이동 시 시트 자동 닫기
  useEffect(() => {
    setSheetOpen(false);
  }, [path]);

  if (path === "/login") return null;

  const sheetActive = !TABS.some(
    (t) => path === t.href || (t.matchPaths?.some((p) => path === p || path.startsWith(`${p}/`)) ?? false),
  );

  return (
    <>
      <nav className="bm-tabbar mt-auto" aria-label="모바일 탭바">
        <div className="flex items-stretch justify-between px-2 py-2 gap-1">
          {TABS.map((t) => {
            const active =
              path === t.href ||
              (t.matchPaths?.some((p) => path === p || path.startsWith(`${p}/`)) ?? false);
            return (
              <Link
                key={t.href}
                href={t.href}
                prefetch
                className="flex-1 flex flex-col items-center gap-1 py-1"
                data-active={active ? "true" : "false"}
              >
                <span
                  className="grid place-items-center size-9 rounded-full"
                  style={{
                    color: active ? "var(--bm-accent)" : "var(--bm-muted)",
                    background: active ? "var(--bm-accent-soft-bg)" : "transparent",
                  }}
                >
                  <AppIcon name={t.icon} size={18} strokeWidth={2} />
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: active ? "var(--bm-accent)" : "var(--bm-muted)" }}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-1"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <span
              className="grid place-items-center size-9 rounded-full"
              style={{
                color: sheetActive ? "var(--bm-accent)" : "var(--bm-muted)",
                background: sheetActive ? "var(--bm-accent-soft-bg)" : "transparent",
              }}
            >
              <AppIcon name="menu" size={18} strokeWidth={2} />
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: sheetActive ? "var(--bm-accent)" : "var(--bm-muted)" }}
            >
              더보기
            </span>
          </button>
        </div>
        <div style={{ height: "max(env(safe-area-inset-bottom), 6px)" }} />
      </nav>

      {sheetOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="더보기"
          className="fixed inset-0 z-40 flex items-end lg:hidden"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(15,23,42,0.42)" }}
          />
          <div
            className="relative w-full"
            style={{
              background: "var(--bm-card)",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderTop: "1px solid var(--bm-border)",
              maxHeight: "82vh",
              overflowY: "auto",
              paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
              boxShadow: "0 -10px 40px rgba(15,23,42,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2">
              <span
                className="block rounded-full"
                style={{ width: 44, height: 4, background: "var(--bm-border)" }}
              />
            </div>
            <header className="px-5 pt-3 pb-2 flex items-center justify-between">
              <h2 className="font-extrabold text-[14.5px]">더보기</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="size-8 rounded-full grid place-items-center"
                style={{ color: "var(--bm-muted)" }}
                aria-label="닫기"
              >
                <AppIcon name="close" size={16} strokeWidth={2.4} />
              </button>
            </header>
            <div className="px-3 pb-2">
              {SHEET_SECTIONS.map((section) => (
                <section key={section.title} className="mb-3">
                  <div
                    className="text-[10.5px] font-extrabold tracking-[0.08em] px-3 mb-1.5"
                    style={{ color: "var(--bm-muted)" }}
                  >
                    {section.title.toUpperCase()}
                  </div>
                  <ul className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--bm-border)" }}>
                    {section.items.map((item, i) => {
                      const active = path === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            prefetch
                            className="flex items-center gap-3 px-4 py-3 text-[13.5px] font-bold"
                            style={{
                              borderTop: i === 0 ? undefined : "1px solid var(--bm-border)",
                              background: active ? "var(--bm-accent-soft-bg)" : "transparent",
                              color: active ? "var(--bm-accent-strong)" : "var(--bm-text)",
                            }}
                          >
                            <span
                              className="grid place-items-center w-5 shrink-0"
                              style={{ color: active ? "var(--bm-accent-strong)" : "var(--bm-muted)" }}
                            >
                              <AppIcon name={item.icon} size={16} strokeWidth={2} />
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.description ? (
                              <span
                                className="text-[10.5px] truncate"
                                style={{ color: "var(--bm-muted)", maxWidth: 180 }}
                              >
                                {item.description}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
