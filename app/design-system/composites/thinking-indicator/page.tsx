"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ThinkingIndicator } from "@/ds/composites/ThinkingIndicator";

export default function ThinkingIndicatorPage() {
  return (
    <ComponentPage
      name="ThinkingIndicator"
      description="TODO: 1–2문장 설명"
      importPath='import { ThinkingIndicator } from "@/ds/composites/ThinkingIndicator"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ThinkingIndicator />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
