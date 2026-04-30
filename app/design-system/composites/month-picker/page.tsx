"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MonthPicker } from "@/ds/composites/MonthPicker";

export default function MonthPickerPage() {
  return (
    <ComponentPage
      name="MonthPicker"
      description="TODO: 1–2문장 설명"
      importPath='import { MonthPicker } from "@/ds/composites/MonthPicker"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <MonthPicker />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
