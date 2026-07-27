"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";

export interface LyricsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 가사 원문. 빈 줄(`\n\n`)로 연을 나누고, 홑 줄바꿈은 행으로 남는다.
   * `verses` 를 주면 무시된다.
   */
  text?: string;
  /** 이미 연·행으로 나눠 둔 가사 (`verses[연][행]`) */
  verses?: string[][];
  /**
   * 재생 진행률 (0~1). 주면 해당 위치의 연을 밝게 강조하고 그 연으로 스크롤한다.
   *
   * 연마다 실제 타임스탬프(LRC)가 없을 때를 위한 근사다 — 전체 길이에 연 수를
   * 균등 매핑하므로 "대략 이쯤"이지 정확한 싱크가 아니다. 정확한 싱크가 필요하면
   * `activeIndex` 로 직접 지정한다.
   */
  progress?: number;
  /** 강조할 연 인덱스를 직접 지정 (`progress` 보다 우선, -1 이면 강조 없음) */
  activeIndex?: number;
  /** 현재 연을 컨테이너 가운데로 자동 스크롤 (기본 true) */
  autoScroll?: boolean;
  /** 가운데 정렬 (기본 false — 왼쪽 정렬) */
  centered?: boolean;
}

/** 빈 줄로 연을 나누고, 각 연을 행 배열로 쪼갠다 */
function parseVerses(text: string): string[][] {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((v) => v.split("\n"));
}

/**
 * 연 단위로 강조되는 가사 뷰.
 *
 * 재생 진행률을 주면 현재 연만 밝게 두고 나머지는 흐리게 만든 뒤, 그 연을 화면
 * 가운데로 부드럽게 굴린다. 지나간 연과 앞으로 올 연의 흐림 정도를 달리해서
 * 지금 어디쯤인지 한눈에 잡히게 한다.
 *
 * 연 단위인 것은 의도다 — 커버곡·자작곡 가사에 행별 타임스탬프가 붙어 있는
 * 경우는 드물어서, 행 단위로 맞추려 하면 대부분 어긋난 싱크만 보여 주게 된다.
 * 행별 데이터가 있다면 `activeIndex` 로 직접 몰아 주면 된다.
 *
 * @example
 * <Lyrics text={song.lyrics} progress={currentTime / duration} />
 * @status stable
 * @since 2.3.0
 * @tags media, audio, content
 */
export const Lyrics = forwardRef<HTMLDivElement, LyricsProps>(function Lyrics(
  {
    text,
    verses: versesProp,
    progress = 0,
    activeIndex,
    autoScroll = true,
    centered = false,
    className,
    ...props
  },
  ref,
) {
  const verses = useMemo(
    () => versesProp ?? (text ? parseVerses(text) : []),
    [versesProp, text],
  );

  const active = useMemo(() => {
    if (activeIndex !== undefined) return activeIndex;
    if (verses.length === 0) return -1;
    // 재생 전에는 강조 없이 전체를 고르게 보여 준다
    if (progress <= 0) return -1;
    return Math.min(verses.length - 1, Math.floor(progress * verses.length));
  }, [activeIndex, progress, verses.length]);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLParagraphElement | null>(null);

  // 현재 연이 바뀔 때만 스크롤한다 — 진행률이 조금 움직일 때마다 굴리면 멀미 난다
  useEffect(() => {
    if (!autoScroll || active < 0) return;
    const el = activeRef.current;
    const box = boxRef.current;
    if (!el || !box) return;

    const elRect = el.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const delta =
      elRect.top - boxRect.top - (box.clientHeight / 2 - el.clientHeight / 2);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const top = box.scrollTop + delta;

    // Element.scrollTo 는 구형 브라우저·jsdom 에 없다. 없으면 즉시 점프로 떨어진다 —
    // 부드럽게 흐르지 않을 뿐, 현재 연이 화면 밖에 남는 일은 없어야 한다.
    if (typeof box.scrollTo === "function") {
      box.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    } else {
      box.scrollTop = top;
    }
  }, [active, autoScroll]);

  if (verses.length === 0) return null;

  return (
    <div
      ref={(node) => {
        boxRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
      }}
      className={cn(
        "flex flex-col gap-6 overflow-y-auto",
        centered && "text-center",
        className,
      )}
      {...props}
    >
      {verses.map((lines, i) => {
        const state =
          active < 0 ? "idle" : i === active ? "active" : i < active ? "past" : "ahead";
        return (
          <p
            key={i}
            ref={i === active ? activeRef : undefined}
            aria-current={state === "active" ? "true" : undefined}
            className={cn(
              "text-lg leading-relaxed transition-[opacity,filter] duration-500",
              state === "idle" && "opacity-80",
              state === "active" && "opacity-100 font-medium",
              // 지나간 연은 조금만 흐리게(따라 읽던 자리를 잃지 않도록),
              // 앞으로 올 연은 더 흐리게(시선이 앞서 나가지 않도록).
              // 투명도만으로는 글자가 여전히 또렷해 시선이 붙잡히므로, 초점이
              // 나간 것처럼 아주 옅은 blur 를 함께 건다 — transition 이 filter 를
              // 이미 나열하고 있었는데 정작 filter 를 바꾸는 규칙이 없었다.
              state === "past" && "opacity-45 blur-[0.4px]",
              state === "ahead" && "opacity-30 blur-[0.8px]",
            )}
          >
            {lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
});
