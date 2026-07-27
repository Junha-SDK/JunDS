"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ScreenshotGrid } from "@/ds/composites/ScreenshotGrid";

export default function ScreenshotGridPage() {
  return (
    <ComponentPage
      name="ScreenshotGrid"
      description="문서용 스크린샷 격자. 로드에 실패한 이미지는 조용히 목록에서 빠지고, 전부 실패하면 컴포넌트 자체가 사라진다."
      importPath='import { ScreenshotGrid } from "@/ds/composites/ScreenshotGrid"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full">
            <ScreenshotGrid
              columns={3}
              images={[
                "https://placehold.co/600x400/1a1726/ffffff?text=1",
                "https://placehold.co/600x400/2a2744/ffffff?text=2",
                "https://placehold.co/600x400/5b4cc7/ffffff?text=3",
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
