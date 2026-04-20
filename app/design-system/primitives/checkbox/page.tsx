"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Checkbox } from "@/ds/primitives/Checkbox";

export default function CheckboxPage() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <ComponentPage
      name="Checkbox"
      description="체크박스. 라벨, indeterminate 상태 지원."
      importPath='import { Checkbox } from "@/ds/primitives/Checkbox"'
      props={[
        { name: "label", type: "string", description: "라벨" },
        { name: "indeterminate", type: "boolean", description: "부분 선택 상태" },
        { name: "size", type: '"sm"|"md"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="States">
        <Preview>
          <div className="flex flex-col gap-3">
            <Checkbox label="기본 체크박스" checked={a} onChange={() => setA(!a)} />
            <Checkbox label="체크됨" checked={b} onChange={() => setB(!b)} />
            <Checkbox label="Indeterminate" indeterminate />
            <Checkbox label="비활성화" disabled />
            <Checkbox label="Small" size="sm" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
