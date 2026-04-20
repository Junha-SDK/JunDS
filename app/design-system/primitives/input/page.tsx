"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Input } from "@/ds/primitives/Input";

export default function InputPage() {
  return (
    <ComponentPage
      name="Input"
      description="텍스트 입력 필드. 크기, 에러 상태, 아이콘 슬롯을 지원합니다."
      importPath='import { Input } from "@/ds/primitives/Input"'
      props={[
        { name: "inputSize", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "error", type: "boolean", default: "false", description: "에러 상태" },
        { name: "leftSlot", type: "ReactNode", description: "왼쪽 아이콘/요소" },
        { name: "rightSlot", type: "ReactNode", description: "오른쪽 아이콘/요소" },
      ]}
    >
      <Section title="Sizes">
        <Preview>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input inputSize="sm" placeholder="Small" />
            <Input inputSize="md" placeholder="Medium (default)" />
            <Input inputSize="lg" placeholder="Large" />
          </div>
        </Preview>
      </Section>

      <Section title="States">
        <Preview>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input placeholder="기본" />
            <Input error placeholder="에러 상태" />
            <Input disabled placeholder="비활성화" />
          </div>
        </Preview>
      </Section>

      <Section title="With Icons">
        <Preview>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input
              placeholder="검색..."
              leftSlot={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
