"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Spinner } from "@/ds/primitives/Spinner";

export default function SpinnerPage() {
  return (
    <ComponentPage
      name="Spinner"
      description="로딩 상태 인디케이터."
      importPath='import { Spinner } from "@/ds/primitives/Spinner"'
      props={[
        { name: "size", type: '"xs"|"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        {
          name: "color",
          type: '"primary"|"white"|"muted"',
          default: '"primary"',
          description: "색상",
        },
      ]}
    >
      <Section title="Sizes & Colors">
        <Preview>
          <div className="flex items-center gap-6">
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <div className="bg-primary p-3 rounded-lg">
              <Spinner size="md" color="white" />
            </div>
            <Spinner size="md" color="muted" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
