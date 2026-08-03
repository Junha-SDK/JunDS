"use client";

import { useEffect, useState } from "react";
// useState 는 me 상태에서 여전히 필요, useEffect 는 /api/auth/me 폴링에 필요.
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { AlertHeaderButton } from "./AlertHeaderButton";
import { SearchBox } from "./SearchBox";
import { AppIcon } from "./AppIcon";
import { Logo } from "./Logo";
import { marketStatusLabel } from "./lib/marketHolidays";
import { formatKoreaClock24, formatKoreaDateShort, useKoreaTime } from "./lib/koreaTime";

interface MeResponse {
  authenticated: boolean;
  role?: "owner" | "guest";
  name?: string | null;
}

export function TopBar() {
  const path = usePathname();
  const router = useRouter();
  // KST 정확 시계 — 서버 동기화 + 매초 갱신. browser 시계가 부정확해도 안전.
  const { now: koreaNow, synced } = useKoreaTime();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j: MeResponse) => {
        if (!cancelled) setMe(j);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (path === "/login") return null;

  const now = koreaNow;
  const status = marketStatusLabel(now);
  // 시스템 상태 의미론: 장중 = success, 휴장/그 외 = muted (가격 색과 혼용 금지)
  const statusColor = status === "장중" ? "var(--bm-success)" : "var(--bm-muted)";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--bm-bg) 88%, transparent)",
        borderBottom: "1px solid var(--bm-border)",
      }}
    >
      <div className="flex items-center gap-3 px-4 lg:px-6 py-2.5 max-w-[1600px] mx-auto">
        <div className="lg:hidden">
          <Logo size="md" href="/dashboard" />
        </div>

        <div className="flex-1 max-w-2xl">
          <SearchBox />
        </div>

        <div
          className="hidden md:flex items-center gap-2 text-[12.5px] font-semibold bm-num"
          style={{ color: "var(--bm-muted)" }}
          suppressHydrationWarning
        >
          <AppIcon name="calendar" size={14} strokeWidth={2} />
          <span suppressHydrationWarning>
            {formatKoreaDateShort(now)} {formatKoreaClock24(now, true)}
          </span>
          {!synced ? (
            <span
              className="text-[9.5px] font-bold ml-0.5"
              style={{ color: "var(--bm-muted)", letterSpacing: "0.04em" }}
              title="KST 서버 동기화 진행 중"
            >
              sync…
            </span>
          ) : null}
          {status ? (
            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-extrabold rounded-full px-1.5 py-[1px]"
              style={{
                background:
                  status === "장중"
                    ? "color-mix(in srgb, var(--bm-success) 14%, transparent)"
                    : "var(--bm-soft-100)",
                color: statusColor,
              }}
            >
              <span
                aria-hidden
                // 맥동은 움직임이다 — 감속 요청을 받으면 색만 남긴다(장중 여부는 색과 라벨이 이미 말한다)
                className={`size-1.5 rounded-full shrink-0${
                  status === "장중" ? " animate-pulse motion-reduce:animate-none" : ""
                }`}
                style={{ background: "currentColor" }}
              />
              {status}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <AlertHeaderButton />
          {me?.role === "owner" ? (
            <a
              href="/admin"
              className="hidden md:inline-flex items-center px-2 h-8 rounded-lg text-[11.5px] font-extrabold transition-colors duration-150 hover:bg-[color:var(--bm-soft-200)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-bg)]"
              style={{
                background: "var(--bm-soft-100)",
                color: "var(--bm-accent-strong)",
                border: "1px solid var(--bm-border)",
              }}
            >
              관리
            </a>
          ) : null}
          {me?.authenticated ? (
            <button
              type="button"
              onClick={logout}
              className="hidden md:inline-flex items-center px-2 h-8 rounded-lg text-[11.5px] font-bold cursor-pointer transition-colors duration-150 hover:text-[color:var(--bm-text)] hover:bg-[color:var(--bm-soft-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-bg)]"
              style={{
                color: "var(--bm-muted)",
                border: "1px solid var(--bm-border)",
              }}
              title="로그아웃"
            >
              로그아웃
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
