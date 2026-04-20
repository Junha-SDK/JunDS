"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Slider } from "@/ds/primitives/Slider";

export default function SliderPage() {
  const [val1, setVal1] = useState(40);
  const [val2, setVal2] = useState(50);
  const [val3, setVal3] = useState(30);
  const [val4, setVal4] = useState(60);
  const [val5, setVal5] = useState(25);

  return (
    <ComponentPage
      name="Slider"
      description="슬라이더 입력. 범위 내에서 값을 직관적으로 조절할 수 있습니다."
      importPath='import { Slider } from "@/ds/primitives/Slider"'
      props={[
        { name: "value", type: "number", default: "0", description: "현재 값" },
        { name: "onChange", type: "(value: number) => void", description: "값 변경 핸들러" },
        { name: "min", type: "number", default: "0", description: "최솟값" },
        { name: "max", type: "number", default: "100", description: "최댓값" },
        { name: "step", type: "number", default: "1", description: "증감 단위" },
        { name: "showValue", type: "boolean", default: "false", description: "값 표시 여부" },
        { name: "marks", type: "{ value: number; label?: string }[]", description: "마크 표시" },
        { name: "color", type: '"primary"|"success"|"warning"|"danger"', default: '"primary"', description: "색상" },
        { name: "size", type: '"sm"|"md"', default: '"md"', description: "크기" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
      ]}
    >
      <Section title="기본 (showValue)">
        <Preview>
          <div className="max-w-md">
            <Slider value={val1} onChange={setVal1} showValue />
          </div>
        </Preview>
      </Section>

      <Section title="마크 표시">
        <Preview>
          <div className="max-w-md pb-6">
            <Slider
              value={val2}
              onChange={setVal2}
              marks={[
                { value: 0, label: "0%" },
                { value: 25, label: "25%" },
                { value: 50, label: "50%" },
                { value: 75, label: "75%" },
                { value: 100, label: "100%" },
              ]}
            />
          </div>
        </Preview>
      </Section>

      <Section title="색상">
        <Preview>
          <div className="flex flex-col gap-5 max-w-md">
            <Slider value={val3} onChange={setVal3} color="primary" showValue />
            <Slider value={val4} onChange={setVal4} color="success" showValue />
            <Slider value={val5} onChange={setVal5} color="warning" showValue />
            <Slider value={70} color="danger" showValue disabled />
          </div>
        </Preview>
      </Section>

      <Section title="크기">
        <Preview>
          <div className="flex flex-col gap-5 max-w-md">
            <Slider value={val1} onChange={setVal1} size="sm" showValue />
            <Slider value={val1} onChange={setVal1} size="md" showValue />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
