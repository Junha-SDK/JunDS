"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export type StoryRingState = "unread" | "read" | "live" | "muted";

export interface StoryCircleProps {
  /** 사용자 표시 이름 */
  name: string;
  /** 아바타 이미지 URL */
  avatar?: string;
  /** 링 상태 */
  state?: StoryRingState;
  /** 크기 (px) */
  size?: number;
  /** 클릭 콜백 */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
}

// unread/live 의 그라디언트는 이 컴포넌트의 정체성이라 그대로 둔다.
// read/muted 는 "색 없음"을 뜻하는 중립 링인데, `dark:` 는 이 저장소에서 OS 선호도를 따르고
// 테마는 [data-theme] 로 바뀐다 — 둘이 어긋나면 다크 앱에서 링만 밝은 회색으로 남는다.
const ringMap: Record<StoryRingState, string> = {
  unread: "bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-amber-500 p-[2.5px]",
  read: "bg-border p-[2px]",
  live: "bg-gradient-to-tr from-rose-500 to-rose-700 p-[2.5px]",
  muted: "bg-border-light p-[2px]",
};

/**
 * 스토리 링 — Instagram 스타일 그라디언트 링 + 상태.
 * @example
 * <StoryCircle name="준하" avatar="/me.jpg" state="unread" onClick={openStory} />
 * @status stable
 * @since 2.4.0
 * @tags sns, media
 */
export const StoryCircle = forwardRef<HTMLButtonElement, StoryCircleProps>(
  ({ name, avatar, state = "unread", size = 64, onClick, className }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={`${name} 스토리`}
      className={cn(
        "inline-flex flex-col items-center gap-1 cursor-pointer rounded-xl p-1",
        "transition-transform duration-150 active:scale-95 motion-reduce:active:scale-100 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full inline-flex items-center justify-center relative",
          ringMap[state],
        )}
        style={{ width: size, height: size }}
      >
        <div className="rounded-full bg-surface w-full h-full p-[2px]">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-primary/15 text-primary-ink flex items-center justify-center text-sm font-bold">
              {name.slice(0, 1)}
            </div>
          )}
        </div>
        {state === "live" && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-bold tracking-wider">
            LIVE
          </span>
        )}
      </div>
      <span className="text-[11px] text-foreground max-w-[72px] truncate">{name}</span>
    </button>
  ),
);
StoryCircle.displayName = "StoryCircle";
