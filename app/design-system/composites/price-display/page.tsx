"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PriceDisplay } from "@/ds/composites/PriceDisplay";

export default function PriceDisplayPage() {
  return (
    <ComponentPage
      name="PriceDisplay"
      description="TODO: 1–2문장 설명"
      importPath='import { PriceDisplay } from "@/ds/composites/PriceDisplay"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PriceDisplay value={29000} original={49000} currency="KRW" size="xl" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
