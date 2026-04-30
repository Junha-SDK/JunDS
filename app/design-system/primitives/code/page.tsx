"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Code } from "@/ds/primitives/Code";

export default function CodePage() {
  return (
    <ComponentPage
      name="Code"
      description="TODO: 1–2문장 설명"
      importPath='import { Code } from "@/ds/primitives/Code"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Code />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
