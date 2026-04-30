"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { GaugeChart } from "@/ds/composites/GaugeChart";

export default function GaugeChartPage() {
  return (
    <ComponentPage
      name="GaugeChart"
      description="값의 위치를 반원형 게이지로 표현하는 차트. 임계 구간을 색상 세그먼트로 구분합니다."
      importPath='import { GaugeChart } from "@/ds/composites/GaugeChart"'
      props={[
        { name: "value", type: "number", description: "현재 값" },
        { name: "min", type: "number", default: "0", description: "최소값" },
        { name: "max", type: "number", default: "100", description: "최대값" },
        { name: "label", type: "string", description: "값 아래 표시할 라벨" },
        { name: "size", type: "number", default: "160", description: "차트 너비(px)" },
        { name: "segments", type: "{ color, from, to }[]", description: "구간별 배경 세그먼트" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex items-center gap-6">
            <GaugeChart value={28} label="낮음" />
            <GaugeChart value={55} label="보통" />
            <GaugeChart value={82} label="양호" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
