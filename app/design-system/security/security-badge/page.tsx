"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SecurityBadge } from "@/ds/composites/SecurityBadge";
import type { SecurityLevel } from "@/ds/composites/SecurityBadge";

const levels: SecurityLevel[] = ["critical", "warning", "safe", "verified", "unverified"];

export default function SecurityBadgePage() {
  return (
    <ComponentPage
      name="SecurityBadge"
      description="보안 레벨 뱃지. 보안 상태를 시각적으로 표시합니다."
      importPath='import { SecurityBadge } from "@/ds/composites/SecurityBadge"'
      props={[
        { name: "level", type: '"critical"|"warning"|"safe"|"verified"|"unverified"', required: true, description: "보안 레벨" },
        { name: "label", type: "string", description: "커스텀 라벨" },
        { name: "showIcon", type: "boolean", default: "true", description: "아이콘 표시" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="All Levels">
        <Preview>
          <div className="flex items-center gap-2 flex-wrap">
            {levels.map((l) => <SecurityBadge key={l} level={l} />)}
          </div>
        </Preview>
      </Section>

      <Section title="Sizes">
        <Preview>
          <div className="flex items-center gap-2">
            <SecurityBadge level="safe" size="sm" />
            <SecurityBadge level="safe" size="md" />
            <SecurityBadge level="safe" size="lg" />
          </div>
        </Preview>
      </Section>

      <Section title="Custom Labels">
        <Preview>
          <div className="flex items-center gap-2 flex-wrap">
            <SecurityBadge level="critical" label="비밀번호 취약" />
            <SecurityBadge level="safe" label="SSL 적용됨" />
            <SecurityBadge level="verified" label="본인 인증 완료" />
            <SecurityBadge level="warning" label="90일 경과" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
