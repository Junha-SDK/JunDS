"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { GradientBorder } from "@/ds/composites/GradientBorder";

export default function GradientBorderPage() {
  return (
    <ComponentPage
      name="GradientBorder"
      description="그라디언트 테두리를 가진 컨테이너. animated 옵션으로 그라디언트 위치가 흐르는 효과를 줄 수 있습니다."
      importPath='import { GradientBorder } from "@/ds/composites/GradientBorder"'
      props={[
        {
          name: "gradient",
          type: "string",
          default: '"from-primary via-accent to-primary"',
          description: "Tailwind 그라디언트 클래스 시퀀스",
        },
        { name: "borderWidth", type: "number", default: "2", description: "테두리 두께(px)" },
        {
          name: "rounded",
          type: "string",
          default: '"rounded-xl"',
          description: "Tailwind 둥근 모서리 클래스",
        },
        {
          name: "animated",
          type: "boolean",
          default: "false",
          description: "그라디언트 흐름 애니메이션",
        },
        { name: "children", type: "ReactNode", description: "내부 콘텐츠" },
        { name: "className", type: "string", description: "외곽 컨테이너 클래스" },
      ]}
    >
      <Section title="Variants">
        <Preview>
          <div className="flex flex-wrap gap-6">
            <GradientBorder>
              <div className="px-6 py-4 text-sm font-medium">기본 그라디언트</div>
            </GradientBorder>
            <GradientBorder animated borderWidth={3}>
              <div className="px-6 py-4 text-sm font-medium">애니메이션</div>
            </GradientBorder>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
