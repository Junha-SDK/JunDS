"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ScatterPlot } from "@/ds/composites/ScatterPlot";

export default function ScatterPlotPage() {
  return (
    <ComponentPage
      name="ScatterPlot"
      description="TODO: 1–2문장 설명"
      importPath='import { ScatterPlot } from "@/ds/composites/ScatterPlot"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <ScatterPlot
            series={[
              {
                name: "A",
                data: [
                  { x: 1, y: 2 },
                  { x: 3, y: 5 },
                  { x: 5, y: 3 },
                  { x: 7, y: 8 },
                ],
              },
              {
                name: "B",
                data: [
                  { x: 2, y: 6 },
                  { x: 4, y: 4 },
                  { x: 6, y: 7 },
                ],
              },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
