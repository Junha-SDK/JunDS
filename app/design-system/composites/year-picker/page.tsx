"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { YearPicker } from "@/ds/composites/YearPicker";

export default function YearPickerPage() {
  return (
    <ComponentPage
      name="YearPicker"
      description="TODO: 1–2문장 설명"
      importPath='import { YearPicker } from "@/ds/composites/YearPicker"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <YearPicker />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
