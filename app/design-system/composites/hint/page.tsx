"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Hint } from "@/ds/composites/Hint";

export default function HintPage() {
  return (
    <ComponentPage
      name="Hint"
      description="TODO: 1–2문장 설명"
      importPath='import { Hint } from "@/ds/composites/Hint"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Hint variant="info">8자 이상 입력하세요</Hint>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
