"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ReadingStats } from "@/ds/composites/ReadingStats";

export default function ReadingStatsPage() {
  return (
    <ComponentPage
      name="ReadingStats"
      description="오늘 페이지/스트릭/완독/누적 시간 4종 지표 카드."
      importPath='import { ReadingStats } from "@/ds/composites/ReadingStats"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ReadingStats pagesToday={42} pagesGoal={50} streakDays={12} booksCompleted={37} totalMinutes={2840} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
