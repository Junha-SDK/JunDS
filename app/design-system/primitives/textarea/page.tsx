"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Textarea } from "@/ds/primitives/Textarea";

export default function TextareaPage() {
  const [val, setVal] = useState("");
  return (
    <ComponentPage
      name="Textarea"
      description="여러 줄 텍스트 입력. 자동 높이 조절과 글자 수 카운터를 지원합니다."
      importPath='import { Textarea } from "@/ds/primitives/Textarea"'
      props={[
        { name: "autoResize", type: "boolean", default: "false", description: "내용에 맞춰 높이 자동 조절" },
        { name: "showCount", type: "boolean", default: "false", description: "글자 수 카운터 표시" },
        { name: "error", type: "boolean", default: "false", description: "에러 상태" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex flex-col gap-3 max-w-md">
            <Textarea placeholder="기본 텍스트 영역" />
            <Textarea autoResize placeholder="자동 높이 조절" value={val} onChange={(e) => setVal(e.target.value)} />
            <Textarea showCount maxLength={200} placeholder="글자 수 카운터" value={val} onChange={(e) => setVal(e.target.value)} />
            <Textarea error placeholder="에러 상태" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
