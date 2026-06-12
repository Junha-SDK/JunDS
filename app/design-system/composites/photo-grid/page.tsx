"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoGrid } from "@/ds/composites/PhotoGrid";

export default function PhotoGridPage() {
  return (
    <ComponentPage
      name="PhotoGrid"
      description="사진 그리드 — uniform(균등) / masonry(폭만 같음) / mosaic(첫 항목 강조)."
      importPath='import { PhotoGrid } from "@/ds/composites/PhotoGrid"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoGrid layout="masonry" columns={3}>{[1,2,3,4,5,6].map((i) => (<img key={i} src={`https://picsum.photos/seed/g${i}/400/${300 + i * 40}`} alt="" className="rounded-lg w-full" />))}</PhotoGrid>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
