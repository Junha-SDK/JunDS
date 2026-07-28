"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AreaChart } from "@/ds/composites/AreaChart";

export default function AreaChartPage() {
  return (
    <ComponentPage
      name="AreaChart"
      description="TODO: 1–2문장 설명"
      importPath='import { AreaChart } from "@/ds/composites/AreaChart"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <AreaChart
            labels={["1월", "2월", "3월", "4월", "5월"]}
            series={[{ name: "매출", data: [10, 20, 15, 30, 25] }]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
