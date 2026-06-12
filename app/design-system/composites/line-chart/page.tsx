"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LineChart } from "@/ds/composites/LineChart";

export default function LineChartPage() {
  return (
    <ComponentPage
      name="LineChart"
      description="TODO: 1–2문장 설명"
      importPath='import { LineChart } from "@/ds/composites/LineChart"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <LineChart labels={["월","화","수","목","금"]} series={[{name:"매출",data:[10,15,8,22,18],area:true}]} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
