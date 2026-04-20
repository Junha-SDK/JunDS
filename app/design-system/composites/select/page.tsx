"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Select } from "@/ds/composites/Select";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
];

export default function SelectPage() {
  const [v, setV] = useState("");
  return (
    <ComponentPage
      name="Select"
      description="드롭다운 셀렉트. 검색, 키보드 네비게이션 지원."
      importPath='import { Select } from "@/ds/composites/Select"'
      props={[
        { name: "options", type: "SelectOption[]", required: true, description: "옵션 목록" },
        { name: "value", type: "string", description: "선택된 값" },
        { name: "onChange", type: "(value: string) => void", description: "변경 핸들러" },
        { name: "searchable", type: "boolean", default: "false", description: "검색 기능" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "fullWidth", type: "boolean", description: "전체 너비" },
      ]}
    >
      <Section title="Basic & Searchable">
        <Preview>
          <div className="flex gap-4 max-w-sm">
            <Select options={options} value={v} onChange={setV} placeholder="프레임워크" fullWidth />
          </div>
          <div className="flex gap-4 max-w-sm mt-4">
            <Select options={options} value={v} onChange={setV} searchable placeholder="검색 가능" fullWidth />
          </div>
        </Preview>
      </Section>

      <Section title="Sizes">
        <Preview>
          <div className="flex items-end gap-3">
            <Select options={options} value={v} onChange={setV} size="sm" placeholder="Small" />
            <Select options={options} value={v} onChange={setV} size="md" placeholder="Medium" />
            <Select options={options} value={v} onChange={setV} size="lg" placeholder="Large" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
