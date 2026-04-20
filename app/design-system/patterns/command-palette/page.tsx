"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CommandPalette } from "@/ds/patterns/CommandPalette";
import { Button } from "@/ds/primitives/Button";
import { Kbd } from "@/ds/primitives/Kbd";

const items = [
  { id: "1", label: "홈으로 이동", group: "Navigation", action: () => {} },
  { id: "2", label: "프로젝트 목록", group: "Navigation", action: () => {} },
  { id: "3", label: "설정", group: "Navigation", action: () => {}, keywords: ["config", "preference"] },
  { id: "4", label: "새 업무 만들기", group: "Actions", action: () => {} },
  { id: "5", label: "Excel 내보내기", group: "Actions", action: () => {} },
  { id: "6", label: "사용자 관리", group: "Admin", action: () => {} },
];

export default function CommandPalettePage() {
  const [open, setOpen] = useState(false);

  return (
    <ComponentPage
      name="CommandPalette"
      description="⌘K 커맨드 팔레트. 검색, 그룹, 키보드 탐색."
      importPath='import { CommandPalette } from "@/ds/patterns/CommandPalette"'
      props={[
        { name: "items", type: "CommandItem[]", required: true, description: "명령 목록" },
        { name: "placeholder", type: "string", description: "검색 플레이스홀더" },
        { name: "open", type: "boolean", description: "열림 상태 (제어 모드)" },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "상태 변경 핸들러" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              커맨드 팔레트 열기
            </Button>
            <span className="text-sm text-muted">또는</span>
            <Kbd keys={["⌘", "K"]} />
          </div>
          <CommandPalette items={items} open={open} onOpenChange={setOpen} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
