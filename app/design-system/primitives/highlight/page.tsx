"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Highlight } from "@/ds/primitives/Highlight";

export default function HighlightPage() {
  return (
    <ComponentPage
      name="Highlight"
      description="TODO: 1–2문장 설명"
      importPath='import { Highlight } from "@/ds/primitives/Highlight"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Highlight text="JunDS 디자인 시스템" query="디자인" variant="primary" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
