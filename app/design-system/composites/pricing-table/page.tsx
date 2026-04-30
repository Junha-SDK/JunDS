"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PricingTable } from "@/ds/composites/PricingTable";

export default function PricingTablePage() {
  return (
    <ComponentPage
      name="PricingTable"
      description="TODO: 1–2문장 설명"
      importPath='import { PricingTable } from "@/ds/composites/PricingTable"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PricingTable />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
