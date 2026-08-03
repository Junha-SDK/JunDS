"use client";

import { forwardRef, useMemo, useRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";

export interface WaveformProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSeek"> {
  /**
   * 파형을 만들 시드 문자열 (곡 슬러그·제목 등).
   * 같은 시드는 언제나 같은 파형을 만든다.
   */
  seed: string;
  /** 실제 진폭 배열 (0~1). 주면 `seed` 대신 이 값으로 그린다 */
  peaks?: number[];
  /** 재생 진행 비율 (0~1) */
  progress?: number;
  /** 막대 개수 (기본 56) */
  bars?: number;
  /** 재생 중인지 — 재생 헤드가 맥동한다 */
  playing?: boolean;
  /**
   * 탐색 콜백 (0~1 비율).
   * 주면 클릭·드래그·방향키로 탐색 가능한 `role="slider"` 가 된다.
   */
  onSeek?: (fraction: number) => void;
  /** 슬라이더 접근성 라벨 */
  ariaLabel?: string;
  /** 막대 높이 (px, 기본 40) */
  height?: number;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

/** 시드 문자열 → 32bit 해시 */
function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

/**
 * 결정적 PRNG (mulberry32).
 * `Math.random()` 을 쓰면 렌더마다 파형이 바뀌고 SSR 결과와도 어긋난다.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 가운데가 도톰한 엔벨로프 + 지터 + 간헐적 트랜지언트로 그럴듯한 파형을 만든다 */
function makeBars(seed: string, count: number): number[] {
  const rand = mulberry32(hashStr(seed));
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const env = Math.sin((i / Math.max(count - 1, 1)) * Math.PI); // 0 → 1 → 0
    const base = 0.24 + env * 0.46;
    let h = base * (0.62 + rand() * 0.5);
    if (rand() > 0.87) h += 0.22; // 이따금 튀는 트랜지언트
    out.push(Math.max(0.12, Math.min(1, h)));
  }
  return out;
}

/**
 * 사운드클라우드식 막대 파형. 재생 진행분이 강조색으로 차오른다.
 *
 * 실제 오디오를 분석하지 않고 시드에서 결정적으로 막대 높이를 만든다 — 파형
 * 하나를 위해 오디오 전체를 내려받아 디코딩하는 비용 없이 "이 곡만의 모양"을
 * 얻기 위해서다. 진짜 진폭 데이터가 있다면 `peaks` 로 넘기면 된다.
 *
 * `onSeek` 을 주면 클릭·드래그·방향키(←/→/Home/End)로 탐색할 수 있는 슬라이더가 된다.
 *
 * @example
 * <Waveform seed={track.slug} progress={t / duration} playing onSeek={(f) => seek(f * duration)} />
 * @status stable
 * @since 2.3.0
 * @tags media, audio
 */
export const Waveform = forwardRef<HTMLDivElement, WaveformProps>(function Waveform(
  {
    seed,
    peaks,
    progress = 0,
    bars = 56,
    playing = false,
    onSeek,
    ariaLabel = "재생 위치",
    height = 40,
    asChild,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const heights = useMemo(() => peaks ?? makeBars(seed, bars), [peaks, seed, bars]);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const clamped = Math.max(0, Math.min(1, progress));
  const playedCount = Math.round(clamped * heights.length);
  const interactive = typeof onSeek === "function";

  // 탐색이 안 되는 파형은 진행률을 눈으로 보여 주는 장식이다. 이름을 명시적으로
  // 준 경우에만 그림(role="img")으로 노출하고, 아니면 통째로 숨긴다 —
  // 재생 시간은 보통 옆에 숫자로 이미 있어서 중복이 된다.
  const staticLabel = props["aria-label"] as string | undefined;

  const seekFromClientX = (clientX: number) => {
    const el = innerRef.current;
    if (!el || !onSeek) return;
    const rect = el.getBoundingClientRect();
    const frac = (clientX - rect.left) / Math.max(rect.width, 1);
    onSeek(Math.max(0, Math.min(1, frac)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 포인터를 캡처해야 막대 바깥으로 드래그해도 탐색이 이어진다
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    seekFromClientX(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const step = e.shiftKey ? 0.1 : 0.05;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSeek(Math.min(1, clamped + step));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSeek(Math.max(0, clamped - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(1);
    }
  };

  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={((node: HTMLDivElement | null) => {
        // 탐색 시 컨테이너 폭을 재야 해서 내부 ref 가 필요하고, 호출부가 넘긴
        // ref 도 그대로 살려야 한다. React 19 타입에서 RefObject.current 는
        // 읽기 전용이라 쓰기 위해 좁은 캐스트를 쓴다.
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
      }) as never}
      className={cn(
        "flex items-end gap-[2px] select-none",
        interactive &&
          "cursor-pointer touch-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
        className,
      )}
      style={{ height, ...style }}
      role={interactive ? "slider" : staticLabel ? "img" : undefined}
      aria-label={interactive ? ariaLabel : staticLabel}
      aria-hidden={!interactive && !staticLabel ? true : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={interactive ? Math.round(clamped * 100) : undefined}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={interactive ? handlePointerDown : undefined}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      {...props}
    >
      {asChild ? <Slottable>{children}</Slottable> : null}
      {heights.map((h, i) => {
        const played = i < playedCount;
        const isHead = playing && i === playedCount;
        return (
          <span
            key={i}
            className={cn(
              "flex-1 min-w-[2px] rounded-full transition-colors duration-150",
              played ? "bg-primary" : "bg-border",
              isHead && "jds-waveform-head bg-primary",
            )}
            style={{ height: `${Math.round(h * 100)}%` }}
          />
        );
      })}
    </Comp>
  );
});
