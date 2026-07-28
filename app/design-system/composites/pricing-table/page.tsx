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
          <PricingTable
            plans={[
              {
                id: "free",
                name: "Free",
                price: "₩0",
                priceSuffix: "/월",
                features: ["사용자 1명", "기본 기능"],
                ctaLabel: "시작하기",
              },
              {
                id: "pro",
                name: "Pro",
                price: "₩19,900",
                priceSuffix: "/월",
                features: ["사용자 10명", "모든 기능", "우선 지원"],
                ctaLabel: "업그레이드",
                highlighted: true,
                badge: "인기",
              },
              {
                id: "team",
                name: "Team",
                price: "₩49,900",
                priceSuffix: "/월",
                features: ["무제한 사용자", "SSO", "SLA 99.9%"],
                ctaLabel: "문의하기",
              },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
