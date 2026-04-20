"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { StatusDot } from "@/ds/primitives/StatusDot";
import type { StatusDotStatus } from "@/ds/primitives/StatusDot";

const statuses: { status: StatusDotStatus; label: string }[] = [
  { status: "success", label: "온라인" },
  { status: "warning", label: "대기 중" },
  { status: "danger", label: "오프라인" },
  { status: "info", label: "동기화 중" },
  { status: "neutral", label: "비활성" },
  { status: "pulse", label: "실시간" },
];

export default function StatusDotPage() {
  return (
    <ComponentPage
      name="StatusDot"
      description="상태 표시 점. 다양한 상태를 색상으로 직관적으로 나타냅니다."
      importPath='import { StatusDot } from "@/ds/primitives/StatusDot"'
      props={[
        { name: "status", type: '"success"|"warning"|"danger"|"info"|"neutral"|"pulse"', default: '"neutral"', description: "상태" },
        { name: "label", type: "string", description: "라벨 텍스트" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="모든 상태">
        <Preview>
          <div className="flex flex-wrap items-center gap-6">
            {statuses.map((s) => (
              <StatusDot key={s.status} status={s.status} label={s.label} />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="크기">
        <Preview>
          <div className="flex items-center gap-6">
            <StatusDot status="success" label="sm" size="sm" />
            <StatusDot status="success" label="md" size="md" />
            <StatusDot status="success" label="lg" size="lg" />
          </div>
        </Preview>
      </Section>

      <Section title="라벨 없이">
        <Preview>
          <div className="flex items-center gap-4">
            <StatusDot status="success" />
            <StatusDot status="warning" />
            <StatusDot status="danger" />
            <StatusDot status="info" />
            <StatusDot status="neutral" />
            <StatusDot status="pulse" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
