"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { RadioGroup } from "@/ds/primitives/Radio";

const options = [
  { value: "0", label: "긴급" },
  { value: "1", label: "높음" },
  { value: "2", label: "보통" },
  { value: "3", label: "낮음" },
];

export default function RadioPage() {
  const [v, setV] = useState("2");
  return (
    <ComponentPage
      name="RadioGroup"
      description="라디오 그룹. 단일 선택."
      importPath='import { RadioGroup } from "@/ds/primitives/Radio"'
      props={[
        { name: "name", type: "string", required: true, description: "그룹 이름" },
        { name: "options", type: "RadioOption[]", required: true, description: "옵션 목록" },
        { name: "value", type: "string", description: "선택 값" },
        { name: "onChange", type: "(value: string) => void", description: "변경 핸들러" },
        { name: "direction", type: '"horizontal"|"vertical"', default: '"vertical"', description: "배치 방향" },
      ]}
    >
      <Section title="Directions">
        <Preview>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-muted mb-2">Vertical</p>
              <RadioGroup name="v" options={options} value={v} onChange={setV} />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Horizontal</p>
              <RadioGroup name="h" options={options} value={v} onChange={setV} direction="horizontal" />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
