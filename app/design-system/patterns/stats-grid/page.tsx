"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { StatsGrid } from "@/ds/patterns/StatsGrid";

export default function StatsGridPage() {
  return (
    <ComponentPage
      name="StatsGrid"
      description="통계 그리드. StatCard를 그리드 레이아웃으로 배치합니다."
      importPath='import { StatsGrid } from "@/ds/patterns/StatsGrid"'
      props={[
        { name: "stats", type: "StatCardProps[]", description: "통계 카드 데이터 배열" },
        { name: "columns", type: "2 | 3 | 4 | 5", default: "4", description: "컬럼 수" },
      ]}
    >
      <Section title="4열 그리드">
        <Preview padding={false}>
          <div className="p-4">
            <StatsGrid
              columns={4}
              stats={[
                {
                  label: "총 업무",
                  value: 142,
                  change: "+12%",
                  trend: "up",
                  description: "지난 주 대비",
                },
                { label: "완료", value: 98, change: "+5건", trend: "up" },
                { label: "진행 중", value: 32, change: "0%", trend: "neutral" },
                {
                  label: "지연",
                  value: 12,
                  change: "+3건",
                  trend: "down",
                  description: "긴급 처리 필요",
                },
              ]}
            />
          </div>
        </Preview>
      </Section>

      <Section title="3열 그리드">
        <Preview padding={false}>
          <div className="p-4">
            <StatsGrid
              columns={3}
              stats={[
                { label: "이번 달 매출", value: "₩12.4M", change: "+8.2%", trend: "up" },
                { label: "신규 고객", value: 64, change: "+12명", trend: "up" },
                { label: "이탈률", value: "2.1%", change: "-0.4%", trend: "up" },
              ]}
            />
          </div>
        </Preview>
      </Section>

      <Section title="2열 그리드">
        <Preview padding={false}>
          <div className="p-4 max-w-lg">
            <StatsGrid
              columns={2}
              stats={[
                { label: "활성 사용자", value: 1284, change: "+142", trend: "up" },
                { label: "평균 세션", value: "4분 32초", change: "-12초", trend: "down" },
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
