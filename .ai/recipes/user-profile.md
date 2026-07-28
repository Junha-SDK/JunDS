# Recipe — User Profile Page

## Goal

SNS 사용자 프로필 — 헤더(배너/아바타/자기소개) + 탭(게시물/사진/좋아요) +
하단 무한 스크롤 컨텐츠.

## Used components

- `ProfileHeader` — `@/ds/composites/ProfileHeader`
- `FollowButton` — `@/ds/primitives/FollowButton`
- `Tabs` — `@/ds/composites/Tabs`
- `PhotoAlbum` — `@/ds/patterns/PhotoAlbum`
- `PostCard` — `@/ds/composites/PostCard`
- `useInfiniteFeed` — `@/ds/hooks/useInfiniteFeed`

## Recipe

```tsx
"use client";
import { useState } from "react";
import { ProfileHeader } from "@/ds/composites/ProfileHeader";
import { FollowButton } from "@/ds/primitives/FollowButton";
import { Tabs } from "@/ds/composites/Tabs";
import { PhotoAlbum } from "@/ds/patterns/PhotoAlbum";
import { PostCard } from "@/ds/composites/PostCard";

interface User {
  name: string;
  handle: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  location?: string;
  joinedAt?: string;
  verified?: boolean;
  stats: {
    followers: number | string;
    following: number | string;
    posts: number | string;
  };
}

export default function UserProfile({ user, isMine }: { user: User; isMine?: boolean }) {
  const [following, setFollowing] = useState(false);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <ProfileHeader
        avatar={user.avatar}
        banner={user.banner}
        name={user.name}
        handle={user.handle}
        bio={user.bio}
        location={user.location}
        joinedAt={user.joinedAt}
        verified={user.verified}
        stats={[
          {
            label: "팔로워",
            value: user.stats.followers,
            href: `/u/${user.handle}/followers`,
          },
          {
            label: "팔로잉",
            value: user.stats.following,
            href: `/u/${user.handle}/following`,
          },
          { label: "게시물", value: user.stats.posts },
        ]}
        actions={
          isMine ? (
            <button className="px-4 h-9 rounded-full border border-border text-sm font-semibold hover:bg-surface-soft cursor-pointer">
              프로필 편집
            </button>
          ) : (
            <FollowButton following={following} onChange={setFollowing} unfollowOnHover />
          )
        }
      />

      <Tabs
        items={[
          {
            key: "posts",
            label: "게시물",
            content: (
              <ul className="divide-y divide-border">
                <li className="py-3">
                  <PostCard
                    author={{ name: user.name, handle: user.handle }}
                    content="첫 게시물"
                    createdAt={new Date()}
                    likes={42}
                    comments={8}
                    liked
                    onLike={() => {}}
                  />
                </li>
              </ul>
            ),
          },
          {
            key: "photos",
            label: "사진",
            content: (
              <PhotoAlbum
                photos={[
                  {
                    id: "p1",
                    src: "https://picsum.photos/seed/u1/400/500",
                    alt: "1",
                    tag: "여행",
                  },
                  {
                    id: "p2",
                    src: "https://picsum.photos/seed/u2/400/300",
                    alt: "2",
                    tag: "음식",
                  },
                ]}
                layout="masonry"
                columns={3}
              />
            ),
          },
          {
            key: "likes",
            label: "좋아요",
            content: (
              <p className="text-sm text-muted py-8 text-center">
                좋아요한 게시물이 여기에 표시됩니다
              </p>
            ),
          },
        ]}
      />
    </main>
  );
}
```

## Variations

- **본인 프로필 vs 타인 프로필**: `isMine` 분기로 액션 버튼 교체
- **차단/뮤트**: `actions` 우측에 `Dropdown` 추가
- **공유 가능한 프로필 링크**: ProfileHeader 헤더 옆에 `SocialShare` 배치

## See also

- `.ai/recipes/social-feed.md`
- `app/design-system/composites/profile-header/page.tsx`
