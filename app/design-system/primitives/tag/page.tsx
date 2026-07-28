"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Tag } from "@/ds/primitives/Tag";
import type { TagColor } from "@/ds/primitives/Tag";

const colors: TagColor[] = ["gray", "primary", "blue", "green", "red", "orange", "purple", "teal"];

export default function TagPage() {
  return (
    <ComponentPage
      name="Tag"
      description="태그/칩. 카테고리, 필터 표시에 사용."
      importPath='import { Tag } from "@/ds/primitives/Tag"'
      props={[
        { name: "color", type: "TagColor", default: '"gray"', description: "색상" },
        { name: "closable", type: "boolean", default: "false", description: "닫기 버튼" },
        { name: "onClose", type: "() => void", description: "닫기 핸들러" },
      ]}
    >
      <Section title="Colors">
        <Preview>
          <div className="flex items-center gap-2 flex-wrap">
            {colors.map((c) => (
              <Tag key={c} color={c}>
                {c}
              </Tag>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Closable">
        <Preview>
          <div className="flex items-center gap-2">
            <Tag color="primary" closable onClose={() => {}}>
              프론트엔드
            </Tag>
            <Tag color="blue" closable onClose={() => {}}>
              React
            </Tag>
            <Tag color="green" closable onClose={() => {}}>
              완료
            </Tag>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
