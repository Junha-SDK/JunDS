"use client";
import { forwardRef, useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { EmptyState } from "../../composites/EmptyState";
import type { ReactNode } from "react";

export interface EmailFolder {
  id: string;
  label: string;
  /** 안 읽은 메일 수 */
  unreadCount?: number;
  icon?: ReactNode;
}

export interface EmailMessage {
  id: string;
  folderId: string;
  /** 발신자 표시 이름 */
  from: string;
  fromAvatar?: string;
  subject: string;
  /** 본문 미리보기 (한 줄) */
  preview: string;
  /** 본문 본체 (선택, 본문 패널에서 노출) */
  body?: ReactNode;
  /** ISO 날짜 또는 epoch */
  receivedAt: string | number | Date;
  unread?: boolean;
  starred?: boolean;
  /** 첨부 개수 */
  attachments?: number;
  /** 라벨 태그 */
  labels?: string[];
}

export interface EmailInboxProps {
  /** 좌측 폴더 목록 */
  folders: EmailFolder[];
  /** 모든 메일 (folderId로 필터링) */
  messages: EmailMessage[];
  /** 활성 폴더 id */
  activeFolderId: string;
  /** 폴더 변경 콜백 */
  onFolderChange: (id: string) => void;
  /** 활성 메일 id (본문 패널 표시) */
  activeMessageId?: string | null;
  /** 메일 선택 콜백 */
  onMessageSelect: (msg: EmailMessage) => void;
  /** 별표 토글 */
  onToggleStar?: (id: string) => void;
  /** 검색 텍스트 */
  search?: string;
  /** 검색 변경 */
  onSearchChange?: (q: string) => void;
  /** 추가 클래스 */
  className?: string;
}

function timeLabel(d: EmailMessage["receivedAt"]) {
  const dt = new Date(d);
  const now = new Date();
  if (isNaN(dt.getTime())) return "";
  if (dt.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("ko", { hour: "2-digit", minute: "2-digit" }).format(dt);
  }
  return new Intl.DateTimeFormat("ko", { month: "short", day: "numeric" }).format(dt);
}

/**
 * 3-pane 메일 인박스 — 폴더 / 리스트 / 본문 패널.
 * 모바일은 자동으로 1-pane 스택 (lg breakpoint).
 *
 * @example
 * <EmailInbox folders={folders} messages={mails} activeFolderId={f}
 *   onFolderChange={setF} activeMessageId={m} onMessageSelect={(m)=>setM(m.id)} />
 *
 * @status stable
 * @since 2.5.0
 * @tags email, layout
 */
export const EmailInbox = forwardRef<HTMLElement, EmailInboxProps>(function EmailInbox(
  { folders, messages, activeFolderId, onFolderChange, activeMessageId, onMessageSelect, onToggleStar, search, onSearchChange, className },
  ref,
) {
  const [internalSearch, setInternalSearch] = useState("");
  const q = search ?? internalSearch;
  const setQ = (v: string) => { onSearchChange?.(v); if (search === undefined) setInternalSearch(v); };

  const filtered = useMemo(() => {
    const base = messages.filter((m) => m.folderId === activeFolderId);
    if (!q.trim()) return base;
    const needle = q.toLowerCase();
    return base.filter(
      (m) =>
        m.subject.toLowerCase().includes(needle) ||
        m.preview.toLowerCase().includes(needle) ||
        m.from.toLowerCase().includes(needle),
    );
  }, [messages, activeFolderId, q]);

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) ?? null,
    [messages, activeMessageId],
  );

  return (
    <section ref={ref} className={cn("grid grid-cols-1 lg:grid-cols-[200px_360px_1fr] h-[640px] rounded-xl border border-border bg-surface overflow-hidden", className)} aria-label="이메일 인박스">
      {/* 폴더 패널 */}
      <nav aria-label="폴더" className="hidden lg:block border-r border-border p-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {folders.map((f) => {
            const active = f.id === activeFolderId;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onFolderChange(f.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm cursor-pointer",
                    active ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-surface-soft",
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {f.icon && <span aria-hidden="true">{f.icon}</span>}
                    <span className="truncate">{f.label}</span>
                  </span>
                  {f.unreadCount !== undefined && f.unreadCount > 0 && (
                    <span className="text-[10px] tabular-nums px-1.5 rounded-full bg-primary/15 text-primary">
                      {f.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 리스트 패널 */}
      <div className="border-r border-border flex flex-col min-h-0">
        <div className="p-2 border-b border-border">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색…"
            aria-label="이메일 검색"
            className="w-full h-9 px-3 text-sm rounded-md border border-border bg-surface focus:outline-none focus:border-primary"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyState icon="📭" title="메일이 없습니다" description={q ? "검색 결과 없음" : "받은 편지함이 비었습니다"} />
          </div>
        ) : (
        <ul className="flex-1 overflow-y-auto" aria-label="메일 목록">
          {filtered.map((m) => {
            const active = m.id === activeMessageId;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onMessageSelect(m)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full px-3 py-2.5 text-left border-b border-border-light cursor-pointer transition-colors",
                    active ? "bg-primary/10" : m.unread ? "bg-surface" : "bg-surface-soft/40",
                    "hover:bg-surface-soft",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className={cn("inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", m.unread ? "bg-primary" : "bg-transparent")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={cn("text-sm truncate", m.unread ? "font-semibold text-foreground" : "text-foreground")}>
                          {m.from}
                        </span>
                        <span className="text-[10px] text-muted tabular-nums shrink-0">{timeLabel(m.receivedAt)}</span>
                      </div>
                      <p className={cn("text-sm truncate", m.unread ? "font-medium text-foreground" : "text-muted")}>
                        {m.subject}
                      </p>
                      <p className="text-xs text-muted truncate">{m.preview}</p>
                    </div>
                    {onToggleStar && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleStar(m.id); }}
                        aria-label={m.starred ? "별표 해제" : "별표"}
                        aria-pressed={m.starred}
                        className={cn("text-xs cursor-pointer", m.starred ? "text-amber-500" : "text-muted-light")}
                      >
                        {m.starred ? "★" : "☆"}
                      </button>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        )}
      </div>

      {/* 본문 패널 */}
      <article className="hidden lg:flex flex-col min-h-0" aria-label="메일 본문">
        {activeMessage ? (
          <>
            <header className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{activeMessage.subject}</h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                {activeMessage.fromAvatar ? (
                  <img src={activeMessage.fromAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center text-[11px] font-semibold">
                    {activeMessage.from.slice(0, 1)}
                  </div>
                )}
                <span className="font-medium text-foreground">{activeMessage.from}</span>
                <span>·</span>
                <span>{timeLabel(activeMessage.receivedAt)}</span>
                {activeMessage.attachments !== undefined && activeMessage.attachments > 0 && (
                  <>
                    <span>·</span>
                    <span aria-label={`첨부 ${activeMessage.attachments}개`}>📎 {activeMessage.attachments}</span>
                  </>
                )}
              </div>
              {activeMessage.labels && activeMessage.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {activeMessage.labels.map((l) => (
                    <span key={l} className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-soft text-[10px] text-foreground">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-4 prose prose-neutral dark:prose-invert max-w-none text-sm">
              {activeMessage.body ?? <p className="text-muted">{activeMessage.preview}</p>}
            </div>
          </>
        ) : (
          <EmptyState icon="✉️" title="메일을 선택하세요" description="좌측 목록에서 읽을 메일을 클릭하세요." />
        )}
      </article>
    </section>
  );
});
EmailInbox.displayName = "EmailInbox";
