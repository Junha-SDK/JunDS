"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Toggle } from "@/ds/primitives/Toggle";

export default function TogglePage() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <ComponentPage
      name="Toggle"
      description="온/오프 스위치."
      importPath='import { Toggle } from "@/ds/primitives/Toggle"'
      props={[
        { name: "checked", type: "boolean", default: "false", description: "체크 상태" },
        { name: "onChange", type: "(checked: boolean) => void", description: "변경 핸들러" },
        { name: "size", type: '"sm"|"md"', default: '"md"', description: "크기" },
        { name: "label", type: "string", description: "라벨" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex flex-col gap-4">
            <Toggle checked={a} onChange={setA} label="알림 활성화" />
            <Toggle checked={b} onChange={setB} label="다크 모드" size="sm" />
            <Toggle checked={false} onChange={() => {}} label="비활성화" disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
