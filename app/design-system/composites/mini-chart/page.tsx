"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { MiniChart } from "@/ds/composites/MiniChart";

const data = [4, 8, 6, 12, 9, 14, 10, 18, 16, 22];

export default function MiniChartPage() {
  return (
    <ComponentPage
      name="MiniChart"
      description="작은 인라인 차트(스파크라인)입니다. 라인, 영역, 막대 형태를 지원합니다."
      importPath='import { MiniChart } from "@/ds/composites/MiniChart"'
      props={[
        { name: "data", type: "number[]", description: "차트 데이터" },
        { name: "type", type: '"line"|"bar"|"area"', default: '"line"', description: "차트 유형" },
        { name: "width", type: "number", default: "120", description: "너비(px)" },
        { name: "height", type: "number", default: "32", description: "높이(px)" },
        { name: "color", type: "string", default: '"var(--primary)"', description: "선/바 색상" },
      ]}
    >
      <Section title="유형별">
        <Preview>
          <div className="flex flex-col gap-3 items-start">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted w-16">Line</span>
              <MiniChart data={data} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted w-16">Area</span>
              <MiniChart data={data} type="area" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted w-16">Bar</span>
              <MiniChart data={data} type="bar" />
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="크기 조정">
        <Preview>
          <MiniChart data={data} type="area" width={240} height={64} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
