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
          <GanttChart tasks={[
            { id:"design", name:"디자인", start:"2026-04-01", end:"2026-04-10", progress:80 },
            { id:"dev", name:"개발", start:"2026-04-08", end:"2026-04-25", progress:40 },
            { id:"test", name:"테스트", start:"2026-04-22", end:"2026-04-29", progress:0 },
          ]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
