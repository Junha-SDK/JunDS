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
            aria-pressed={active}
            // 인라인 style 이 box-shadow 를 쓰지 않더라도, 이 모듈의 다른 컨트롤과 맞추려면
            // ring(=box-shadow) 보다 outline 이 안전하다 — 인라인 style 에 덮이지 않는다.
            className={[
              "px-3 py-1.5 rounded-full text-[12px] font-extrabold cursor-pointer whitespace-nowrap",
              // 배경·글자색이 인라인 style 로 고정돼 있어 hover 배경 클래스는 먹지 않는다.
              // 눌림 반응은 filter 로 준다.
              "transition-[color,background-color,border-color,filter] duration-150",
              "hover:brightness-95 active:brightness-90",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--bm-accent-strong)]",
            ].join(" ")}
            // 하드코딩된 teal 은 액센트가 사용자 설정으로 바뀌기 전에 남은 값이라, 글자는
            // 액센트를 따라가는데 배경만 청록으로 굳어 있었다. 액센트 토큰으로 통일한다.
            style={{
              background: active ? "var(--bm-accent-soft-bg)" : "var(--bm-soft-100)",
              color: active ? "var(--bm-accent-strong)" : "var(--bm-text)",
              border: `1px solid ${
                active
                  ? "color-mix(in srgb, var(--bm-accent) 30%, transparent)"
                  : "var(--bm-border)"
              }`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
