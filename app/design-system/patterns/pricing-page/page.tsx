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
          <PricingPage title="요금제" description="필요한 만큼만 결제하세요" monthlyPlans={[
            { id:"free", name:"Free", price:"₩0", features:["기본"], ctaLabel:"시작" },
            { id:"pro", name:"Pro", price:"₩19,900", features:["전부"], ctaLabel:"업그레이드", highlighted:true },
          ]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
