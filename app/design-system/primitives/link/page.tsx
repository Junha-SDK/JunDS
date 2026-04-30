"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Link } from "@/ds/primitives/Link";

export default function LinkPage() {
  return (
    <ComponentPage
      name="Link"
      description="TODO: 1–2문장 설명"
      importPath='import { Link } from "@/ds/primitives/Link"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Link />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
