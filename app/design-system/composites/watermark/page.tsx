"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Watermark } from "@/ds/composites/Watermark";

export default function WatermarkPage() {
  const [text, setText] = useState("JunDS 기밀");

  return (
    <ComponentPage
      name="Watermark"
      description="콘텐츠 위에 반복되는 워터마크 텍스트를 오버레이하는 컴포넌트입니다."
      importPath='import { Watermark } from "@/ds/composites/Watermark"'
      props={[
        { name: "text", type: "string", required: true, description: "워터마크 텍스트" },
        { name: "children", type: "ReactNode", required: true, description: "워터마크가 적용될 콘텐츠" },
        { name: "fontSize", type: "number", default: "16", description: "폰트 크기 (px)" },
        { name: "color", type: "string", default: '"rgba(0,0,0,0.08)"', description: "워터마크 색상" },
        { name: "rotate", type: "number", default: "-22", description: "회전 각도" },
        { name: "gap", type: "number", default: "100", description: "워터마크 간격 (px)" },
      ]}
    >
      <Section title="기본 사용">
        <Preview padding={false}>
          <Watermark text="JunDS">
            <div className="p-8 min-h-[200px]">
              <h3 className="text-lg font-semibold mb-2">보호된 콘텐츠</h3>
              <p className="text-sm text-muted">
                이 영역에는 워터마크가 표시됩니다. 워터마크는 콘텐츠 위에 투명하게 오버레이되며,
                마우스 이벤트를 차단하지 않습니다.
              </p>
            </div>
          </Watermark>
        </Preview>
      </Section>

      <Section title="커스텀 텍스트">
        <Preview>
          <div className="mb-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="워터마크 텍스트 입력"
              className="h-9 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-primary w-64"
            />
          </div>
          <Watermark text={text} fontSize={14} gap={80}>
            <div className="p-6 min-h-[160px] bg-gray-50 rounded-lg">
              <p className="text-sm text-muted">워터마크 텍스트를 변경해보세요.</p>
            </div>
          </Watermark>
        </Preview>
      </Section>

      <Section title="색상 및 회전 커스터마이징">
        <Preview padding={false}>
          <Watermark text="CONFIDENTIAL" color="rgba(239, 68, 68, 0.1)" rotate={-30} fontSize={20} gap={120}>
            <div className="p-8 min-h-[200px]">
              <h3 className="text-lg font-semibold mb-2">기밀 문서</h3>
              <p className="text-sm text-muted">
                빨간색 워터마크가 -30도 각도로 표시됩니다. 색상, 회전 각도, 폰트 크기를 자유롭게 조절할 수 있습니다.
              </p>
            </div>
          </Watermark>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
