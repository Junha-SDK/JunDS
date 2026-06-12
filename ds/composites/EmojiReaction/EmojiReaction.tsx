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

export interface EmojiReactionProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "onToggle"> {
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
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors cursor-pointer",
            r.reactedByMe
              ? "border-primary bg-primary-soft text-primary"
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
          className="inline-flex items-center justify-center w-7 h-6 rounded-full border border-border bg-surface hover:bg-surface-soft text-muted hover:text-foreground transition-colors cursor-pointer text-sm"
        >
          ＋
        </button>
      )}
    </div>
  );
});
