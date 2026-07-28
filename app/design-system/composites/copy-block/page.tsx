"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CopyBlock } from "@/ds/composites/CopyBlock";

export default function CopyBlockPage() {
  return (
    <ComponentPage
      name="CopyBlock"
      description="클립보드 복사 버튼이 포함된 코드 블록. 호버 시 복사 버튼이 노출됩니다."
      importPath='import { CopyBlock } from "@/ds/composites/CopyBlock"'
      props={[
        { name: "code", type: "string", description: "표시 및 복사할 코드 문자열" },
        { name: "language", type: "string", description: "헤더에 표시할 언어 라벨" },
        {
          name: "showLineNumbers",
          type: "boolean",
          default: "false",
          description: "줄 번호 표시 여부",
        },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-xl">
            <CopyBlock
              language="typescript"
              code={`import { Button } from "@/ds";\n\nexport function App() {\n  return <Button>Click me</Button>;\n}`}
            />
          </div>
        </Preview>
      </Section>

      <Section title="With Line Numbers">
        <Preview>
          <div className="w-full max-w-xl">
            <CopyBlock
              language="bash"
              showLineNumbers
              code={`npm install @junds/ui\nnpm run dev\nopen http://localhost:6100`}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
