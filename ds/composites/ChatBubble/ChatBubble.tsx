"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ChatBubbleProps {
  /** 메시지 본문 */
  children: ReactNode;
  /** 보낸 사람 이름 */
  sender?: string;
  /** 아바타 요소 */
  avatar?: ReactNode;
  /** 타임스탬프 텍스트 */
  timestamp?: string;
  /** 말풍선 정렬 위치 */
  side?: "left" | "right";
  /** 말풍선 스타일 변형 */
  variant?: "default" | "primary";
  /** 추가 클래스 */
  className?: string;
}

/**
 * 채팅 메시지 말풍선.
 * @example
 * <ChatBubble sender="홍길동" side="left" timestamp="오후 3:24">
 *   안녕하세요!
 * </ChatBubble>
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function ChatBubble({
  children, sender, avatar, timestamp, side = "left", variant = "default", className,
}: ChatBubbleProps) {
  const isRight = side === "right";
  return (
    <div className={cn("flex gap-2 max-w-[80%]", isRight && "ml-auto flex-row-reverse", className)}>
      {avatar && <div className="shrink-0 mt-auto">{avatar}</div>}
      <div>
        {sender && <p className={cn("text-[10px] text-muted mb-0.5 px-1", isRight && "text-right")}>{sender}</p>}
        <div className={cn(
          "px-3.5 py-2 rounded-2xl text-sm leading-relaxed transition-shadow duration-200",
          isRight
            ? variant === "primary"
              ? "bg-primary text-white rounded-br-md shadow-[0_2px_8px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.15)]"
              : "bg-gray-100 text-foreground rounded-br-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04]"
            : "bg-gray-100 text-foreground rounded-bl-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04]",
        )}>
          {children}
        </div>
        {timestamp && <p className={cn("text-[10px] text-muted mt-0.5 px-1", isRight && "text-right")}>{timestamp}</p>}
      </div>
    </div>
  );
}
