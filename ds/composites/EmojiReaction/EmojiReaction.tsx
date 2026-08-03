"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface EmojiReactionItem {
  /** 이모지 캐릭터 */
  emoji: string;
  /** 카운트 */
  count: number;
  /** 현재 사용자가 반응했는지 */
  reactedByMe?: boolean;
  /** 사용자 라벨 (tooltip용) */
  users?: string[];
}

export interface EmojiReactionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "onToggle"> {
  /** 반응 목록 */
  reactions: EmojiReactionItem[];
  /** 반응 토글 */
  onToggle?: (emoji: string) => void;
  /** + 버튼 클릭 (이모지 피커 열기) */
  onAddReaction?: () => void;
  /** + 버튼 노출 */
  showAddButton?: boolean;
}

/**
 * Slack/GitHub 스타일 이모지 반응 바.
 * @example
 * <EmojiReaction reactions={[{emoji:"👍", count:3, reactedByMe:true}]} onToggle={console.log} />
 * @status stable
 * @since 2.3.0
 * @tags social
 */
export const EmojiReaction = forwardRef<HTMLDivElement, EmojiReactionProps>(function EmojiReaction(
  { reactions, onToggle, onAddReaction, showAddButton = true, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label="반응"
      className={cn("inline-flex items-center gap-1 flex-wrap", className)}
      {...props}
    >
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle?.(r.emoji)}
          aria-pressed={r.reactedByMe || undefined}
          title={r.users?.join(", ")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs cursor-pointer",
            "transition-[background-color,border-color,transform] duration-150 active:scale-[0.94]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            r.reactedByMe
              ? // bg-primary-soft 는 @theme 에 없는 이름이라 배경이 아예 칠해지지 않았다.
                // 선택 상태가 테두리 하나로만 읽히던 원인 — 실재하는 primary-light 로 옮긴다.
                "border-primary bg-primary-light text-primary-ink"
              : "border-border bg-surface hover:bg-surface-soft",
          )}
        >
          <span className="text-sm leading-none">{r.emoji}</span>
          <span className="font-medium tabular-nums">{r.count}</span>
        </button>
      ))}
      {showAddButton && (
        <button
          type="button"
          onClick={onAddReaction}
          aria-label="반응 추가"
          className={cn(
            "inline-flex items-center justify-center w-7 h-6 rounded-full border border-border bg-surface text-sm cursor-pointer",
            "text-muted hover:text-foreground hover:bg-surface-soft",
            "transition-[color,background-color,transform] duration-150 active:scale-[0.94]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
          )}
        >
          ＋
        </button>
      )}
    </div>
  );
});
