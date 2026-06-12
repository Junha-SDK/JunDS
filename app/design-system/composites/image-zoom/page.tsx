"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ImageZoom } from "@/ds/composites/ImageZoom";

export default function ImageZoomPage() {
  return (
    <ComponentPage
      name="ImageZoom"
      description="휠/더블클릭/드래그로 사진 확대·이동, 우하단 컨트롤로 직접 배율 조정."
      importPath='import { ImageZoom } from "@/ds/composites/ImageZoom"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ImageZoom src="https://picsum.photos/seed/zoom/800/450" alt="확대 가능 이미지" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
