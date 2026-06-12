"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ScrollProgress } from "@/ds/composites/ScrollProgress";

export default function ScrollProgressPage() {
  return (
    <ComponentPage
      name="ScrollProgress"
      description="TODO: 1–2문장 설명"
      importPath='import { ScrollProgress } from "@/ds/composites/ScrollProgress"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ScrollProgress />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
