"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ContextMenu } from "@/ds/composites/ContextMenu";

export default function ContextMenuPage() {
  return (
    <ComponentPage
      name="ContextMenu"
      description="우클릭 컨텍스트 메뉴. 아이콘, 단축키, 구분선, 비활성화 항목을 지원합니다."
      importPath='import { ContextMenu } from "@/ds/composites/ContextMenu"'
      props={[
        { name: "items", type: "ContextMenuItem[]", required: true, description: "메뉴 항목 목록" },
        { name: "children", type: "ReactNode", required: true, description: "우클릭 대상 영역" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <ContextMenu
            items={[
              {
                key: "cut",
                label: "잘라내기",
                shortcut: "Ctrl+X",
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                    />
                  </svg>
                ),
              },
              {
                key: "copy",
                label: "복사",
                shortcut: "Ctrl+C",
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                key: "paste",
                label: "붙여넣기",
                shortcut: "Ctrl+V",
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
              },
              { key: "div1", label: "", divider: true },
              {
                key: "rename",
                label: "이름 변경",
                shortcut: "F2",
              },
              {
                key: "disabled",
                label: "비활성화 항목",
                disabled: true,
              },
              { key: "div2", label: "", divider: true },
              {
                key: "delete",
                label: "삭제",
                shortcut: "Del",
                danger: true,
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                ),
              },
            ]}
          >
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-border rounded-xl text-sm text-muted select-none">
              이 영역을 우클릭하세요
            </div>
          </ContextMenu>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
