"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ImageCompare } from "@/ds/composites/ImageCompare";

export default function ImageComparePage() {
  return (
    <ComponentPage
      name="ImageCompare"
      description="before/after 슬라이더 분할 비교 — 키보드 화살표로 미세 조정."
      importPath='import { ImageCompare } from "@/ds/composites/ImageCompare"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ImageCompare beforeSrc="https://picsum.photos/seed/a/600/400" afterSrc="https://picsum.photos/seed/b/600/400" beforeAlt="이전" afterAlt="이후" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
