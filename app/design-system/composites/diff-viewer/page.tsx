"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DiffViewer } from "@/ds/composites/DiffViewer";

const oldText = `function greet(name) {
  console.log("Hello " + name);
}

greet("world");`;

const newText = `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

greet("world");`;

export default function DiffViewerPage() {
  return (
    <ComponentPage
      name="DiffViewer"
      description="두 텍스트의 추가/삭제 라인을 색상으로 강조하여 비교하는 뷰어."
      importPath='import { DiffViewer } from "@/ds/composites/DiffViewer"'
      props={[
        { name: "oldText", type: "string", description: "비교 대상 (이전 버전)" },
        { name: "newText", type: "string", description: "비교 대상 (새 버전)" },
        { name: "oldTitle", type: "string", description: "이전 버전 헤더 라벨" },
        { name: "newTitle", type: "string", description: "새 버전 헤더 라벨" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-2xl">
            <DiffViewer oldText={oldText} newText={newText} oldTitle="before.js" newTitle="after.ts" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
