"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Stat } from "@/ds/composites/Stat";

export default function StatPage() {
  return (
    <ComponentPage
      name="Stat"
      description="TODO: 1–2문장 설명"
      importPath='import { Stat } from "@/ds/composites/Stat"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Stat label="MAU" value="12,800" change={5.2} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
