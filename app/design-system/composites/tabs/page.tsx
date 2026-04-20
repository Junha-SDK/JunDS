"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Tabs } from "@/ds/composites/Tabs";

const tabs = [
  { value: "all", label: "전체", badge: 42 },
  { value: "mine", label: "내 업무", badge: 8 },
  { value: "review", label: "검토 중", badge: 3 },
  { value: "done", label: "완료" },
];

export default function TabsPage() {
  const [v, setV] = useState("all");
  return (
    <ComponentPage
      name="Tabs"
      description="탭 네비게이션. underline, pills, segment 변형."
      importPath='import { Tabs } from "@/ds/composites/Tabs"'
      props={[
        { name: "tabs", type: "Tab[]", required: true, description: "탭 목록" },
        { name: "value", type: "string", required: true, description: "활성 탭" },
        { name: "onChange", type: "(value: string) => void", required: true, description: "변경 핸들러" },
        { name: "variant", type: '"underline"|"pills"|"segment"', default: '"underline"', description: "스타일" },
        { name: "size", type: '"sm"|"md"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="Underline">
        <Preview><Tabs tabs={tabs} value={v} onChange={setV} variant="underline" /></Preview>
      </Section>
      <Section title="Pills">
        <Preview><Tabs tabs={tabs} value={v} onChange={setV} variant="pills" /></Preview>
      </Section>
      <Section title="Segment">
        <Preview><Tabs tabs={tabs} value={v} onChange={setV} variant="segment" /></Preview>
      </Section>
    </ComponentPage>
  );
}
