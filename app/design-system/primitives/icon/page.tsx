"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Icon } from "@/ds/primitives/Icon";

export default function IconPage() {
  return (
    <ComponentPage
      name="Icon"
      description="TODO: 1–2문장 설명"
      importPath='import { Icon } from "@/ds/primitives/Icon"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <Icon />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
