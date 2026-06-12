"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PieChart } from "@/ds/composites/PieChart";

export default function PieChartPage() {
  return (
    <ComponentPage
      name="PieChart"
      description="TODO: 1–2문장 설명"
      importPath='import { PieChart } from "@/ds/composites/PieChart"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <PieChart data={[{label:"Free",value:30},{label:"Pro",value:55},{label:"Team",value:15}]} innerRatio={0.55} centerLabel="100%" />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
