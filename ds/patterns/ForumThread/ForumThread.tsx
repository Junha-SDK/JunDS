"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useMounted } from "../../hooks/useMounted";
import type { ReactNode } from "react";

export interface ForumPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  body: ReactNode;
  createdAt: string | number | Date;
  upvotes?: number;
  myVote?: 1 | -1 | 0;
  accepted?: boolean;
  replies?: ForumPost[];
}

export interface ForumThreadProps {
  title: string;
  tags?: string[];
  opening: ForumPost;
  answers: ForumPost[];
  onVote?: (postId: string, dir: 1 | -1 | 0) => void;
  onAccept?: (postId: string) => void;
  replyComposer?: ReactNode;
  className?: string;
}

function relativeTime(d: ForumPost["createdAt"]) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const diffMin = (Date.now() - dt.getTime()) / 60000;
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${Math.floor(diffMin)}분 전`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간 전`;
  if (diffMin < 60 * 24 * 30) return `${Math.floor(diffMin / 60 / 24)}일 전`;
  return new Intl.DateTimeFormat("ko", {
    year: "2-digit",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

/**
 * 현재 시각·타임존·로케일 어디에도 기대지 않는 표기.
 * 서버와 클라이언트가 반드시 같은 문자열을 낸다.
 */
function absoluteTime(d: ForumPost["createdAt"]) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const [year, month, day] = dt.toISOString().slice(0, 10).split("-");
  return `${year.slice(2)}.${month}.${day}`;
}

function PostBlock({
  post,
  onVote,
  onAccept,
  depth = 0,
}: {
  post: ForumPost;
  onVote?: ForumThreadProps["onVote"];
  onAccept?: ForumThreadProps["onAccept"];
  depth?: number;
}) {
  const score = post.upvotes ?? 0;
  // 상대 시간은 Date.now() 에 의존한다 — 렌더 중에 부르면 프리렌더 산출물이 매 빌드마다
  // 달라지고 하이드레이션과도 어긋난다. 마운트 전에는 고정된 날짜를 보이고 뒤에 바꾼다.
  const mounted = useMounted();

  return (
    <article
      className={cn(
        "flex gap-3 p-4 rounded-xl border bg-surface",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]",
        post.accepted ? "border-success/40 bg-success/5" : "border-border",
        depth > 0 && "ml-6",
      )}
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onVote?.(post.id, post.myVote === 1 ? 0 : 1)}
          aria-pressed={post.myVote === 1}
          aria-label="추천"
          className={cn(
            "w-7 h-7 inline-flex items-center justify-center rounded-lg cursor-pointer",
            "transition-colors duration-150 hover:bg-surface-soft active:scale-90 motion-reduce:active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            post.myVote === 1 ? "text-primary-ink bg-primary/10" : "text-muted",
          )}
        >
          ▲
        </button>
        <span className="text-sm font-semibold tabular-nums">{score}</span>
        <button
          type="button"
          onClick={() => onVote?.(post.id, post.myVote === -1 ? 0 : -1)}
          aria-pressed={post.myVote === -1}
          aria-label="비추천"
          className={cn(
            "w-7 h-7 inline-flex items-center justify-center rounded-lg cursor-pointer",
            "transition-colors duration-150 hover:bg-surface-soft active:scale-90 motion-reduce:active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            post.myVote === -1 ? "text-danger bg-danger/10" : "text-muted",
          )}
        >
          ▼
        </button>
        {post.accepted && (
          <span aria-label="채택된 답변" className="mt-1 text-success text-lg">
            ✓
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <header className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/15 text-primary-ink inline-flex items-center justify-center text-[10px] font-semibold">
              {post.authorName.slice(0, 1)}
            </div>
          )}
          <span className="font-medium text-foreground">{post.authorName}</span>
          {post.authorRole && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary-ink text-[10px] font-semibold">
              {post.authorRole}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span className="whitespace-nowrap tabular-nums">
            {mounted ? relativeTime(post.createdAt) : absoluteTime(post.createdAt)}
          </span>
          {onAccept && depth > 0 && !post.accepted && (
            <button
              type="button"
              onClick={() => onAccept(post.id)}
              className="ml-auto shrink-0 rounded-md px-1 -mx-1 text-xs text-success hover:underline cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              채택
            </button>
          )}
        </header>
        <div className="mt-2 prose prose-neutral dark:prose-invert prose-sm max-w-none">
          {post.body}
        </div>
        {post.replies && post.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.replies.map((r) => (
              <PostBlock
                key={r.id}
                post={r}
                onVote={onVote}
                onAccept={onAccept}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * 포럼 스레드 — Stack Overflow 스타일 질문/답변 + 투표 + 채택.
 * @example
 * <ForumThread title="React 19 use() 사용법" opening={op} answers={ans} onVote={vote} onAccept={accept} />
 * @status stable
 * @since 2.5.0
 * @tags forum, content
 */
export const ForumThread = forwardRef<HTMLElement, ForumThreadProps>(function ForumThread(
  { title, tags, opening, answers, onVote, onAccept, replyComposer, className },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cn("max-w-3xl mx-auto p-4 space-y-4", className)}
      aria-label="포럼 스레드"
    >
      <header>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {tags && tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-soft text-[11px] text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </header>

      <PostBlock post={opening} onVote={onVote} />

      <div>
        <h2 className="text-sm font-semibold mb-2 text-muted uppercase tracking-wider">
          {answers.length}개의 답변
        </h2>
        <div className="space-y-3">
          {answers.map((a) => (
            <PostBlock key={a.id} post={a} onVote={onVote} onAccept={onAccept} depth={1} />
          ))}
        </div>
      </div>

      {replyComposer && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold mb-2">답변 작성</h3>
          {replyComposer}
        </div>
      )}
    </section>
  );
});
ForumThread.displayName = "ForumThread";
