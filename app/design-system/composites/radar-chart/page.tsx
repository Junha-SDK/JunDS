"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { RadarChart } from "@/ds/composites/RadarChart";

export default function RadarChartPage() {
  return (
    <ComponentPage
      name="RadarChart"
      description="TODO: 1–2문장 설명"
      importPath='import { RadarChart } from "@/ds/composites/RadarChart"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <RadarChart
            axes={["속도", "품질", "가격", "UX", "지원"]}
            series={[
              { name: "제품 A", data: [3, 5, 4, 5, 2] },
              { name: "제품 B", data: [5, 3, 3, 4, 5] },
            ]}
            max={5}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
