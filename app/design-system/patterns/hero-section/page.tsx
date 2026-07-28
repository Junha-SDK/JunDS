"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { HeroSection } from "@/ds/patterns/HeroSection";

export default function HeroSectionPage() {
  return (
    <ComponentPage
      name="HeroSection"
      description="TODO: 1–2문장 설명"
      importPath='import { HeroSection } from "@/ds/patterns/HeroSection"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <HeroSection
            title="당신의 디자인 시스템"
            subtitle="단 한 줄로 시작하세요"
            primaryCta={{ label: "시작하기" }}
            secondaryCta={{ label: "문서" }}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
