"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SplitPane } from "@/ds/composites/SplitPane";

export default function SplitPanePage() {
  return (
    <ComponentPage
      name="SplitPane"
      description="드래그로 너비 또는 높이를 조절할 수 있는 두 영역의 분할 패널. 가로 / 세로 방향을 모두 지원합니다."
      importPath='import { SplitPane } from "@/ds/composites/SplitPane"'
      props={[
        { name: "left", type: "ReactNode", required: true, description: "첫 번째(왼쪽/위) 영역" },
        { name: "right", type: "ReactNode", required: true, description: "두 번째(오른쪽/아래) 영역" },
        { name: "direction", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "분할 방향" },
        { name: "defaultSize", type: "number", default: "50", description: "첫 번째 영역의 초기 크기(%)" },
        { name: "minSize", type: "number", default: "20", description: "최소 크기(%)" },
        { name: "maxSize", type: "number", default: "80", description: "최대 크기(%)" },
      ]}
    >
      <Section title="가로 분할">
        <Preview>
          <div className="w-full h-48 border border-border rounded-xl overflow-hidden">
            <SplitPane
              left={<div className="p-4 bg-primary/5 h-full text-sm">왼쪽 패널</div>}
              right={<div className="p-4 h-full text-sm">오른쪽 패널 — 가운데 핸들을 드래그하세요.</div>}
            />
          </div>
        </Preview>
      </Section>

      <Section title="세로 분할">
        <Preview>
          <div className="w-full h-64 border border-border rounded-xl overflow-hidden">
            <SplitPane
              direction="vertical"
              defaultSize={40}
              left={<div className="p-4 bg-primary/5 h-full text-sm">위 패널</div>}
              right={<div className="p-4 h-full text-sm">아래 패널</div>}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
