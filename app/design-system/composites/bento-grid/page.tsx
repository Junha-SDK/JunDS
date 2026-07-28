"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BentoGrid } from "@/ds/composites/BentoGrid";

export default function BentoGridPage() {
  return (
    <ComponentPage
      name="BentoGrid"
      description="크기가 다른 카드를 모자이크처럼 배치하는 벤또(점심 도시락) 스타일 그리드. 랜딩·대시보드 헤더 영역에 적합합니다."
      importPath='import { BentoGrid } from "@/ds/composites/BentoGrid"'
      props={[
        { name: "cols", type: "number (2~6)", default: "4", description: "전체 컬럼 수" },
        { name: "gap", type: "number", default: "4", description: "간격 단위 (4px 곱)" },
      ]}
    >
      <Section
        title="Default"
        description="BentoGrid.Item 의 colSpan / rowSpan 으로 면적을 조절합니다."
      >
        <Preview>
          <BentoGrid cols={4} gap={4} className="w-full">
            <BentoGrid.Item
              colSpan={2}
              rowSpan={2}
              className="bg-gradient-to-br from-primary/10 to-primary/5"
            >
              <p className="text-sm font-bold text-foreground mb-1">Hero</p>
              <p className="text-xs text-muted">colSpan=2, rowSpan=2</p>
            </BentoGrid.Item>
            <BentoGrid.Item>
              <p className="text-sm font-semibold">사용자</p>
              <p className="text-2xl font-bold mt-1">12,847</p>
            </BentoGrid.Item>
            <BentoGrid.Item>
              <p className="text-sm font-semibold">매출</p>
              <p className="text-2xl font-bold mt-1">$42K</p>
            </BentoGrid.Item>
            <BentoGrid.Item colSpan={2}>
              <p className="text-sm font-semibold">공지</p>
              <p className="text-xs text-muted mt-1">새로운 기능이 출시되었습니다.</p>
            </BentoGrid.Item>
          </BentoGrid>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
