"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ImageWithFallback } from "@/ds/composites/ImageWithFallback";

export default function ImageWithFallbackPage() {
  return (
    <ComponentPage
      name="ImageWithFallback"
      description="로딩 중 스켈레톤 + 에러 시 fallback 이미지 또는 플레이스홀더."
      importPath='import { ImageWithFallback } from "@/ds/composites/ImageWithFallback"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ImageWithFallback
            src="https://picsum.photos/seed/iwf/300"
            alt="사진"
            fallbackSrc="https://picsum.photos/seed/fb/300"
            aspectRatio="1/1"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
