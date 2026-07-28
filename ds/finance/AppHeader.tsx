"use client";

import { HStack } from "@junds/ui";
import Link from "next/link";
import { fmtDate } from "./lib/format";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";
import { AlertHeaderButton } from "./AlertHeaderButton";
import { Logo } from "./Logo";

// 헤더의 원형 액션 하나짜리 모양. 링크로도 버튼으로도 같은 클래스를 쓴다.
const headerBtnCls =
  "size-9 rounded-full grid place-items-center text-[18px] text-[color:var(--bm-muted)] cursor-pointer transition-[background-color,color,opacity] hover:bg-[color:var(--bm-soft-100)] hover:text-[color:var(--bm-text)] active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bm-bg)]";

interface AppHeaderProps {
  date?: Date;
  showSearch?: boolean;
  searchPlaceholder?: string;
  rightActions?: React.ReactNode;
}

export function AppHeader({
  date = new Date(2026, 4, 6, 13, 23),
  showSearch = true,
  searchPlaceholder = "종목, 테마명을 입력하세요.",
  rightActions,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[var(--bm-bg)]/90 backdrop-blur px-4 pt-3 pb-2">
      <HStack align="center" justify="between" gap={2}>
        <Logo size="lg" href="/" />
        <span className="text-[13px] font-semibold text-[color:var(--bm-muted)] bm-num whitespace-nowrap tabular-nums">
          {fmtDate(date)} {String(date.getHours()).padStart(2, "0")}:
          {String(date.getMinutes()).padStart(2, "0")}
        </span>
        <HStack align="center" gap={1}>
          {rightActions ?? (
            <>
              <ThemeToggle />
              <AlertHeaderButton />
              {/* <button> 을 <a> 안에 넣으면 포커스 대상이 둘로 갈라져 링이 엉뚱한 곳에 그려진다.
                  링크는 링크 하나로 두고 같은 모양을 클래스로 준다. */}
              <Link href="/compare" aria-label="compare" className={headerBtnCls}>
                ⇆
              </Link>
              <Link href="/themes/daily" aria-label="daily-themes" className={headerBtnCls}>
                🗓
              </Link>
            </>
          )}
        </HStack>
      </HStack>

      {showSearch ? (
        <HStack mt={3} gap={2} align="center">
          <SearchBox placeholder={searchPlaceholder} />
          <button
            type="button"
            aria-label="menu"
            className="size-9 shrink-0 rounded-full grid place-items-center cursor-pointer transition-[filter,opacity] hover:brightness-95 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bm-accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bm-bg)]"
            style={{
              border: "1px solid var(--bm-border)",
              background: "var(--bm-card)",
              color: "var(--bm-accent-light)",
            }}
          >
            ☰
          </button>
        </HStack>
      ) : null}
    </header>
  );
}
