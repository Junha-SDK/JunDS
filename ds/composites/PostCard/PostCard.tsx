"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface PostAuthor {
  name: string;
  handle?: string;
  avatar?: string;
  verified?: boolean;
}

export interface PostCardProps {
  /** 작성자 */
  author: PostAuthor;
  /** 본문 (텍스트/JSX) */
  content: ReactNode;
  /** 작성 시각 */
  createdAt?: string | Date;
  /** 첨부 미디어 (image url 또는 children) */
  media?: ReactNode;
  /** 좋아요 수 */
  likes?: number;
  /** 댓글 수 */
  comments?: number;
  /** 공유 수 */
  shares?: number;
  /** 좋아요 콜백 (있으면 좋아요 버튼 노출) */
  onLike?: () => void;
  /** 댓글 콜백 */
  onComment?: () => void;
  /** 공유 콜백 */
  onShare?: () => void;
  /** 좋아요 활성 상태 */
  liked?: boolean;
  /** 클릭 가능한 카드 (전체 클릭) */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
}

function relativeTime(d?: string | Date) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  const diffMin = (Date.now() - dt.getTime()) / 60000;
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${Math.floor(diffMin)}분 전`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간 전`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / 60 / 24)}일 전`;
  return new Intl.DateTimeFormat("ko", { month: "short", day: "numeric" }).format(dt);
}

/**
 * SNS 게시물 카드 — 작성자 + 본문 + 미디어 + 액션 바.
 * @example
 * <PostCard author={u} content="새 사진!" media={<img src="..." />} createdAt={t} likes={42} comments={8} liked onLike={…} />
 * @status stable
 * @since 2.4.0
 * @tags sns, content
 */
export const PostCard = forwardRef<HTMLElement, PostCardProps>(
  ({ author, content, createdAt, media, likes, comments, shares, onLike, onComment, onShare, liked, onClick, className }, ref) => {
    const time = relativeTime(createdAt);
    return (
      <article
        ref={ref}
        onClick={onClick}
        className={cn(
          "rounded-xl border border-border bg-surface p-4",
          onClick && "cursor-pointer hover:bg-surface-soft transition-colors",
          className,
        )}
      >
        <header className="flex items-center gap-3">
          {author.avatar ? (
            <img src={author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
              {author.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-foreground truncate">{author.name}</p>
              {author.verified && <span aria-label="인증됨" className="text-primary text-xs">✓</span>}
            </div>
            <p className="text-[11px] text-muted">
              {author.handle && <span>@{author.handle}</span>}
              {author.handle && time && <span className="mx-1">·</span>}
              {time && <span>{time}</span>}
            </p>
          </div>
        </header>

        <div className="mt-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</div>

        {media && <div className="mt-3 rounded-lg overflow-hidden border border-border">{media}</div>}

        {(onLike || onComment || onShare) && (
          <footer className="mt-3 flex items-center gap-1 -mx-2" onClick={(e) => e.stopPropagation()}>
            {onLike && (
              <button type="button" onClick={onLike} aria-pressed={liked} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer hover:bg-surface-soft", liked ? "text-rose-500" : "text-muted")}>
                <span aria-hidden="true">{liked ? "❤" : "🤍"}</span>
                {likes !== undefined && <span className="tabular-nums">{likes.toLocaleString()}</span>}
              </button>
            )}
            {onComment && (
              <button type="button" onClick={onComment} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted hover:bg-surface-soft transition-colors cursor-pointer">
                <span aria-hidden="true">💬</span>
                {comments !== undefined && <span className="tabular-nums">{comments.toLocaleString()}</span>}
              </button>
            )}
            {onShare && (
              <button type="button" onClick={onShare} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted hover:bg-surface-soft transition-colors cursor-pointer">
                <span aria-hidden="true">↗</span>
                {shares !== undefined && <span className="tabular-nums">{shares.toLocaleString()}</span>}
              </button>
            )}
          </footer>
        )}
      </article>
    );
  },
);
PostCard.displayName = "PostCard";
