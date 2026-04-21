"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FilterButtonGroup } from "@/ds/composites/FilterButtonGroup";

export default function FilterButtonGroupPage() {
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <ComponentPage
      name="FilterButtonGroup"
      description="선택 가능한 필터 옵션을 연결된 버튼 그룹으로 표시하는 컴포넌트. 단일 선택 모드로 동작합니다."
      importPath='import { FilterButtonGroup } from "@/ds/composites/FilterButtonGroup"'
      props={[
        { name: "options", type: "FilterOption[]", required: true, description: "필터 옵션 목록 ({ key, label, count? })" },
        { name: "value", type: "string", required: true, description: "현재 선택된 옵션 key" },
        { name: "onChange", type: "(key: string) => void", required: true, description: "선택 변경 핸들러" },
      ]}
    >
      <Section title="기본">
        <p className="text-sm text-muted mb-3">
          여러 필터 옵션 중 하나를 선택할 수 있습니다. 선택된 옵션은 primary 색상으로 하이라이트됩니다.
        </p>
        <Preview>
          <div className="space-y-3">
            <FilterButtonGroup
              options={[
                { key: "all", label: "전체" },
                { key: "design", label: "디자인" },
                { key: "dev", label: "개발" },
                { key: "pm", label: "기획" },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <p className="text-sm text-foreground">
              선택됨: <strong>{filter}</strong>
            </p>
          </div>
        </Preview>
      </Section>

      <Section title="카운트">
        <p className="text-sm text-muted mb-3">
          count prop을 사용하면 각 옵션 옆에 숫자 배지가 표시됩니다. 필터링된 항목 수를 나타낼 때 유용합니다.
        </p>
        <Preview>
          <div className="space-y-3">
            <FilterButtonGroup
              options={[
                { key: "all", label: "전체", count: 248 },
                { key: "active", label: "활성", count: 186 },
                { key: "pending", label: "대기", count: 42 },
                { key: "inactive", label: "비활성", count: 20 },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <p className="text-sm text-foreground">
              선택됨: <strong>{statusFilter}</strong>
            </p>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
