"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BrandSwitcher } from "@/ds/composites/BrandSwitcher";

export default function BrandSwitcherPage() {
  return (
    <ComponentPage
      name="BrandSwitcher"
      description="TODO: 1–2문장 설명"
      importPath='import { BrandSwitcher } from "@/ds/composites/BrandSwitcher"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BrandSwitcher />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
