"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoAlbum } from "@/ds/patterns/PhotoAlbum";

export default function PhotoAlbumPage() {
  return (
    <ComponentPage
      name="PhotoAlbum"
      description="태그 필터 칩 + 그리드(uniform/masonry/mosaic) + 라이트박스 자동 연결."
      importPath='import { PhotoAlbum } from "@/ds/patterns/PhotoAlbum"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoAlbum
            title="2026 봄"
            layout="masonry"
            columns={3}
            photos={[1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
              id: String(i),
              src: `https://picsum.photos/seed/album${i}/400/${300 + (i % 3) * 80}`,
              alt: `사진 ${i}`,
              title: `여행 ${i}`,
              tag: i % 2 === 0 ? "여행" : "일상",
              likes: 10 * i,
              comments: i,
            }))}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
