"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CodeEditor } from "@/ds/composites/CodeEditor";

const SAMPLE = `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("JunDS"));`;

export default function CodeEditorPage() {
  const [code, setCode] = useState(SAMPLE);

  return (
    <ComponentPage
      name="CodeEditor"
      description="라인 번호와 다크 테마를 갖춘 가벼운 코드 에디터. 폼 안에서 짧은 스니펫을 편집할 때 사용합니다."
      importPath='import { CodeEditor } from "@/ds/composites/CodeEditor"'
      props={[
        { name: "value", type: "string", required: true, description: "코드 문자열" },
        { name: "onChange", type: "(value: string) => void", description: "변경 콜백" },
        { name: "language", type: "string", description: "상단 라벨에 표시할 언어 이름" },
        { name: "readOnly", type: "boolean", description: "읽기 전용" },
        { name: "lineNumbers", type: "boolean", default: "true", description: "라인 번호 표시" },
        { name: "minHeight", type: "number", default: "200", description: "최소 높이(px)" },
      ]}
    >
      <Section title="Editable">
        <Preview>
          <div className="w-full max-w-2xl">
            <CodeEditor value={code} onChange={setCode} language="javascript" />
          </div>
        </Preview>
      </Section>

      <Section title="Read only">
        <Preview>
          <div className="w-full max-w-2xl">
            <CodeEditor value={SAMPLE} language="javascript" readOnly />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
