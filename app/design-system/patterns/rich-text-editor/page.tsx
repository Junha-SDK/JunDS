"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { RichTextEditor } from "@/ds/patterns/RichTextEditor";

const initialContent = "<p>안녕하세요! <strong>리치 텍스트 에디터</strong>입니다.</p><p>다양한 서식을 적용해 보세요.</p>";

export default function RichTextEditorPage() {
  const [html, setHtml] = useState(initialContent);

  return (
    <ComponentPage
      name="RichTextEditor"
      description="리치 텍스트 에디터. 툴바로 볼드, 이탤릭, 리스트 등 서식을 적용하고 HTML을 출력합니다."
      importPath='import { RichTextEditor } from "@/ds/patterns/RichTextEditor"'
      props={[
        { name: "value", type: "string", description: "HTML 문자열" },
        { name: "onChange", type: "(html: string) => void", description: "변경 콜백" },
        { name: "placeholder", type: "string", description: "플레이스홀더 텍스트" },
        { name: "toolbar", type: "ToolbarOption[]", description: "툴바 옵션 (bold, italic, list 등)" },
        { name: "minHeight", type: "number", description: "최소 높이 (px)" },
      ]}
    >
      <Section title="에디터 + HTML 출력">
        <Preview>
          <RichTextEditor
            value={html}
            onChange={setHtml}
            placeholder="내용을 입력하세요..."
            minHeight={200}
          />
          <div className="mt-4">
            <p className="text-xs font-medium text-muted mb-1">출력 HTML</p>
            <pre className="text-xs font-mono bg-gray-50 border border-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all text-muted">
              {html}
            </pre>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
