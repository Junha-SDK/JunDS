"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { NumberInput } from "@/ds/primitives/NumberInput";

export default function NumberInputPage() {
  const [val1, setVal1] = useState(10);
  const [val2, setVal2] = useState(5);
  const [val3, setVal3] = useState(50);
  const [val4, setVal4] = useState(42);

  return (
    <ComponentPage
      name="NumberInput"
      description="숫자 입력 필드. 증감 버튼으로 편리하게 값을 조절할 수 있습니다."
      importPath='import { NumberInput } from "@/ds/primitives/NumberInput"'
      props={[
        { name: "value", type: "number", description: "현재 값" },
        { name: "onChange", type: "(value: number) => void", description: "값 변경 핸들러" },
        { name: "min", type: "number", description: "최솟값" },
        { name: "max", type: "number", description: "최댓값" },
        { name: "step", type: "number", default: "1", description: "증감 단위" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "hideControls", type: "boolean", default: "false", description: "+/- 버튼 숨김" },
        { name: "error", type: "boolean", default: "false", description: "에러 상태" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <NumberInput value={val1} onChange={setVal1} />
        </Preview>
      </Section>

      <Section title="최솟값 / 최댓값">
        <Preview>
          <div className="flex items-center gap-4">
            <NumberInput value={val2} onChange={setVal2} min={0} max={10} />
            <span className="text-sm text-muted">min=0, max=10</span>
          </div>
        </Preview>
      </Section>

      <Section title="크기">
        <Preview>
          <div className="flex items-end gap-4">
            <NumberInput value={val3} onChange={setVal3} size="sm" />
            <NumberInput value={val3} onChange={setVal3} size="md" />
            <NumberInput value={val3} onChange={setVal3} size="lg" />
          </div>
        </Preview>
      </Section>

      <Section title="버튼 숨김">
        <Preview>
          <NumberInput value={val4} onChange={setVal4} hideControls />
        </Preview>
      </Section>

      <Section title="상태">
        <Preview>
          <div className="flex items-center gap-4">
            <NumberInput value={0} error />
            <NumberInput value={0} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
