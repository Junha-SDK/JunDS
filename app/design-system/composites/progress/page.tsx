"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ProgressBar, ProgressSteps } from "@/ds/composites/Progress";

export default function ProgressPage() {
  return (
    <ComponentPage
      name="Progress"
      description="진행 상태 표시. 바(Bar)와 스텝(Steps) 두 가지 형태."
      importPath='import { ProgressBar, ProgressSteps } from "@/ds/composites/Progress"'
      props={[
        { name: "value", type: "number", required: true, description: "현재 값" },
        { name: "max", type: "number", default: "100", description: "최대 값" },
        {
          name: "variant",
          type: '"default"|"success"|"warning"|"danger"',
          default: '"default"',
          description: "색상",
        },
        { name: "showLabel", type: "boolean", description: "퍼센트 표시" },
      ]}
    >
      <Section title="ProgressBar">
        <Preview>
          <div className="flex flex-col gap-4 max-w-md">
            <ProgressBar value={75} showLabel label="진행률" />
            <ProgressBar value={100} variant="success" showLabel />
            <ProgressBar value={40} variant="warning" size="lg" showLabel />
            <ProgressBar value={20} variant="danger" size="sm" />
          </div>
        </Preview>
      </Section>

      <Section title="ProgressSteps">
        <Preview>
          <div className="max-w-lg">
            <ProgressSteps
              current={3}
              total={5}
              labels={["접수", "진행", "검토", "테스트", "완료"]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
