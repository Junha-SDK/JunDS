"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PasswordStrength } from "@/ds/composites/PasswordStrength";

export default function PasswordStrengthPage() {
  return (
    <ComponentPage
      name="PasswordStrength"
      description="TODO: 1–2문장 설명"
      importPath='import { PasswordStrength } from "@/ds/composites/PasswordStrength"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PasswordStrength password="Abc12!" showChecklist />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
