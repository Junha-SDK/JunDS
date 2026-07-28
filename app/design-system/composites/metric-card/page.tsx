"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MetricCard } from "@/ds/composites/MetricCard";

const spark = [12, 18, 14, 22, 28, 24, 32, 30, 38];

export default function MetricCardPage() {
  return (
    <ComponentPage
      name="MetricCard"
      description="핵심 지표 한 개를 라벨, 값, 변화율, 스파크라인과 함께 보여주는 카드입니다."
      importPath='import { MetricCard } from "@/ds/composites/MetricCard"'
      props={[
        { name: "label", type: "string", description: "지표 라벨" },
        { name: "value", type: "string | number", description: "주요 값" },
        { name: "change", type: "number", description: "변화율(%) — 양수는 증가, 음수는 감소" },
        { name: "changeLabel", type: "string", description: "변화 보조 라벨" },
        { name: "sparkline", type: "number[]", description: "스파크라인 데이터" },
        { name: "icon", type: "ReactNode", description: "우측 상단 아이콘" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <MetricCard
              label="매출"
              value="₩12.4M"
              change={12.5}
              changeLabel="전월 대비"
              sparkline={spark}
            />
            <MetricCard label="활성 사용자" value="3,482" change={-4.2} changeLabel="전주 대비" />
          </div>
        </Preview>
      </Section>

      <Section title="값만 표시">
        <Preview>
          <div className="max-w-xs w-full">
            <MetricCard label="가입 회원" value="9,128" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
