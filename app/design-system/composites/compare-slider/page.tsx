"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CompareSlider } from "@/ds/composites/CompareSlider";

export default function CompareSliderPage() {
  return (
    <ComponentPage
      name="CompareSlider"
      description="두 이미지를 좌우로 슬라이드하며 비교하는 컴포넌트. Before/After·필터 적용 전후 비교에 사용합니다."
      importPath='import { CompareSlider } from "@/ds/composites/CompareSlider"'
      props={[
        { name: "before", type: "string", required: true, description: "이전 이미지 URL" },
        { name: "after", type: "string", required: true, description: "이후 이미지 URL" },
        { name: "beforeLabel", type: "string", default: '"Before"', description: "좌측 라벨" },
        { name: "afterLabel", type: "string", default: '"After"', description: "우측 라벨" },
        { name: "initialPosition", type: "number", default: "50", description: "초기 슬라이더 위치(0~100)" },
      ]}
    >
      <Section title="Default" description="핸들을 드래그해 보세요.">
        <Preview>
          <div className="w-full max-w-xl">
            <CompareSlider
              before="https://picsum.photos/seed/before/800/500"
              after="https://picsum.photos/seed/after/800/500"
              beforeLabel="원본"
              afterLabel="필터 적용"
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
