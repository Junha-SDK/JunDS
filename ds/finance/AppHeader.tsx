"use client";

import { HStack } from "@junds/ui";
import Link from "next/link";
import { fmtDate } from "./lib/format";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";
import { AlertHeaderButton } from "./AlertHeaderButton";
import { Logo } from "./Logo";

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
        <span className="text-[13px] font-semibold text-[color:var(--bm-muted)] bm-num">
          {fmtDate(date)} {String(date.getHours()).padStart(2, "0")}:
          {String(date.getMinutes()).padStart(2, "0")}
        </span>
        <HStack align="center" gap={1}>
          {rightActions ?? (
            <>
              <ThemeToggle />
              <AlertHeaderButton />
              <Link href="/compare">
                <HeaderButton aria-label="compare">⇆</HeaderButton>
              </Link>
              <Link href="/themes/daily">
                <HeaderButton aria-label="daily-themes">🗓</HeaderButton>
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
            className="size-9 rounded-full grid place-items-center"
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

function HeaderButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="size-9 rounded-full grid place-items-center text-[18px] text-[color:var(--bm-muted)] hover:bg-slate-100"
      {...rest}
    >
      {children}
    </button>
  );
}
