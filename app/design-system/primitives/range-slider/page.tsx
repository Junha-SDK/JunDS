"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { RangeSlider } from "@/ds/primitives/RangeSlider";

export default function RangeSliderPage() {
  const [range, setRange] = useState<[number, number]>([20, 75]);
  const [price, setPrice] = useState<[number, number]>([10000, 80000]);
  return (
    <ComponentPage
      name="RangeSlider"
      description="두 개의 핸들로 최솟값과 최댓값을 선택하는 범위 슬라이더입니다. 키보드(화살표) 조작과 포인터 드래그를 모두 지원합니다."
      importPath='import { RangeSlider } from "@/ds/primitives/RangeSlider"'
      props={[
        { name: "value", type: "[number, number]", description: "현재 [최솟값, 최댓값] 튜플." },
        {
          name: "onChange",
          type: "(value: [number, number]) => void",
          description: "값 변경 핸들러.",
        },
        { name: "min", type: "number", default: "0", description: "전체 범위의 최솟값." },
        { name: "max", type: "number", default: "100", description: "전체 범위의 최댓값." },
        { name: "step", type: "number", default: "1", description: "값 변경 단위." },
        { name: "showValues", type: "boolean", description: "트랙 위쪽에 현재 값 표시." },
        { name: "disabled", type: "boolean", description: "비활성화." },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
      ]}
    >
      <Section title="Basic" description="0 - 100 범위에서 두 값을 선택합니다.">
        <Preview>
          <div className="w-full max-w-sm">
            <RangeSlider value={range} onChange={setRange} showValues />
            <p className="mt-3 text-xs text-muted font-mono">
              value: [{range[0]}, {range[1]}]
            </p>
          </div>
        </Preview>
      </Section>
      <Section
        title="Custom Range"
        description="가격대 필터처럼 큰 범위와 step을 지정할 수 있습니다."
      >
        <Preview>
          <div className="w-full max-w-sm">
            <RangeSlider
              value={price}
              onChange={setPrice}
              min={0}
              max={100000}
              step={1000}
              showValues
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
