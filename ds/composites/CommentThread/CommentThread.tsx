"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  body: ReactNode;
  createdAt?: string | Date;
  likes?: number;
  liked?: boolean;
  replies?: Comment[];
}

export interface CommentThreadProps {
  comments: Comment[];
  /** 좋아요 토글 */
  onToggleLike?: (commentId: string) => void;
  /** 답글 작성 콜백 */
  onReply?: (commentId: string) => void;
  /** 최대 표시 깊이 */
  maxDepth?: number;
  /** 추가 클래스 */
  className?: string;
}

function relativeTime(d?: string | Date) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - dt.getTime()) / 60000;
  if (diff < 1) return "방금";
  if (diff < 60) return `${Math.floor(diff)}분`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간`;
  return `${Math.floor(diff / 1440)}일`;
}

function CommentRow({ comment, depth, maxDepth, onToggleLike, onReply }: {
  comment: Comment; depth: number; maxDepth: number;
  onToggleLike?: CommentThreadProps["onToggleLike"];
  onReply?: CommentThreadProps["onReply"];
}) {
  return (
    <li className="flex gap-3" style={{ marginLeft: depth * 32 }}>
      <div className="shrink-0">
        {comment.authorAvatar ? (
          <img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
            {comment.authorName.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-surface-soft px-3 py-2">
          <div className="flex items-baseline gap-2">
            <p className="text-xs font-semibold text-foreground">{comment.authorName}</p>
            {comment.createdAt && <span className="text-[10px] text-muted">{relativeTime(comment.createdAt)}</span>}
          </div>
          <p className="text-sm text-foreground mt-0.5 leading-relaxed">{comment.body}</p>
        </div>
        <div className="mt-1 ml-3 flex items-center gap-3 text-[11px]">
          {onToggleLike && (
            <button
              type="button"
              onClick={() => onToggleLike(comment.id)}
              aria-pressed={comment.liked}
              className={cn("transition-colors cursor-pointer", comment.liked ? "text-rose-500" : "text-muted hover:text-foreground")}
            >
              {comment.liked ? "❤" : "🤍"} {comment.likes ?? 0}
            </button>
          )}
          {onReply && depth < maxDepth && (
            <button type="button" onClick={() => onReply(comment.id)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
              답글
            </button>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
          <ul className="mt-2 space-y-3">
            {comment.replies.map((r) => (
              <CommentRow key={r.id} comment={r} depth={depth + 1} maxDepth={maxDepth} onToggleLike={onToggleLike} onReply={onReply} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/**
 * 중첩 댓글 스레드 — 좋아요/답글 + 깊이 제한.
 * @example
 * <CommentThread comments={comments} onToggleLike={…} onReply={…} maxDepth={3} />
 * @status stable
 * @since 2.4.0
 * @tags sns, content
 */
export const CommentThread = forwardRef<HTMLUListElement, CommentThreadProps>(
  ({ comments, onToggleLike, onReply, maxDepth = 3, className }, ref) => (
    <ul ref={ref} className={cn("space-y-3", className)} aria-label="댓글">
      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} depth={0} maxDepth={maxDepth} onToggleLike={onToggleLike} onReply={onReply} />
      ))}
    </ul>
  ),
);
CommentThread.displayName = "CommentThread";
