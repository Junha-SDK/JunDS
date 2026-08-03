"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Stepper } from "@/ds/composites/Stepper";

const steps = [
  { key: "1", title: "정보 입력", description: "기본 정보를 입력합니다" },
  { key: "2", title: "본인 인증", description: "이메일 또는 휴대폰 인증" },
  { key: "3", title: "약관 동의", description: "서비스 이용 약관" },
  { key: "4", title: "가입 완료", description: "환영합니다!" },
];

export default function StepperPage() {
  const [current, setCurrent] = useState(1);

  return (
    <ComponentPage
      name="Stepper"
      description="스텝퍼. 단계별 진행 상태를 시각적으로 표시합니다. 수평/수직 방향을 지원합니다."
      importPath='import { Stepper } from "@/ds/composites/Stepper"'
      props={[
        { name: "steps", type: "StepItem[]", required: true, description: "단계 목록" },
        {
          name: "current",
          type: "number",
          required: true,
          description: "현재 단계 인덱스 (0부터)",
        },
        {
          name: "direction",
          type: '"horizontal"|"vertical"',
          default: '"horizontal"',
          description: "방향",
        },
      ]}
    >
      <Section title="수평 스텝퍼">
        <Preview>
          <div className="space-y-6">
            <Stepper steps={steps} current={current} />
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-foreground rounded-lg hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="text-sm text-muted">
                {current + 1} / {steps.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
                disabled={current === steps.length - 1}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="수직 스텝퍼">
        <Preview>
          <div className="max-w-sm">
            <Stepper steps={steps} current={2} direction="vertical" />
          </div>
        </Preview>
      </Section>

      <Section title="모든 단계 완료">
        <Preview>
          <Stepper steps={steps} current={steps.length} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
