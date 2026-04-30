"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { GanttChart } from "@/ds/patterns/GanttChart";

export default function GanttChartPage() {
  return (
    <ComponentPage
      name="GanttChart"
      description="TODO: 1–2문장 설명"
      importPath='import { GanttChart } from "@/ds/patterns/GanttChart"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <GanttChart />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
