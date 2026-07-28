"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { InlineEdit } from "@/ds/composites/InlineEdit";

export default function InlineEditPage() {
  const [name, setName] = useState("김준하");
  const [title, setTitle] = useState("프로젝트 제목");

  return (
    <ComponentPage
      name="InlineEdit"
      description="텍스트를 클릭하면 그 자리에서 바로 수정할 수 있는 인라인 편집 컴포넌트입니다."
      importPath='import { InlineEdit } from "@/ds/composites/InlineEdit"'
      props={[
        { name: "value", type: "string", description: "현재 값" },
        { name: "onChange", type: "(value: string) => void", description: "값 변경 핸들러" },
        {
          name: "placeholder",
          type: "string",
          default: '"클릭하여 편집"',
          description: "비어있을 때 표시될 텍스트",
        },
        { name: "disabled", type: "boolean", description: "편집 비활성화" },
        {
          name: "as",
          type: '"span"|"h1"|"h2"|"h3"|"p"',
          default: '"span"',
          description: "렌더링 태그",
        },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex flex-col gap-3">
            <InlineEdit value={name} onChange={setName} />
            <p className="text-xs text-muted">현재 값: {name}</p>
          </div>
        </Preview>
      </Section>

      <Section title="제목 태그로 사용">
        <Preview>
          <InlineEdit as="h2" value={title} onChange={setTitle} className="text-lg font-bold" />
        </Preview>
      </Section>

      <Section title="Disabled">
        <Preview>
          <InlineEdit value="수정 불가능한 값" onChange={() => {}} disabled />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
