# Recipe — Social Feed

## Goal

상단 스토리 바 + 무한 스크롤 게시물 + 인터랙션(좋아요/댓글/공유). Twitter/
Instagram 스타일의 표준 피드.

## Used components

- `SocialFeed` — `@/ds/patterns/SocialFeed` (전체 컨테이너 + 무한 스크롤 트리거)
- `PostCard` — `@/ds/composites/PostCard`
- `StoryCircle` — `@/ds/composites/StoryCircle` (`SocialFeed.stories`로 자동)
- `LikeButton`, `MentionChip`, `Hashtag` — `@/ds/primitives/*`
- `useInfiniteFeed` — `@/ds/hooks/useInfiniteFeed`

## Recipe

```tsx
"use client";
import { useState } from "react";
import { SocialFeed, type SocialFeedStory } from "@/ds/patterns/SocialFeed";
import { PostCard } from "@/ds/composites/PostCard";
import { MentionChip } from "@/ds/primitives/MentionChip";
import { Hashtag } from "@/ds/primitives/Hashtag";
import { useInfiniteFeed } from "@/ds/hooks/useInfiniteFeed";

interface Post {
  id: string;
  author: { name: string; handle?: string; avatar?: string; verified?: boolean };
  body: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  liked?: boolean;
}

const stories: SocialFeedStory[] = [
  { id: "me", name: "나", state: "muted" },
  { id: "1", name: "준하", state: "unread" },
  { id: "2", name: "지우", state: "live" },
  { id: "3", name: "민호", state: "read" },
  { id: "4", name: "수민", state: "unread" },
];

async function fetchPostsPage(cursor: string | number | null | undefined): Promise<{ items: Post[]; nextCursor: string | null }> {
  const url = `/api/posts?cursor=${cursor ?? ""}`;
  const r = await fetch(url);
  return r.json();
}

export default function FeedPage() {
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const feed = useInfiniteFeed<Post>({ fetchPage: fetchPostsPage, getKey: (p) => p.id });

  const toggleLike = (postId: string) => {
    setLikedSet((cur) => {
      const next = new Set(cur);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  return (
    <SocialFeed
      stories={stories}
      onStoryClick={(id) => console.log("open story", id)}
      hasMore={feed.hasMore}
      loading={feed.loading}
      onLoadMore={feed.loadMore}
      emptyTitle="아직 게시물이 없어요"
      emptyDescription="팔로우할 사람을 찾아 보세요."
    >
      {feed.items.map((p) => {
        const liked = likedSet.has(p.id) || !!p.liked;
        return (
          <PostCard
            key={p.id}
            author={p.author}
            content={
              <RichBody body={p.body} />
            }
            createdAt={p.createdAt}
            media={p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full" /> : undefined}
            likes={p.likes + (likedSet.has(p.id) ? 1 : 0)}
            comments={p.comments}
            liked={liked}
            onLike={() => toggleLike(p.id)}
            onComment={() => {}}
            onShare={() => {}}
          />
        );
      })}
    </SocialFeed>
  );
}

/** @-mention과 #-tag을 칩으로 변환하는 단순 렌더러 */
function RichBody({ body }: { body: string }) {
  const parts = body.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@")) return <MentionChip key={i} handle={part.slice(1)} href={`/u/${part.slice(1)}`} />;
        if (part.startsWith("#")) return <Hashtag key={i} tag={part.slice(1)} href={`/t/${part.slice(1)}`} />;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
```

## Variations

- **이미지 캐러셀 게시물**: `media`에 `<PhotoCarousel photos={…} />`를 넣어 다중 이미지 게시물
- **답글 트리**: 게시물 클릭 시 `CommentThread`로 별도 화면 열기
- **투표 게시물**: `media` 자리에 `<PollCard>` (composite)

## See also

- `.ai/recipes/user-profile.md` — 같은 PostCard를 프로필 탭에 재사용
- `.ai/recipes/notification-stack.md`
