"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { QuantitySelector } from "@/ds/composites/QuantitySelector";

export default function QuantitySelectorPage() {
  return (
    <ComponentPage
      name="QuantitySelector"
      description="TODO: 1–2문장 설명"
      importPath='import { QuantitySelector } from "@/ds/composites/QuantitySelector"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <QuantitySelector defaultValue={3} max={10} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
