"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Tooltip } from "@/ds/composites/Tooltip";
import { Button } from "@/ds/primitives/Button";

export default function TooltipPage() {
  return (
    <ComponentPage
      name="Tooltip"
      description="마우스 오버 시 추가 정보 표시."
      importPath='import { Tooltip } from "@/ds/composites/Tooltip"'
      props={[
        { name: "content", type: "ReactNode", required: true, description: "툴팁 내용" },
        {
          name: "position",
          type: '"top"|"bottom"|"left"|"right"',
          default: '"top"',
          description: "위치",
        },
        { name: "delay", type: "number", default: "200", description: "표시 지연(ms)" },
      ]}
    >
      <Section title="Positions">
        <Preview>
          <div className="flex items-center gap-4 py-8 justify-center">
            <Tooltip content="위쪽" position="top">
              <Button variant="secondary">Top</Button>
            </Tooltip>
            <Tooltip content="아래쪽" position="bottom">
              <Button variant="secondary">Bottom</Button>
            </Tooltip>
            <Tooltip content="왼쪽" position="left">
              <Button variant="secondary">Left</Button>
            </Tooltip>
            <Tooltip content="오른쪽" position="right">
              <Button variant="secondary">Right</Button>
            </Tooltip>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
