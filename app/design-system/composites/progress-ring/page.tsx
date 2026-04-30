"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ProgressRing } from "@/ds/composites/ProgressRing";

export default function ProgressRingPage() {
  return (
    <ComponentPage
      name="ProgressRing"
      description="원형 진행률 표시기. 가운데에 텍스트나 아이콘을 자유롭게 배치할 수 있습니다."
      importPath='import { ProgressRing } from "@/ds/composites/ProgressRing"'
      props={[
        { name: "value", type: "number", description: "현재 값" },
        { name: "max", type: "number", default: "100", description: "최대값" },
        { name: "size", type: "number", default: "80", description: "지름(px)" },
        { name: "strokeWidth", type: "number", default: "6", description: "선 굵기(px)" },
        { name: "color", type: "string", default: '"var(--primary)"', description: "진행 부분 색상" },
        { name: "trackColor", type: "string", default: '"var(--border)"', description: "트랙 색상" },
        { name: "children", type: "ReactNode", description: "가운데 커스텀 콘텐츠" },
      ]}
    >
      <Section title="기본 + 사이즈">
        <Preview>
          <div className="flex items-center gap-6">
            <ProgressRing value={25} />
            <ProgressRing value={60} />
            <ProgressRing value={92} size={120} strokeWidth={10} />
          </div>
        </Preview>
      </Section>

      <Section title="커스텀 콘텐츠">
        <Preview>
          <div className="flex items-center gap-6">
            <ProgressRing value={70} size={100}>
              <div className="text-center">
                <p className="text-lg font-bold">7/10</p>
                <p className="text-[10px] text-muted">완료</p>
              </div>
            </ProgressRing>
            <ProgressRing value={45} size={100} color="var(--success)">
              <span className="text-2xl">⏱</span>
            </ProgressRing>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
