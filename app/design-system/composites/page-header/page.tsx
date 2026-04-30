"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PageHeader } from "@/ds/composites/PageHeader";

export default function PageHeaderPage() {
  return (
    <ComponentPage
      name="PageHeader"
      description="TODO: 1–2문장 설명"
      importPath='import { PageHeader } from "@/ds/composites/PageHeader"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PageHeader />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
