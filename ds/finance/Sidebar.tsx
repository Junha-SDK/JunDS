"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@junds/ui";
import { useAlerts } from "./lib/alerts";
import { RecentlyViewed } from "./RecentlyViewed";
import { AppIcon, type IconName } from "./AppIcon";
import { Logo } from "./Logo";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  matchPaths?: string[];
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * 단일 NAV 소스 — BottomNav(탭바 + 더보기 시트)가 노출하는 모든 경로를
 * 포함하도록 정렬한다. BottomNav 항목을 바꾸면 여기도 함께 맞출 것.
 */
const NAV_SECTIONS: NavSection[] = [
  {
    title: "마켓",
    items: [
      { href: "/dashboard", label: "대시보드", icon: "layoutDashboard" },
      { href: "/workspace", label: "워크스페이스", icon: "grid2x2" },
      { href: "/realtime", label: "실시간", icon: "activity" },
      { href: "/clock", label: "한국시간", icon: "clock" },
      { href: "/pulse", label: "마켓 펄스", icon: "activity" },
      { href: "/briefing", label: "오늘 한눈에", icon: "flame" },
      { href: "/", label: "마켓중심", icon: "layoutGrid" },
      { href: "/heatmap", label: "히트맵", icon: "barChart" },
      { href: "/feed", label: "정보 피드", icon: "newspaper" },
      { href: "/nxt", label: "NXT 랭킹", icon: "listOrdered" },
      { href: "/themes/daily", label: "일별버터", icon: "calendarCheck" },
      { href: "/themes/monthly", label: "월별버터", icon: "calendar" },
      { href: "/market", label: "시장종합", icon: "lineChart" },
    ],
  },
  {
    title: "분석",
    items: [
      { href: "/fzone", label: "F존", icon: "target" },
      { href: "/compare", label: "종목 비교", icon: "swap" },
      { href: "/investors", label: "AI 위원회", icon: "sparkles" },
      { href: "/investors/consensus", label: "합의 스크리너", icon: "trendingUp" },
      { href: "/backtest", label: "백테스트", icon: "lineChart" },
      { href: "/schedule", label: "마켓 일정", icon: "calendar" },
      { href: "/tax", label: "세금 계산기", icon: "banknote" },
    ],
  },
  {
    title: "내 정보",
    items: [
      { href: "/portfolio", label: "매매손익", icon: "banknote" },
      { href: "/portfolio/holdings", label: "보유 종목", icon: "wallet" },
      { href: "/portfolio/council", label: "포지션 × 위원회", icon: "sparkles" },
      { href: "/journal", label: "매매 일지", icon: "newspaper" },
      { href: "/alerts", label: "가격 알림", icon: "bell" },
      { href: "/search", label: "검색", icon: "search" },
      { href: "/settings", label: "설정", icon: "settings" },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();
  const { items: alerts } = useAlerts();
  const activeAlerts = alerts.filter((a) => a.active).length;

  const sections: NavSection[] = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.href === "/alerts" ? { ...item, badge: activeAlerts } : item,
    ),
  }));

  if (path === "/login") return null;

  return (
    <aside
      className="hidden lg:flex flex-col h-dvh sticky top-0 bm-sidebar"
      style={{
        width: 248,
        background: "var(--bm-card)",
        borderRight: "1px solid var(--bm-border)",
      }}
    >
      <div
        className="px-5 py-5 border-b"
        style={{ borderColor: "var(--bm-border)" }}
      >
        <Logo size="lg" href="/dashboard" showSubtitle />
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <RecentlyViewed />
        {sections.map((section) => (
          <div key={section.title} className="px-3 pb-4">
            <div
              className="text-[10.5px] font-extrabold tracking-[0.08em] px-3 mb-1.5"
              style={{ color: "var(--bm-muted)" }}
            >
              {section.title.toUpperCase()}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  path === item.href ||
                  (item.matchPaths?.some((p) => path === p || path.startsWith(`${p}/`)) ?? false);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold transition-colors${
                        active ? "" : " hover:bg-[color:var(--bm-soft-100)]"
                      }`}
                      style={{
                        background: active ? "var(--bm-accent-soft-bg)" : undefined,
                        color: active ? "var(--bm-accent-strong)" : "var(--bm-text)",
                      }}
                    >
                      {active ? (
                        /* 현재 페이지 레일 — 좌측 2px 액센트 바 (X-style 마커) */
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 2,
                            height: 16,
                            borderRadius: 2,
                            background: "var(--bm-accent-strong)",
                          }}
                        />
                      ) : null}
                      <span
                        className="grid place-items-center w-5 shrink-0"
                        style={{ color: active ? "var(--bm-accent-strong)" : "var(--bm-muted)" }}
                      >
                        <AppIcon name={item.icon} size={16} strokeWidth={2} />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <Badge variant="danger" size="sm">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className="px-5 py-3 text-[11px] text-[color:var(--bm-muted)] border-t flex items-center justify-end"
        style={{ borderColor: "var(--bm-border)" }}
      >
        <kbd
          className="inline-flex items-center gap-1 bm-num font-bold text-[10px]"
          style={{
            background: "var(--bm-soft-100)",
            border: "1px solid var(--bm-border)",
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          <AppIcon name="command" size={11} strokeWidth={2.5} />
          K
        </kbd>
      </div>
    </aside>
  );
}
