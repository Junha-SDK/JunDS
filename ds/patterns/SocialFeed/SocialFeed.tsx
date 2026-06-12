"use client";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import { StoryCircle } from "../../composites/StoryCircle";
import type { StoryRingState } from "../../composites/StoryCircle";
import { Spinner } from "../../primitives/Spinner";
import { EmptyState } from "../../composites/EmptyState";
import { useT } from "../../providers/I18nProvider";
import type { ReactNode } from "react";

export interface SocialFeedStory {
  id: string;
  name: string;
  avatar?: string;
  state?: StoryRingState;
}

export interface SocialFeedProps {
  /** 상단 스토리 바 (선택) */
  stories?: SocialFeedStory[];
  /** 스토리 클릭 콜백 */
  onStoryClick?: (id: string) => void;
  /** 게시물 노드 (대체로 PostCard 리스트) */
  children: ReactNode;
  /** 더 불러올 데이터 있는지 */
  hasMore?: boolean;
  /** 로딩 중 표시 */
  loading?: boolean;
  /** 무한 스크롤 트리거 (관찰자가 화면에 들어오면 호출) */
  onLoadMore?: () => void;
  /** 데이터 비었을 때 표시할 엠티 메시지 */
  emptyTitle?: string;
  /** 비었을 때 표시할 설명 */
  emptyDescription?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * SNS 피드 — 상단 스토리 바 + 무한 스크롤 게시물 리스트.
 * @example
 * <SocialFeed stories={stories} onStoryClick={openStory} hasMore={hasMore} onLoadMore={fetchMore}>
 *   {posts.map((p) => <PostCard key={p.id} {...p} />)}
 * </SocialFeed>
 * @status stable
 * @since 2.4.0
 * @tags sns, layout
 */
export const SocialFeed = forwardRef<HTMLElement, SocialFeedProps>(function SocialFeed(
  { stories, onStoryClick, children, hasMore, loading, onLoadMore, emptyTitle = "게시물이 없습니다", emptyDescription, className },
  ref,
) {
  const t = useT();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [onLoadMore, hasMore]);

  const hasPosts = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <section ref={ref} className={cn("max-w-2xl mx-auto", className)} aria-label={t("feedAriaLabel")}>
      {stories && stories.length > 0 && (
        <div className="px-2 py-3 border-b border-border overflow-x-auto">
          <ul className="flex items-center gap-3">
            {stories.map((s) => (
              <li key={s.id}>
                <StoryCircle name={s.name} avatar={s.avatar} state={s.state} onClick={() => onStoryClick?.(s.id)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasPosts && !loading ? (
        <EmptyState icon="📭" title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="divide-y divide-border" aria-label={t("feedItems")}>
          {Array.isArray(children) ? children.map((child, i) => <li key={i} className="py-3">{child}</li>) : <li className="py-3">{children}</li>}
        </ul>
      )}

      <div ref={sentinelRef} className="py-6 flex items-center justify-center" aria-live="polite">
        {loading && <Spinner />}
        {!loading && !hasMore && hasPosts && <p className="text-xs text-muted">{t("feedEnd")}</p>}
      </div>
    </section>
  );
});
SocialFeed.displayName = "SocialFeed";
