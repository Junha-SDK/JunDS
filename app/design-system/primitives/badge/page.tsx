"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Badge } from "@/ds/primitives/Badge";
import type { BadgeVariant } from "@/ds/primitives/Badge";

const variants: BadgeVariant[] = ["default", "primary", "success", "warning", "danger", "info", "outline"];

export default function BadgePage() {
  return (
    <ComponentPage
      name="Badge"
      description="상태, 카운트, 라벨을 시각적으로 표시하는 인라인 요소."
      importPath='import { Badge } from "@/ds/primitives/Badge"'
      props={[
        { name: "variant", type: '"default"|"primary"|"success"|"warning"|"danger"|"info"|"outline"', default: '"default"', description: "스타일" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "dot", type: "boolean", default: "false", description: "컬러 점 표시" },
        { name: "count", type: "number", description: "카운트 모드" },
        { name: "maxCount", type: "number", default: "99", description: "최대 표시 숫자" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex items-center gap-2 flex-wrap">
            {variants.map((v) => <Badge key={v} variant={v}>{v}</Badge>)}
          </div>
        </Preview>
      </Section>

      <Section title="With Dot">
        <Preview>
          <div className="flex items-center gap-2 flex-wrap">
            {variants.map((v) => <Badge key={v} variant={v} dot>{v}</Badge>)}
          </div>
        </Preview>
      </Section>

      <Section title="Sizes">
        <Preview>
          <div className="flex items-center gap-2">
            <Badge size="sm" variant="primary">Small</Badge>
            <Badge size="md" variant="primary">Medium</Badge>
            <Badge size="lg" variant="primary">Large</Badge>
          </div>
        </Preview>
      </Section>

      <Section title="Count">
        <Preview>
          <div className="flex items-center gap-3">
            <Badge count={5} />
            <Badge count={42} />
            <Badge count={150} maxCount={99} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
