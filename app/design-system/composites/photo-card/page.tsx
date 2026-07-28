"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoCard } from "@/ds/composites/PhotoCard";

export default function PhotoCardPage() {
  return (
    <ComponentPage
      name="PhotoCard"
      description="사진 카드 — 이미지 + 캡션 + 좋아요/댓글 메타, hover 효과 옵션."
      importPath='import { PhotoCard } from "@/ds/composites/PhotoCard"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoCard
            src="https://picsum.photos/seed/p1/400/500"
            alt="풍경"
            title="동해 일출"
            meta="2026.04 · 강릉"
            likes={142}
            comments={8}
            interactive
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
