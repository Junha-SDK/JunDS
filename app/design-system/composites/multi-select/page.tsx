"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MultiSelect } from "@/ds/composites/MultiSelect";

const options = [
  { value: "fe", label: "프론트엔드" },
  { value: "be", label: "백엔드" },
  { value: "db", label: "데이터베이스" },
  { value: "infra", label: "인프라" },
  { value: "design", label: "디자인" },
  { value: "pm", label: "기획" },
];

export default function MultiSelectPage() {
  const [v, setV] = useState<string[]>(["fe", "be"]);
  return (
    <ComponentPage
      name="MultiSelect"
      description="다중 선택. 태그 표시, 검색 지원."
      importPath='import { MultiSelect } from "@/ds/composites/MultiSelect"'
      props={[
        { name: "options", type: "MultiSelectOption[]", required: true, description: "옵션 목록" },
        { name: "value", type: "string[]", required: true, description: "선택된 값 배열" },
        {
          name: "onChange",
          type: "(value: string[]) => void",
          required: true,
          description: "변경 핸들러",
        },
        { name: "searchable", type: "boolean", description: "검색 기능" },
        { name: "maxDisplay", type: "number", default: "3", description: "최대 표시 태그 수" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="max-w-md">
            <MultiSelect
              options={options}
              value={v}
              onChange={setV}
              searchable
              placeholder="팀 선택"
            />
            <p className="text-xs text-muted mt-2">선택: {v.join(", ")}</p>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
