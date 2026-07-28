"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ColorSwatch } from "@/ds/composites/ColorSwatch";

const PALETTE = [
  "#0070F3",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#111827",
];

export default function ColorSwatchPage() {
  const [selected, setSelected] = useState<string>("#0070F3");

  return (
    <ComponentPage
      name="ColorSwatch"
      description="색상 팔레트에서 하나를 선택하는 컴포넌트. 클릭하면 헥스 코드가 클립보드에 복사됩니다."
      importPath='import { ColorSwatch } from "@/ds/composites/ColorSwatch"'
      props={[
        { name: "colors", type: "string[]", required: true, description: "헥스 색상 배열" },
        { name: "selected", type: "string", description: "선택된 색상" },
        { name: "onSelect", type: "(color: string) => void", description: "선택 콜백" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "스와치 크기" },
        { name: "showLabel", type: "boolean", description: "선택된 색상의 헥스 코드를 옆에 표시" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <ColorSwatch colors={PALETTE} selected={selected} onSelect={setSelected} showLabel />
        </Preview>
      </Section>

      <Section title="Sizes">
        <Preview>
          <div className="flex flex-col gap-3">
            <ColorSwatch colors={PALETTE} size="sm" />
            <ColorSwatch colors={PALETTE} size="md" />
            <ColorSwatch colors={PALETTE} size="lg" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
