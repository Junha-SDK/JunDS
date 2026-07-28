# Recipe — Photo Album Page

## Goal

여행/이벤트 사진을 태그 필터 + 그리드 + 라이트박스로 한 화면에 묶는다.
업로드 영역까지 포함해 "내 앨범" 페이지가 된다.

## Used components

- `PhotoAlbum` — `@/ds/patterns/PhotoAlbum` (필터+그리드+라이트박스)
- `PhotoUploader` — `@/ds/composites/PhotoUploader`
- `PhotoFilters` — `@/ds/composites/PhotoFilters`
- `ImageWithFallback` — `@/ds/composites/ImageWithFallback`
- `useImagePreload` — `@/ds/hooks/useImagePreload`

## Recipe

```tsx
"use client";
import { useState } from "react";
import { PhotoAlbum } from "@/ds/patterns/PhotoAlbum";
import { PhotoUploader, type PhotoPreview } from "@/ds/composites/PhotoUploader";
import { useImagePreload } from "@/ds/hooks/useImagePreload";

interface AlbumPhoto {
  id: string;
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  tag?: string;
  likes?: number;
  comments?: number;
}

const initialPhotos: AlbumPhoto[] = [
  {
    id: "1",
    src: "/photos/1.jpg",
    alt: "동해 일출",
    title: "동해",
    tag: "여행",
    likes: 42,
    comments: 3,
  },
  {
    id: "2",
    src: "/photos/2.jpg",
    alt: "라테",
    title: "카페",
    tag: "일상",
    likes: 18,
    comments: 1,
  },
];

export default function AlbumPage() {
  const [photos, setPhotos] = useState<AlbumPhoto[]>(initialPhotos);
  const [pending, setPending] = useState<PhotoPreview[]>([]);

  // 라이트박스가 다음 사진을 즉시 보여주도록 사전 로드
  useImagePreload(photos.slice(0, 6).map((p) => p.src));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <PhotoUploader
        photos={pending}
        onAdd={(added) => setPending((cur) => [...cur, ...added])}
        onRemove={(id) => setPending((cur) => cur.filter((p) => p.id !== id))}
        maxCount={9}
        maxSize={5 * 1024 * 1024}
      />

      {pending.length > 0 && (
        <button
          type="button"
          onClick={async () => {
            const uploaded = await Promise.all(
              pending.map(async (p, i) => ({
                id: `up-${Date.now()}-${i}`,
                src: p.url,
                alt: p.file.name,
                title: p.file.name,
                tag: "신규",
              })),
            );
            setPhotos((arr) => [...uploaded, ...arr]);
            setPending([]);
          }}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold cursor-pointer hover:brightness-110"
        >
          {pending.length}장 업로드
        </button>
      )}

      <PhotoAlbum title="내 앨범" photos={photos} layout="masonry" columns={4} />
    </main>
  );
}
```

## Variations

- **흑백 필터 미리보기**: `PhotoAlbum` 대신 `PhotoFilters`로 사용자 선택 → CSS 변수 갱신
- **EXIF 패널 사이드**: 라이트박스 위 `ExifPanel`로 카메라 메타 표시
- **무한 스크롤**: `useInfiniteFeed`로 페이지 단위 사진 로드 후 photos 배열에 append

## See also

- `app/design-system/patterns/photo-album/page.tsx`
- `.ai/recipes/social-feed.md` — 사진/영상이 섞인 피드
