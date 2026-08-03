"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhotoCarousel } from "@/ds/composites/PhotoCarousel";

export default function PhotoCarouselPage() {
  return (
    <ComponentPage
      name="PhotoCarousel"
      description="자동 재생/수동 컨트롤/키보드 좌우 지원 사진 슬라이드쇼."
      importPath='import { PhotoCarousel } from "@/ds/composites/PhotoCarousel"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PhotoCarousel
            photos={[
              { src: "https://picsum.photos/seed/c1/800/450", alt: "1", caption: "첫 사진" },
              { src: "https://picsum.photos/seed/c2/800/450", alt: "2", caption: "두 번째" },
            ]}
            autoPlayMs={4000}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
