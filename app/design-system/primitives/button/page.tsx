"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CodeBlock } from "../../_components/CodeBlock";
import { Button } from "@/ds/primitives/Button";
import type { ButtonVariant, ButtonSize } from "@/ds/primitives/Button";

const variants: ButtonVariant[] = ["primary", "secondary", "danger", "ghost", "outline", "link"];
const sizes: ButtonSize[] = ["xs", "sm", "md", "lg"];

export default function ButtonPage() {
  return (
    <ComponentPage
      name="Button"
      description="모든 인터랙션의 기본 요소. 6가지 variant와 4가지 size를 지원합니다."
      importPath='import { Button } from "@/ds/primitives/Button"'
      props={[
        { name: "variant", type: '"primary"|"secondary"|"danger"|"ghost"|"outline"|"link"', default: '"primary"', description: "버튼 스타일" },
        { name: "size", type: '"xs"|"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "loading", type: "boolean", default: "false", description: "로딩 상태 (스피너 표시)" },
        { name: "leftIcon", type: "ReactNode", description: "왼쪽 아이콘" },
        { name: "rightIcon", type: "ReactNode", description: "오른쪽 아이콘" },
        { name: "fullWidth", type: "boolean", default: "false", description: "전체 너비" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex items-center gap-3 flex-wrap">
            {variants.map((v) => (
              <Button key={v} variant={v}>{v}</Button>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Sizes">
        <Preview>
          <div className="flex items-end gap-3">
            {sizes.map((s) => (
              <Button key={s} size={s}>{s}</Button>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="States">
        <Preview>
          <div className="flex items-center gap-3 flex-wrap">
            <Button loading>로딩 중</Button>
            <Button disabled>비활성화</Button>
            <Button variant="danger" loading>삭제 중</Button>
            <Button fullWidth variant="secondary">전체 너비</Button>
          </div>
        </Preview>
      </Section>

      <Section title="With Icons">
        <Preview>
          <div className="flex items-center gap-3">
            <Button
              leftIcon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
            >
              추가
            </Button>
            <Button
              variant="secondary"
              rightIcon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            >
              다음
            </Button>
          </div>
        </Preview>
      </Section>

      <Section title="Code Example">
        <CodeBlock code={`<Button variant="primary" size="md" loading={isPending}>
  저장
</Button>

<Button
  variant="danger"
  leftIcon={<TrashIcon />}
  onClick={handleDelete}
>
  삭제
</Button>`} />
      </Section>
    </ComponentPage>
  );
}
