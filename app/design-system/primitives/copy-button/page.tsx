"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CopyButton } from "@/ds/primitives/CopyButton";

export default function CopyButtonPage() {
  return (
    <ComponentPage
      name="CopyButton"
      description="클립보드 복사 버튼. 아이콘 또는 버튼 형태로 사용할 수 있습니다."
      importPath='import { CopyButton } from "@/ds/primitives/CopyButton"'
      props={[
        { name: "text", type: "string", description: "복사할 텍스트" },
        { name: "variant", type: '"icon"|"button"', default: '"icon"', description: "표시 형태" },
        { name: "size", type: '"sm"|"md"', default: '"md"', description: "크기" },
        { name: "label", type: "string", default: '"복사"', description: "기본 라벨" },
        { name: "copiedLabel", type: "string", default: '"복사됨!"', description: "복사 후 라벨" },
      ]}
    >
      <Section title="아이콘 형태">
        <Preview>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">npm install junds</code>
              <CopyButton text="npm install junds" />
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">https://example.com</code>
              <CopyButton text="https://example.com" size="sm" />
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="버튼 형태">
        <Preview>
          <div className="flex items-center gap-4">
            <CopyButton text="복사될 텍스트입니다" variant="button" label="텍스트 복사" />
            <CopyButton text="ABC-1234" variant="button" label="코드 복사" size="sm" />
          </div>
        </Preview>
      </Section>

      <Section title="크기 비교">
        <Preview>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">sm</span>
              <CopyButton text="small" size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">md</span>
              <CopyButton text="medium" size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">sm (버튼)</span>
              <CopyButton text="small" variant="button" size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">md (버튼)</span>
              <CopyButton text="medium" variant="button" size="md" />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
