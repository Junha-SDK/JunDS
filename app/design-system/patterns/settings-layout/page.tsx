"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SettingsLayout } from "@/ds/patterns/SettingsLayout";

export default function SettingsLayoutPage() {
  return (
    <ComponentPage
      name="SettingsLayout"
      description="TODO: 1–2문장 설명"
      importPath='import { SettingsLayout } from "@/ds/patterns/SettingsLayout"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <SettingsLayout />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
