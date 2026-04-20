"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ChartCard } from "@/ds/patterns/ChartCard";

const barData = [
  { label: "1월", value: 120 },
  { label: "2월", value: 180 },
  { label: "3월", value: 95 },
  { label: "4월", value: 210 },
  { label: "5월", value: 165 },
  { label: "6월", value: 240 },
];

const donutData = [
  { label: "개발", value: 45, color: "#6366f1" },
  { label: "디자인", value: 25, color: "#f59e0b" },
  { label: "기획", value: 20, color: "#22c55e" },
  { label: "운영", value: 10, color: "#ef4444" },
];

const sparklineData = [12, 18, 14, 22, 19, 28, 25, 32, 30, 35, 33, 40];

export default function ChartCardPage() {
  return (
    <ComponentPage
      name="ChartCard"
      description="차트 카드. 막대, 도넛, 스파크라인 등 다양한 시각화를 카드 형태로 표시합니다."
      importPath='import { ChartCard } from "@/ds/patterns/ChartCard"'
      props={[
        { name: "title", type: "string", description: "카드 제목" },
        { name: "type", type: "'bar' | 'donut' | 'sparkline'", description: "차트 유형" },
        { name: "data", type: "ChartData[]", description: "차트 데이터" },

        { name: "height", type: "number", description: "차트 높이 (px)" },
      ]}
    >
      <Section title="막대 / 도넛 / 스파크라인">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChartCard
              title="월별 매출"
              type="bar"
              data={barData}
            />
            <ChartCard
              title="팀별 리소스 배분"
              type="donut"
              data={donutData}
            />
            <ChartCard
              title="주간 활성 사용자"
              type="sparkline"
              data={sparklineData.map((v, i) => ({ label: `W${i + 1}`, value: v }))}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
