"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoFilters, defaultPhotoFilters } from "@/ds/composites/PhotoFilters";

export default function PhotoFiltersPage() {
  return (
    <ComponentPage
      name="PhotoFilters"
      description="7종 프리셋 필터 스트립 — 썸네일에 CSS filter 미리보기."
      importPath='import { PhotoFilters } from "@/ds/composites/PhotoFilters"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoFilters previewSrc="https://picsum.photos/seed/f/200" filters={defaultPhotoFilters} onChange={()=>{}} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
