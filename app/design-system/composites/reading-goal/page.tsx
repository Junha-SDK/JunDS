"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ReadingGoal } from "@/ds/composites/ReadingGoal";

export default function ReadingGoalPage() {
  return (
    <ComponentPage
      name="ReadingGoal"
      description="연/월간 목표 대비 누적 진행률을 원형으로 표시."
      importPath='import { ReadingGoal } from "@/ds/composites/ReadingGoal"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ReadingGoal current={23} target={50} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
