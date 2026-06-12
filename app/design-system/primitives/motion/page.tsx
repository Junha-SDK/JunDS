"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Motion } from "@/ds/primitives/Motion";

export default function MotionPage() {
  return (
    <ComponentPage
      name="Motion"
      description="TODO: 1–2문장 설명"
      importPath='import { Motion } from "@/ds/primitives/Motion"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Motion />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
