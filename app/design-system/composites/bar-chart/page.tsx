"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BarChart } from "@/ds/composites/BarChart";

export default function BarChartPage() {
  return (
    <ComponentPage
      name="BarChart"
      description="TODO: 1–2문장 설명"
      importPath='import { BarChart } from "@/ds/composites/BarChart"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <BarChart
            labels={["A", "B", "C", "D"]}
            series={[{ name: "매출", data: [10, 30, 20, 25] }]}
            showValues
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
