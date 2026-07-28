"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CTASection } from "@/ds/composites/CTASection";

export default function CTASectionPage() {
  return (
    <ComponentPage
      name="CTASection"
      description="TODO: 1–2문장 설명"
      importPath='import { CTASection } from "@/ds/composites/CTASection"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <CTASection
            variant="gradient"
            title="지금 바로 시작하세요"
            description="무료로 14일간 모든 기능을 사용해보세요"
            primaryCta={{ label: "무료 가입" }}
            secondaryCta={{ label: "문서 보기" }}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
