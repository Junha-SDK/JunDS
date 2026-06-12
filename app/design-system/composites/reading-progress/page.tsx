"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ReadingProgress } from "@/ds/composites/ReadingProgress";

export default function ReadingProgressPage() {
  return (
    <ComponentPage
      name="ReadingProgress"
      description="현재/총 페이지 + 챕터 + 남은 시간을 한 줄 또는 넓은 막대로 표시."
      importPath='import { ReadingProgress } from "@/ds/composites/ReadingProgress"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ReadingProgress currentPage={86} totalPages={312} chapter="3장. 노이즈" remainingMinutes={42} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
