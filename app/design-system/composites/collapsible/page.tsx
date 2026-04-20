"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Collapsible } from "@/ds/composites/Collapsible";

export default function CollapsiblePage() {
  const [open, setOpen] = useState(false);

  return (
    <ComponentPage
      name="Collapsible"
      description="접기/펼치기 컴포넌트. 트리거 버튼을 클릭하여 콘텐츠를 표시하거나 숨깁니다. 제어/비제어 모드를 모두 지원합니다."
      importPath='import { Collapsible } from "@/ds/composites/Collapsible"'
      props={[
        { name: "trigger", type: "ReactNode", required: true, description: "클릭할 트리거 요소" },
        { name: "children", type: "ReactNode", required: true, description: "접히는 콘텐츠" },
        { name: "open", type: "boolean", description: "제어 모드 열림 상태" },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "열림 상태 변경 핸들러" },
        { name: "defaultOpen", type: "boolean", default: "false", description: "비제어 모드 초기 열림 상태" },
      ]}
    >
      <Section title="기본 사용 (비제어)">
        <Preview>
          <div className="max-w-md">
            <Collapsible
              trigger={
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium">더 보기</span>
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              }
            >
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted">
                  숨겨진 콘텐츠입니다. 트리거 버튼을 클릭하면 이 영역이 표시됩니다.
                  애니메이션과 함께 부드럽게 열리고 닫힙니다.
                </p>
              </div>
            </Collapsible>
          </div>
        </Preview>
      </Section>

      <Section title="기본 열림 상태">
        <Preview>
          <div className="max-w-md">
            <Collapsible
              defaultOpen
              trigger={
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium">FAQ 항목</span>
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              }
            >
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted">
                  이 콘텐츠는 처음부터 열려 있습니다. defaultOpen prop을 사용했습니다.
                </p>
              </div>
            </Collapsible>
          </div>
        </Preview>
      </Section>

      <Section title="제어 모드">
        <Preview>
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {open ? "닫기" : "열기"}
              </button>
              <span className="text-sm text-muted">
                상태: {open ? "열림" : "닫힘"}
              </span>
            </div>
            <Collapsible
              open={open}
              onOpenChange={setOpen}
              trigger={
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium">제어 모드 콘텐츠</span>
                </div>
              }
            >
              <div className="mt-2 p-4 bg-primary-light rounded-lg">
                <p className="text-sm text-foreground">
                  외부 버튼으로 열림/닫힘 상태를 제어할 수 있습니다.
                </p>
              </div>
            </Collapsible>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
