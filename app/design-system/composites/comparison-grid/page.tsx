"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ComparisonGrid } from "@/ds/composites/ComparisonGrid";
import type { ComparisonCard } from "@/ds/composites/ComparisonGrid";

const basicCards: ComparisonCard[] = [
  { key: "total", label: "전체 사용자", value: "12,450" },
  { key: "active", label: "활성 사용자", value: "8,320" },
  { key: "new", label: "신규 가입", value: "1,205" },
  { key: "churn", label: "이탈", value: "342" },
];

const varianceCards: ComparisonCard[] = [
  { key: "revenue", label: "매출", value: "₩32.5M", change: { value: "+12.3%", direction: "up" } },
  {
    key: "cost",
    label: "비용",
    value: "₩18.2M",
    change: { value: "+3.1%", direction: "up" },
    hasVariance: true,
  },
  { key: "profit", label: "순이익", value: "₩14.3M", change: { value: "+8.7%", direction: "up" } },
  {
    key: "refund",
    label: "환불",
    value: "₩1.2M",
    change: { value: "-5.2%", direction: "down" },
    hasVariance: true,
  },
];

const twoColCards: ComparisonCard[] = [
  { key: "before", label: "변경 전", value: "2,500", subtext: "2024년 1분기" },
  {
    key: "after",
    label: "변경 후",
    value: "3,800",
    subtext: "2024년 2분기",
    change: { value: "+52%", direction: "up" },
  },
];

const threeColCards: ComparisonCard[] = [
  { key: "web", label: "웹", value: "45,200", subtext: "데스크톱 + 모바일 웹" },
  { key: "ios", label: "iOS", value: "28,100", subtext: "앱스토어 다운로드" },
  { key: "android", label: "Android", value: "31,600", subtext: "플레이스토어 다운로드" },
];

export default function ComparisonGridPage() {
  return (
    <ComponentPage
      name="ComparisonGrid"
      description="통계 카드를 그리드로 배치하여 지표를 비교할 수 있는 컴포넌트. 변동 표시와 경고 하이라이트를 지원합니다."
      importPath='import { ComparisonGrid } from "@/ds/composites/ComparisonGrid"'
      props={[
        { name: "cards", type: "ComparisonCard[]", required: true, description: "비교 카드 목록" },
        { name: "columns", type: "2 | 3 | 4", default: "4", description: "컬럼 수" },
      ]}
    >
      <Section title="기본">
        <p className="text-sm text-muted mb-3">
          4개의 통계 카드를 나란히 배치하여 주요 지표를 한눈에 비교할 수 있습니다.
        </p>
        <Preview>
          <ComparisonGrid cards={basicCards} />
        </Preview>
      </Section>

      <Section title="변동 표시">
        <p className="text-sm text-muted mb-3">
          change prop으로 증가/감소를 표시하고, hasVariance를 true로 설정하면 경고 하이라이트가
          적용됩니다.
        </p>
        <Preview>
          <ComparisonGrid cards={varianceCards} />
        </Preview>
      </Section>

      <Section title="컬럼 수">
        <p className="text-sm text-muted mb-3">
          columns prop으로 2, 3, 4 컬럼 레이아웃을 선택할 수 있습니다.
        </p>
        <Preview>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-muted mb-2">2 columns</p>
              <ComparisonGrid cards={twoColCards} columns={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-2">3 columns</p>
              <ComparisonGrid cards={threeColCards} columns={3} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-2">4 columns</p>
              <ComparisonGrid cards={basicCards} columns={4} />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
