"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ColorPicker } from "@/ds/composites/ColorPicker";

export default function ColorPickerPage() {
  const [color1, setColor1] = useState("#3B82F6");
  const [color2, setColor2] = useState("#22C55E");
  const [color3, setColor3] = useState("#EF4444");

  return (
    <ComponentPage
      name="ColorPicker"
      description="프리셋 색상 팔레트와 HEX 입력을 제공하는 색상 선택기입니다."
      importPath='import { ColorPicker } from "@/ds/composites/ColorPicker"'
      props={[
        { name: "value", type: "string", required: true, description: "현재 색상 값 (HEX)" },
        { name: "onChange", type: "(color: string) => void", required: true, description: "색상 변경 콜백" },
        { name: "presets", type: "string[]", description: "프리셋 색상 배열" },
        { name: "showInput", type: "boolean", default: "true", description: "HEX 입력 필드 표시 여부" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화 상태" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="flex items-center gap-4">
            <ColorPicker value={color1} onChange={setColor1} />
            <div
              className="w-16 h-16 rounded-lg border border-border"
              style={{ backgroundColor: color1 }}
            />
          </div>
        </Preview>
      </Section>

      <Section title="HEX 입력 없이">
        <Preview>
          <ColorPicker value={color2} onChange={setColor2} showInput={false} />
        </Preview>
      </Section>

      <Section title="커스텀 프리셋">
        <Preview>
          <ColorPicker
            value={color3}
            onChange={setColor3}
            presets={[
              "#FF6B6B", "#FF8E53", "#FFC93C", "#6BCB77",
              "#4D96FF", "#9B59B6", "#1ABC9C", "#E74C3C",
              "#3498DB", "#2ECC71", "#F39C12", "#8E44AD",
            ]}
          />
        </Preview>
      </Section>

      <Section title="비활성화">
        <Preview>
          <ColorPicker value="#6B7280" onChange={() => {}} disabled />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
