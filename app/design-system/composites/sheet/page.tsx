"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Sheet } from "@/ds/composites/Sheet";

export default function SheetPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  return (
    <ComponentPage
      name="Sheet"
      description="모바일 바텀 시트. 드래그 핸들로 닫기를 지원하며, ESC 키 및 배경 클릭으로도 닫을 수 있습니다."
      importPath='import { Sheet } from "@/ds/composites/Sheet"'
      props={[
        { name: "open", type: "boolean", required: true, description: "열림 상태" },
        { name: "onClose", type: "() => void", required: true, description: "닫기 핸들러" },
        { name: "children", type: "ReactNode", required: true, description: "시트 내용" },
        { name: "title", type: "string", description: "헤더 제목" },
        { name: "snapPoints", type: "number[]", description: "스냅 포인트 (vh 단위)" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <button
            type="button"
            onClick={() => setBasicOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            바텀 시트 열기
          </button>

          <Sheet open={basicOpen} onClose={() => setBasicOpen(false)} title="옵션">
            <div className="space-y-4">
              <p className="text-sm text-muted">
                드래그 핸들을 아래로 끌어 시트를 닫을 수 있습니다.
              </p>
              {["공유하기", "링크 복사", "다운로드", "신고하기"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setBasicOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-foreground bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </Sheet>
        </Preview>
      </Section>

      <Section title="타이틀 없이">
        <Preview>
          <button
            type="button"
            onClick={() => setOptionsOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-foreground rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            간단한 시트
          </button>

          <Sheet open={optionsOpen} onClose={() => setOptionsOpen(false)}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">완료!</h3>
                <p className="text-sm text-muted mt-1">작업이 성공적으로 완료되었습니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setOptionsOpen(false)}
                className="w-full px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                확인
              </button>
            </div>
          </Sheet>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
