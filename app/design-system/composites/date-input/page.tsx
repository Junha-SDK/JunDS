"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DateInput } from "@/ds/composites/DateInput";

export default function DateInputPage() {
  const [d, setD] = useState("2026-04-19");
  return (
    <ComponentPage
      name="DateInput"
      description="날짜 입력. 초기화 버튼 지원."
      importPath='import { DateInput } from "@/ds/composites/DateInput"'
      props={[
        { name: "error", type: "boolean", description: "에러 상태" },
        { name: "onClear", type: "() => void", description: "초기화 핸들러" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <div className="flex flex-col gap-3 max-w-xs">
            <DateInput value={d} onChange={(e) => setD(e.target.value)} onClear={() => setD("")} />
            <DateInput error value="" onChange={() => {}} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
