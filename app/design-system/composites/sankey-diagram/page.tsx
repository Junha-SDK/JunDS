"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SankeyDiagram } from "@/ds/composites/SankeyDiagram";

export default function SankeyDiagramPage() {
  return (
    <ComponentPage
      name="SankeyDiagram"
      description="TODO: 1–2문장 설명"
      importPath='import { SankeyDiagram } from "@/ds/composites/SankeyDiagram"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <SankeyDiagram
            nodes={[
              { id: "방문", label: "방문" },
              { id: "가입", label: "가입" },
              { id: "이탈", label: "이탈" },
              { id: "구매", label: "구매" },
            ]}
            links={[
              { source: "방문", target: "가입", value: 30 },
              { source: "방문", target: "이탈", value: 70 },
              { source: "가입", target: "구매", value: 18 },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
