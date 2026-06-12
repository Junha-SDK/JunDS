"use client";
import { forwardRef, useEffect, useRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  body: ReactNode;
  /** epoch ms 또는 ISO 문자열 */
  createdAt: string | number | Date;
  /** 첨부 (이미지/파일 URL) */
  attachmentUrl?: string;
  /** 읽음 처리된 사용자 id 목록 */
  readBy?: string[];
  /** 전송 상태 */
  status?: "sending" | "sent" | "failed";
}

export interface ChatThreadProps {
  /** 메시지 목록 (시간순 오름차순) */
  messages: ChatMessage[];
  /** 현재 사용자 id (메시지 정렬 좌/우 결정) */
  currentUserId: string;
  /** 타이핑 중인 사용자 (이름 또는 id 배열) */
  typingUsers?: string[];
  /** 메시지 클릭 콜백 */
  onMessageClick?: (msg: ChatMessage) => void;
  /** 메시지 재전송 (실패 시 표시) */
  onRetry?: (msg: ChatMessage) => void;
  /** 입력 슬롯 — 보통 `<form>` + `<Input>` + `<Button>` */
  composer?: ReactNode;
  /** 새 메시지 추가 시 자동 하단 스크롤 (기본 true) */
  autoScroll?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/** 같은 작성자의 연속된 메시지를 그룹핑 — 시각적으로 한 묶음. */
function groupMessages(msgs: ChatMessage[]): ChatMessage[][] {
  const groups: ChatMessage[][] = [];
  for (const m of msgs) {
    const last = groups[groups.length - 1];
    if (last && last[0].authorId === m.authorId) {
      last.push(m);
    } else {
      groups.push([m]);
    }
  }
  return groups;
}

function timeLabel(d: ChatMessage["createdAt"]) {
  const dt = new Date(d);
  return new Intl.DateTimeFormat("ko", { hour: "2-digit", minute: "2-digit" }).format(dt);
}

/**
 * 채팅 스레드 — 메시지 그룹핑 + 좌/우 정렬 + 읽음/타이핑/실패 상태 + 자동 스크롤.
 * @example
 * <ChatThread messages={msgs} currentUserId="me" typingUsers={["지우"]} composer={<MyComposer />} />
 * @status stable
 * @since 2.5.0
 * @tags chat, content
 */
export const ChatThread = forwardRef<HTMLElement, ChatThreadProps>(function ChatThread(
  { messages, currentUserId, typingUsers, onMessageClick, onRetry, composer, autoScroll = true, className },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);
  const groups = useMemo(() => groupMessages(messages), [messages]);
  const lastMsg = messages[messages.length - 1];

  useEffect(() => {
    if (!autoScroll) return;
    const newId = lastMsg?.id ?? null;
    if (newId === lastIdRef.current) return;
    lastIdRef.current = newId;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [autoScroll, lastMsg?.id]);

  return (
    <section ref={ref} className={cn("flex flex-col bg-surface border border-border rounded-xl overflow-hidden", className)} aria-label="채팅">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
        {groups.map((g, gi) => {
          const author = g[0];
          const mine = author.authorId === currentUserId;
          return (
            <div key={gi} className={cn("flex gap-2", mine && "flex-row-reverse")}>
              {!mine && (
                <div className="shrink-0">
                  {author.authorAvatar ? (
                    <img src={author.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-semibold inline-flex items-center justify-center">
                      {author.authorName.slice(0, 1)}
                    </div>
                  )}
                </div>
              )}
              <div className={cn("flex flex-col gap-1 min-w-0 max-w-[70%]", mine && "items-end")}>
                {!mine && <p className="text-[11px] text-muted px-1">{author.authorName}</p>}
                {g.map((m, mi) => {
                  const isLastOfGroup = mi === g.length - 1;
                  return (
                    <div key={m.id} className="flex items-end gap-1.5">
                      {mine && isLastOfGroup && (
                        <span className="text-[10px] text-muted shrink-0 mb-0.5">
                          {m.status === "failed" && (
                            <button
                              type="button"
                              onClick={() => onRetry?.(m)}
                              className="text-danger hover:underline cursor-pointer"
                              aria-label="재전송"
                            >
                              재전송
                            </button>
                          )}
                          {m.status === "sending" && <span aria-label="전송 중">…</span>}
                          {(!m.status || m.status === "sent") && (m.readBy?.length ?? 0) > 0 && (
                            <span aria-label={`${m.readBy!.length}명 읽음`}>읽음 {m.readBy!.length}</span>
                          )}
                          {isLastOfGroup && <span className="ml-1">{timeLabel(m.createdAt)}</span>}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onMessageClick?.(m)}
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm break-words text-left whitespace-pre-wrap",
                          mine
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-surface-soft text-foreground rounded-bl-md",
                          m.status === "failed" && "opacity-60",
                          onMessageClick ? "cursor-pointer" : "cursor-default",
                        )}
                      >
                        {m.body}
                        {m.attachmentUrl && (
                          <img src={m.attachmentUrl} alt="" className="mt-2 max-w-full rounded-lg" />
                        )}
                      </button>
                      {!mine && isLastOfGroup && (
                        <span className="text-[10px] text-muted shrink-0 mb-0.5">{timeLabel(m.createdAt)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {typingUsers && typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1" aria-live="polite">
            <div className="flex gap-1 px-3 py-2 rounded-2xl bg-surface-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-muted">{typingUsers.join(", ")} 입력 중…</span>
          </div>
        )}
      </div>

      {composer && (
        <div className="border-t border-border bg-surface px-3 py-2">{composer}</div>
      )}
    </section>
  );
});
ChatThread.displayName = "ChatThread";
