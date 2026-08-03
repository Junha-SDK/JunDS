"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Dropdown } from "@/ds/composites/Dropdown";
import { Button } from "@/ds/primitives/Button";

export default function DropdownPage() {
  return (
    <ComponentPage
      name="Dropdown"
      description="드롭다운 메뉴. 위험 항목, 구분선, 아이콘 지원."
      importPath='import { Dropdown } from "@/ds/composites/Dropdown"'
      props={[
        { name: "trigger", type: "ReactNode", required: true, description: "트리거 요소" },
        { name: "items", type: "DropdownItem[]", required: true, description: "메뉴 항목" },
        {
          name: "onSelect",
          type: "(key: string) => void",
          required: true,
          description: "선택 핸들러",
        },
        { name: "align", type: '"left"|"right"', default: '"right"', description: "정렬" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <div className="flex gap-4">
            <Dropdown
              trigger={<Button variant="secondary">메뉴 열기</Button>}
              items={[
                { key: "edit", label: "수정" },
                { key: "dup", label: "복제" },
                { key: "div", label: "", divider: true },
                { key: "delete", label: "삭제", danger: true },
              ]}
              onSelect={(key) => console.log(key)}
              align="left"
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
