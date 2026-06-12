# Recipe — Story Bar (가로 스크롤 + 풀스크린 뷰어)

## Goal

Instagram/Snapchat 스타일 — 상단 가로 스크롤 스토리 링 + 클릭 시 풀스크린
스토리 시퀀스 뷰어. SNS 외에도 "오늘의 추천", "라이브 진행 중" UI에 응용 가능.

## Used components

- `StoryCircle` — `@/ds/composites/StoryCircle` (가로 바)
- `PhotoLightbox` — `@/ds/composites/PhotoLightbox` (재활용 — 화살표/Esc 지원)
- `useImagePreload` — `@/ds/hooks/useImagePreload` (다음 스토리 사전 로드)

## Recipe

```tsx
"use client";
import { useMemo, useState } from "react";
import { StoryCircle, type StoryRingState } from "@/ds/composites/StoryCircle";
import { PhotoLightbox, type LightboxPhoto } from "@/ds/composites/PhotoLightbox";
import { useImagePreload } from "@/ds/hooks/useImagePreload";

interface UserStory {
  id: string;
  name: string;
  avatar?: string;
  state: StoryRingState;
  /** 사용자가 올린 스토리 슬라이드 — 마지막 24h */
  slides: { src: string; caption?: string }[];
}

export function StoryBar({ users, onMarkRead }: { users: UserStory[]; onMarkRead?: (userId: string) => void }) {
  const [activeUserIdx, setActiveUserIdx] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  const activeUser = activeUserIdx !== null ? users[activeUserIdx] : null;
  const slides = activeUser?.slides ?? [];

  // 다음 사용자 첫 슬라이드까지 사전 로드
  const preloadUrls = useMemo(() => {
    if (activeUserIdx == null) return [];
    const next = users[activeUserIdx + 1];
    return [
      ...(activeUser?.slides.slice(slideIdx, slideIdx + 2).map((s) => s.src) ?? []),
      ...(next?.slides.slice(0, 1).map((s) => s.src) ?? []),
    ];
  }, [activeUser, activeUserIdx, slideIdx, users]);
  useImagePreload(preloadUrls);

  const open = (i: number) => {
    setActiveUserIdx(i);
    setSlideIdx(0);
  };

  const close = () => {
    if (activeUser) onMarkRead?.(activeUser.id);
    setActiveUserIdx(null);
  };

  // 슬라이드 끝까지 본 후 다음 사용자로 자동 이동
  const onSlideChange = (next: number) => {
    if (next >= slides.length) {
      const nextUser = activeUserIdx != null ? activeUserIdx + 1 : -1;
      if (nextUser >= 0 && nextUser < users.length) {
        if (activeUser) onMarkRead?.(activeUser.id);
        setActiveUserIdx(nextUser);
        setSlideIdx(0);
      } else {
        close();
      }
    } else if (next < 0) {
      // 첫 번째 사용자의 첫 슬라이드에서 더 뒤로 → 그냥 무시
      setSlideIdx(0);
    } else {
      setSlideIdx(next);
    }
  };

  const lightboxPhotos: LightboxPhoto[] = slides.map((s) => ({
    src: s.src,
    alt: activeUser?.name ?? "",
    caption: s.caption,
  }));

  return (
    <>
      <ul className="flex items-center gap-3 overflow-x-auto py-3 px-2 border-b border-border">
        {users.map((u, i) => (
          <li key={u.id}>
            <StoryCircle name={u.name} avatar={u.avatar} state={u.state} onClick={() => open(i)} />
          </li>
        ))}
      </ul>

      <PhotoLightbox
        open={activeUser !== null}
        photos={lightboxPhotos}
        index={slideIdx}
        onIndexChange={onSlideChange}
        onClose={close}
      />
    </>
  );
}
```

## Variations

- **자동 진행 (3초마다 next)**: `useEffect` + `setTimeout`로 `onSlideChange(slideIdx + 1)`
- **반응 보내기**: `PhotoLightbox`를 감싸고 하단에 `ReactionPicker` 추가
- **라이브 강조**: `state="live"` 사용자만 따로 그룹핑

## See also

- `.ai/recipes/social-feed.md` — 같은 `StoryBar`를 `SocialFeed.stories`에 위임
