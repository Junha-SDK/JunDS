"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PricingPage } from "@/ds/patterns/PricingPage";

export default function PricingPagePage() {
  return (
    <ComponentPage
      name="PricingPage"
      description="TODO: 1–2문장 설명"
      importPath='import { PricingPage } from "@/ds/patterns/PricingPage"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PricingPage />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
