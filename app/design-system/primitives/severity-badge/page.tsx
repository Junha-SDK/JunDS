"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SeverityBadge } from "@/ds/primitives/SeverityBadge";
import type { Severity } from "@/ds/primitives/SeverityBadge";

const severities: { severity: Severity; label: string }[] = [
  { severity: "ok", label: "정상" },
  { severity: "warn", label: "경고" },
  { severity: "danger", label: "위험" },
  { severity: "info", label: "정보" },
  { severity: "neutral", label: "해당없음" },
];

export default function SeverityBadgePage() {
  return (
    <ComponentPage
      name="SeverityBadge"
      description="ok/warn/danger/info/neutral 심각도 수준을 시각적으로 표현하는 뱃지 컴포넌트."
      importPath='import { SeverityBadge } from "@/ds/primitives/SeverityBadge"'
      props={[
        {
          name: "severity",
          type: '"ok"|"warn"|"danger"|"info"|"neutral"',
          required: true,
          description: "심각도 수준",
        },
        { name: "children", type: "ReactNode", required: true, description: "뱃지 내용" },
        { name: "dot", type: "boolean", default: "false", description: "작은 점만 표시" },
        { name: "size", type: '"sm"|"md"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="심각도">
        <p className="text-sm text-muted mb-3">
          5가지 심각도 수준을 지원합니다. 각 수준에 따라 배경색과 텍스트 색상이 달라집니다.
        </p>
        <Preview>
          <div className="flex items-center gap-3 flex-wrap">
            {severities.map(({ severity, label }) => (
              <SeverityBadge key={severity} severity={severity}>
                {label}
              </SeverityBadge>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="도트 모드">
        <p className="text-sm text-muted mb-3">
          dot prop을 사용하면 텍스트 앞에 색상 점이 표시되어 시각적으로 더 강조됩니다.
        </p>
        <Preview>
          <div className="flex items-center gap-3 flex-wrap">
            {severities.map(({ severity, label }) => (
              <SeverityBadge key={severity} severity={severity} dot>
                {label}
              </SeverityBadge>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="크기">
        <p className="text-sm text-muted mb-3">sm과 md 두 가지 크기를 지원합니다.</p>
        <Preview>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted w-8">sm</span>
              {severities.map(({ severity, label }) => (
                <SeverityBadge key={severity} severity={severity} size="sm" dot>
                  {label}
                </SeverityBadge>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted w-8">md</span>
              {severities.map(({ severity, label }) => (
                <SeverityBadge key={severity} severity={severity} size="md" dot>
                  {label}
                </SeverityBadge>
              ))}
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
