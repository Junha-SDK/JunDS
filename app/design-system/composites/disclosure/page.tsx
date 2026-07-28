"use client";
import { ComponentPage, Section, CodeExample } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Disclosure } from "@/ds/composites/Disclosure";

export default function DisclosurePage() {
  return (
    <ComponentPage
      name="Disclosure"
      description="단일 토글 가능한 패널. 헤더(Trigger)를 누르면 본문(Content)이 펼쳐집니다. uncontrolled / controlled 양쪽 모두 지원하며, ARIA(aria-expanded, aria-controls, role=region)를 자동으로 연결합니다."
      importPath='import { Disclosure } from "@/ds/composites/Disclosure"'
      status="stable"
      version="2.3.0"
      props={[
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "초기 열림 상태 (uncontrolled)",
        },
        { name: "open", type: "boolean", description: "controlled 모드에서의 열림 상태" },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "열림 상태 변경 콜백",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "true이면 자체 div 대신 단일 자식으로 위임 (Slot)",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Disclosure.Trigger와 Disclosure.Content를 포함",
        },
      ]}
    >
      <Section title="Default — uncontrolled">
        <Preview>
          <Disclosure>
            <Disclosure.Trigger className="text-sm font-semibold underline">
              자세히 보기
            </Disclosure.Trigger>
            <Disclosure.Content className="mt-2 text-sm text-muted">
              Disclosure는 단일 토글 패널입니다. compound 패턴으로 Trigger와 Content를 자유롭게
              배치할 수 있습니다.
            </Disclosure.Content>
          </Disclosure>
        </Preview>
        <CodeExample
          code={`<Disclosure>
  <Disclosure.Trigger>자세히 보기</Disclosure.Trigger>
  <Disclosure.Content>숨겨진 내용</Disclosure.Content>
</Disclosure>`}
        />
      </Section>

      <Section title="defaultOpen — 처음부터 열린 상태">
        <Preview>
          <Disclosure defaultOpen>
            <Disclosure.Trigger className="text-sm font-semibold underline">
              요약 닫기
            </Disclosure.Trigger>
            <Disclosure.Content className="mt-2 text-sm text-muted">
              defaultOpen으로 처음부터 펼쳐 보여줄 수 있습니다.
            </Disclosure.Content>
          </Disclosure>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
