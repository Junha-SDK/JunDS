"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Heatmap } from "@/ds/composites/Heatmap";

function generateData(weeks = 26) {
  const data: { date: string; value: number }[] = [];
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7);
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    data.push({
      date: d.toISOString().slice(0, 10),
      value: Math.random() < 0.4 ? 0 : Math.floor(Math.random() * 12),
    });
  }
  return data;
}

const data = generateData();

export default function HeatmapPage() {
  return (
    <ComponentPage
      name="Heatmap"
      description="GitHub 컨트리뷰션 그래프 스타일의 일자별 활동 히트맵."
      importPath='import { Heatmap } from "@/ds/composites/Heatmap"'
      props={[
        {
          name: "data",
          type: "{ date: string; value: number }[]",
          description: "ISO 날짜 문자열과 값을 가진 배열",
        },
        {
          name: "colorScale",
          type: "string[]",
          description: "값 강도에 따른 색상 단계 (낮음 → 높음)",
        },
        { name: "cellSize", type: "number", default: "12", description: "셀 한 변의 크기(px)" },
        { name: "gap", type: "number", default: "2", description: "셀 사이 간격(px)" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="overflow-x-auto">
            <Heatmap data={data} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
