"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface RangeOption {
  range: string;
  interval: string;
  label: string;
}

const OPTIONS: RangeOption[] = [
  { range: "1d", interval: "5m", label: "1일" },
  { range: "5d", interval: "15m", label: "5일" },
  { range: "1mo", interval: "1d", label: "1개월" },
  { range: "3mo", interval: "1d", label: "3개월" },
  { range: "6mo", interval: "1d", label: "6개월" },
  { range: "1y", interval: "1d", label: "1년" },
  { range: "2y", interval: "1wk", label: "2년" },
];

export function ChartRangePicker({
  symbol: _symbol,
  range,
  interval,
}: {
  symbol: string;
  range: string;
  interval: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pick(opt: RangeOption) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("range", opt.range);
    sp.set("interval", opt.interval);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {OPTIONS.map((opt) => {
        const active = opt.range === range && opt.interval === interval;
        return (
          <button
            key={opt.range + opt.interval}
            type="button"
            onClick={() => pick(opt)}
            className="px-3 py-1.5 rounded-full text-[12px] font-extrabold transition-colors"
            style={{
              background: active ? "rgba(20,184,166,0.12)" : "var(--bm-soft-100)",
              color: active ? "var(--bm-accent-strong)" : "var(--bm-text)",
              border: `1px solid ${active ? "rgba(20,184,166,0.3)" : "var(--bm-border)"}`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
