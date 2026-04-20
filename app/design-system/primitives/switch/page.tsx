"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Switch } from "@/ds/primitives/Switch";

export default function SwitchPage() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);
  return (
    <ComponentPage
      name="Switch"
      description="iOS 스타일의 둥근 온/오프 스위치 컴포넌트입니다."
      importPath='import { Switch } from "@/ds/primitives/Switch"'
      props={[
        { name: "checked", type: "boolean", default: "false", description: "체크 상태" },
        { name: "onChange", type: "(checked: boolean) => void", description: "상태 변경 핸들러" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "label", type: "string", description: "레이블" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex flex-col gap-4">
            <Switch checked={a} onChange={setA} label="알림 수신" size="sm" />
            <Switch checked={b} onChange={setB} label="다크 모드" />
            <Switch checked={c} onChange={setC} label="대형 스위치" size="lg" />
            <Switch checked={false} onChange={() => {}} label="비활성화" disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
