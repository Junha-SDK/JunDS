"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BatteryIndicator } from "@/ds/primitives/BatteryIndicator";

export default function BatteryIndicatorPage() {
  return (
    <ComponentPage
      name="BatteryIndicator"
      description="배터리 형태로 레벨/퍼센티지를 시각화하는 컴포넌트. autoColor를 사용하면 값에 따라 자동으로 색상이 변경됩니다."
      importPath='import { BatteryIndicator } from "@/ds/primitives/BatteryIndicator"'
      props={[
        { name: "value", type: "number", required: true, description: "0-100 퍼센트 값" },
        {
          name: "autoColor",
          type: "boolean",
          default: "false",
          description: "상태에 따른 색상 자동 적용 (>70 green, >30 yellow, else red)",
        },
        {
          name: "color",
          type: '"success"|"warning"|"danger"|"primary"',
          description: "수동 색상 지정",
        },
        { name: "label", type: "string", description: "라벨 텍스트" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="자동 색상">
        <p className="text-sm text-muted mb-3">
          autoColor를 사용하면 값에 따라 자동으로 색상이 변경됩니다. 70% 이상은 초록, 30% 이상은
          노랑, 그 이하는 빨강으로 표시됩니다.
        </p>
        <Preview>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={75} autoColor />
              <span className="text-xs text-muted">75%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={45} autoColor />
              <span className="text-xs text-muted">45%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={15} autoColor />
              <span className="text-xs text-muted">15%</span>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="수동 색상">
        <p className="text-sm text-muted mb-3">
          color prop으로 원하는 색상을 직접 지정할 수 있습니다.
        </p>
        <Preview>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={60} color="success" />
              <span className="text-xs text-muted">success</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={60} color="warning" />
              <span className="text-xs text-muted">warning</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={60} color="danger" />
              <span className="text-xs text-muted">danger</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={60} color="primary" />
              <span className="text-xs text-muted">primary</span>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="크기">
        <p className="text-sm text-muted mb-3">
          sm, md, lg 세 가지 크기를 지원합니다. lg 사이즈에서는 퍼센트 텍스트가 표시됩니다.
        </p>
        <Preview>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={65} autoColor size="sm" />
              <span className="text-xs text-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={65} autoColor size="md" />
              <span className="text-xs text-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BatteryIndicator value={65} autoColor size="lg" />
              <span className="text-xs text-muted">lg</span>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="라벨">
        <p className="text-sm text-muted mb-3">
          label prop으로 배터리 옆에 라벨 텍스트를 표시할 수 있습니다.
        </p>
        <Preview>
          <div className="flex flex-col gap-3">
            <BatteryIndicator value={85} autoColor label="서버 A" size="md" />
            <BatteryIndicator value={42} autoColor label="서버 B" size="md" />
            <BatteryIndicator value={12} autoColor label="서버 C" size="md" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
