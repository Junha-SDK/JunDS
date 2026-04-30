"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Countdown } from "@/ds/composites/Countdown";

export default function CountdownPage() {
  return (
    <ComponentPage
      name="Countdown"
      description="TODO: 1–2문장 설명"
      importPath='import { Countdown } from "@/ds/composites/Countdown"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Countdown />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
