"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BookCover } from "@/ds/composites/BookCover";

export default function BookCoverPage() {
  return (
    <ComponentPage
      name="BookCover"
      description="책 표지 시각 — 이미지 또는 그라디언트 폴백, flat/tilt/spine 효과."
      importPath='import { BookCover } from "@/ds/composites/BookCover"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BookCover
            title="모비 딕"
            author="허먼 멜빌"
            size="lg"
            effect="tilt"
            hue="from-slate-700 to-slate-900"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
