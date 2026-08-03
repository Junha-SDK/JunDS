"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { OnboardingTour } from "@/ds/patterns/OnboardingTour";

export default function OnboardingTourPage() {
  return (
    <ComponentPage
      name="OnboardingTour"
      description="TODO: 1–2문장 설명"
      importPath='import { OnboardingTour } from "@/ds/patterns/OnboardingTour"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <OnboardingTour
            open={false}
            steps={[{ id: "1", target: "#x", title: "여기서 작성" }]}
            onClose={() => {}}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
