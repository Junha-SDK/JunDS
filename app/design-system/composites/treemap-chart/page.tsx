"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TreemapChart } from "@/ds/composites/TreemapChart";

export default function TreemapChartPage() {
  return (
    <ComponentPage
      name="TreemapChart"
      description="사각형 면적으로 값의 비율을 표현하는 차트. 카테고리별 점유율을 한눈에 비교할 수 있습니다."
      importPath='import { TreemapChart } from "@/ds/composites/TreemapChart"'
      props={[
        {
          name: "data",
          type: "{ label: string; value: number; color?: string }[]",
          required: true,
          description: "표시할 항목 목록",
        },
        { name: "width", type: "number", default: "400", description: "SVG 너비(px)" },
        { name: "height", type: "number", default: "250", description: "SVG 높이(px)" },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <TreemapChart
            data={[
              { label: "React", value: 4500 },
              { label: "Next.js", value: 3200 },
              { label: "TypeScript", value: 2400 },
              { label: "Tailwind", value: 1500 },
              { label: "Vitest", value: 800 },
              { label: "기타", value: 600 },
            ]}
          />
        </Preview>
      </Section>

      <Section title="커스텀 색상">
        <Preview>
          <TreemapChart
            width={480}
            height={280}
            data={[
              { label: "Mobile", value: 6200, color: "#5b4cc7" },
              { label: "Desktop", value: 3100, color: "#22c55e" },
              { label: "Tablet", value: 1100, color: "#f59e0b" },
              { label: "Other", value: 400, color: "#94a3b8" },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
