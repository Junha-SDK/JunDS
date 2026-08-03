"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CronExpression } from "@/ds/composites/CronExpression";

export default function CronExpressionPage() {
  const [value, setValue] = useState("0 9 * * 1");
  return (
    <ComponentPage
      name="CronExpression"
      description="크론 표현식을 시각적으로 입력하고 사람이 읽을 수 있는 설명을 함께 보여주는 입력 컴포넌트."
      importPath='import { CronExpression } from "@/ds/composites/CronExpression"'
      props={[
        {
          name: "value",
          type: "string",
          description: "공백으로 구분된 크론 표현식 (분 시 일 월 요일)",
        },
        {
          name: "onChange",
          type: "(value: string) => void",
          description: "값이 변경될 때 호출되는 콜백",
        },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-lg">
            <CronExpression value={value} onChange={setValue} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
