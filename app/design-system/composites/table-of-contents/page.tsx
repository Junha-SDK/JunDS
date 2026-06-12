"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TableOfContents } from "@/ds/composites/TableOfContents";

export default function TableOfContentsPage() {
  return (
    <ComponentPage
      name="TableOfContents"
      description="TODO: 1–2문장 설명"
      importPath='import { TableOfContents } from "@/ds/composites/TableOfContents"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <TableOfContents />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
