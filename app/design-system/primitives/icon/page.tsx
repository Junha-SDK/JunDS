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
          <Icon size="lg" label="검색">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </Icon>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
