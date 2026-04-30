"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Mark } from "@/ds/primitives/Mark";

export default function MarkPage() {
  return (
    <ComponentPage
      name="Mark"
      description="TODO: 1–2문장 설명"
      importPath='import { Mark } from "@/ds/primitives/Mark"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Mark />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
