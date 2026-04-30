"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Clock } from "@/ds/composites/Clock";

export default function ClockPage() {
  return (
    <ComponentPage
      name="Clock"
      description="TODO: 1–2문장 설명"
      importPath='import { Clock } from "@/ds/composites/Clock"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Clock />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
