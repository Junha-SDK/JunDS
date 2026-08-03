"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { StatCard } from "@/ds/composites/StatCard";

export default function StatCardPage() {
  return (
    <ComponentPage
      name="StatCard"
      description="통계 카드. 핵심 지표를 한눈에 보여주는 카드 컴포넌트입니다."
      importPath='import { StatCard } from "@/ds/composites/StatCard"'
      props={[
        { name: "label", type: "string", description: "지표 라벨" },
        { name: "value", type: "string | number", description: "지표 값" },
        { name: "change", type: "string", description: "변화량 (예: +12%)" },
        { name: "trend", type: '"up"|"down"|"neutral"', description: "변화 방향" },
        { name: "icon", type: "ReactNode", description: "아이콘" },
        { name: "description", type: "string", description: "부가 설명" },
        { name: "onClick", type: "() => void", description: "클릭 핸들러" },
      ]}
    >
      <Section title="다양한 트렌드">
        <Preview>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="총 업무"
              value={142}
              change="+12%"
              trend="up"
              description="지난 주 대비"
            />
            <StatCard
              label="완료율"
              value="78%"
              change="-3%"
              trend="down"
              description="목표: 85%"
            />
            <StatCard label="진행 중" value={32} change="0%" trend="neutral" />
            <StatCard
              label="지연"
              value={8}
              change="+2건"
              trend="down"
              description="긴급 처리 필요"
            />
          </div>
        </Preview>
      </Section>

      <Section title="아이콘 포함">
        <Preview>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <StatCard
              label="신규 요청"
              value={24}
              change="+5"
              trend="up"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 3v12M3 9h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <StatCard
              label="평균 처리 시간"
              value="2.4일"
              change="-0.3일"
              trend="up"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M9 5v4l3 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
