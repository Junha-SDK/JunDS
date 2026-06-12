"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchStocks, type StockInfo } from "./lib/stocks";
import { PriceBadge } from "./PriceBadge";
import { AppIcon } from "./AppIcon";

interface SearchBoxProps {
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
}

interface RemoteHit {
  symbol: string;
  ticker: string;
  exchange: "KOSPI" | "KOSDAQ" | "기타";
  name: string;
  code?: string;
}

interface DisplayHit {
  key: string;
  href: string;
  name: string;
  sub?: string;
  badge?: "KOSPI" | "KOSDAQ";
  price?: number;
  change?: number;
  code?: string;
  source: "local" | "remote";
}

function localToDisplay(s: StockInfo): DisplayHit {
  return {
    key: `local:${s.name}`,
    href: `/stock/${encodeURIComponent(s.name)}`,
    name: s.name,
    sub: s.sector,
    price: s.price,
    change: s.change,
    source: "local",
  };
}

function remoteToDisplay(h: RemoteHit): DisplayHit {
  return {
    key: `remote:${h.ticker}`,
    href: `/stock/${encodeURIComponent(h.ticker)}`,
    name: h.name,
    sub: undefined,
    badge: h.exchange === "KOSPI" || h.exchange === "KOSDAQ" ? h.exchange : undefined,
    code: h.code,
    source: "remote",
  };
}

function mergeResults(local: StockInfo[], remote: RemoteHit[], limit = 8): DisplayHit[] {
  const out: DisplayHit[] = [];
  const seen = new Set<string>();
  for (const s of local) {
    if (out.length >= limit) break;
    out.push(localToDisplay(s));
    seen.add(s.name.toLowerCase());
  }
  for (const h of remote) {
    if (out.length >= limit) break;
    if (seen.has(h.name.toLowerCase())) continue;
    out.push(remoteToDisplay(h));
  }
  return out;
}

export function SearchBox({
  placeholder = "종목, 테마명을 입력하세요.",
  defaultValue = "",
  autoFocus,
  className,
}: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState<RemoteHit[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const local = useMemo(() => searchStocks(value, 8), [value]);
  const results = useMemo(() => mergeResults(local, remote, 10), [local, remote]);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 1) {
      setRemote([]);
      setRemoteLoading(false);
      return;
    }
    setRemoteLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`, {
        signal: ctrl.signal,
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : { hits: [] }))
        .then((data: { hits?: RemoteHit[] }) => {
          setRemote(data.hits ?? []);
        })
        .catch(() => {})
        .finally(() => setRemoteLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function submitToSearch() {
    const q = value.trim();
    if (q.length === 0) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={wrapRef} className={`relative flex-1 ${className ?? ""}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitToSearch();
        }}
        className="flex items-center gap-2 px-3 h-9 rounded-full"
        style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
      >
        <span style={{ color: "var(--bm-muted)" }}>
          <AppIcon name="search" size={15} strokeWidth={2} />
        </span>
        <input
          type="search"
          inputMode="search"
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-[color:var(--bm-muted)]"
          style={{ color: "var(--bm-text)" }}
        />
        <kbd
          className="hidden md:inline-flex items-center gap-1 bm-num font-bold text-[10px]"
          style={{
            background: "var(--bm-soft-100)",
            border: "1px solid var(--bm-border)",
            padding: "2px 7px",
            borderRadius: 6,
            color: "var(--bm-muted)",
          }}
        >
          <AppIcon name="command" size={10} strokeWidth={2.5} />
          K
        </kbd>
        {value ? (
          <button
            type="button"
            aria-label="clear"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="grid place-items-center"
            style={{ color: "var(--bm-muted)" }}
          >
            <AppIcon name="close" size={14} strokeWidth={2} />
          </button>
        ) : null}
      </form>

      {open && (results.length > 0 || remoteLoading) ? (
        <div
          className="absolute left-0 right-0 mt-1.5 rounded-2xl shadow-lg z-30 overflow-hidden"
          style={{ background: "var(--bm-card)", border: "1px solid var(--bm-border)" }}
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {results.map((s) => (
                <li key={s.key}>
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[color:var(--bm-soft-100)]"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-[13.5px] truncate">{s.name}</span>
                      {s.badge ? (
                        <span
                          className="text-[10px] font-extrabold px-1.5 py-px rounded-full shrink-0"
                          style={{
                            background: "var(--bm-soft-100)",
                            color: "var(--bm-muted)",
                            border: "1px solid var(--bm-border)",
                          }}
                        >
                          {s.badge}
                        </span>
                      ) : null}
                      {s.sub ? (
                        <span className="text-[11px] text-[color:var(--bm-muted)] truncate">
                          · {s.sub}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {s.source === "local" ? (
                        <>
                          <span className="bm-num font-semibold text-[12.5px]">
                            {s.price ? s.price.toLocaleString("ko-KR") : "—"}
                          </span>
                          <PriceBadge pct={s.change ?? 0} size="sm" showArrow={false} />
                        </>
                      ) : (
                        <span className="bm-num text-[11px] font-bold" style={{ color: "var(--bm-muted)" }}>
                          {s.code ?? ""}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-3 text-[12px]" style={{ color: "var(--bm-muted)" }}>
              검색 중…
            </div>
          )}
          {value.trim() ? (
            <button
              type="button"
              onClick={submitToSearch}
              className="w-full px-3 py-2 text-[12.5px] text-[color:#0d9488] font-bold flex items-center justify-center gap-1"
              style={{ borderTop: "1px solid var(--bm-border)", background: "var(--bm-soft-100)" }}
            >
              ‘{value}’ 전체 검색결과 보기 <AppIcon name="chevronRight" size={12} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
