"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Accordion } from "@/ds/composites/Accordion";

export default function AccordionPage() {
  return (
    <ComponentPage
      name="Accordion"
      description="접이식 패널. 단일/다중 열기 모드."
      importPath='import { Accordion } from "@/ds/composites/Accordion"'
      props={[
        { name: "items", type: "AccordionItem[]", required: true, description: "아이템 목록" },
        { name: "single", type: "boolean", default: "false", description: "하나만 열기 모드" },
      ]}
    >
      <Section title="Default (Multi)">
        <Preview>
          <div className="max-w-md">
            <Accordion items={[
              { key: "1", title: "junDS가 뭔가요?", content: "준하의 디자인 시스템입니다. 모든 프로젝트에서 일관된 UI를 제공합니다.", defaultOpen: true },
              { key: "2", title: "어떻게 사용하나요?", content: 'import { Button } from "@/ds" 형태로 가져와서 사용합니다.' },
              { key: "3", title: "커스터마이징 가능한가요?", content: "모든 컴포넌트에 className prop을 전달하여 Tailwind 클래스로 오버라이드할 수 있습니다." },
            ]} />
          </div>
        </Preview>
      </Section>

      <Section title="Single Mode">
        <Preview>
          <div className="max-w-md">
            <Accordion single items={[
              { key: "1", title: "섹션 1", content: "하나만 열립니다." },
              { key: "2", title: "섹션 2", content: "다른 섹션을 열면 이전 것이 닫힙니다." },
              { key: "3", title: "섹션 3", content: "아코디언 패턴입니다." },
            ]} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
