"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FeatureGrid } from "@/ds/patterns/FeatureGrid";

export default function FeatureGridPage() {
  return (
    <ComponentPage
      name="FeatureGrid"
      description="TODO: 1–2문장 설명"
      importPath='import { FeatureGrid } from "@/ds/patterns/FeatureGrid"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <FeatureGrid
            title="왜 JunDS?"
            features={[
              { icon: "⚡", title: "빠름", description: "가벼운 번들" },
              { icon: "🎨", title: "테마", description: "다크 모드" },
              { icon: "♿", title: "접근성", description: "WCAG AA" },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
