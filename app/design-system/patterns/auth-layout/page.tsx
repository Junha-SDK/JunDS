"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AuthLayout } from "@/ds/patterns/AuthLayout";

export default function AuthLayoutPage() {
  return (
    <ComponentPage
      name="AuthLayout"
      description="TODO: 1–2문장 설명"
      importPath='import { AuthLayout } from "@/ds/patterns/AuthLayout"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <AuthLayout />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
