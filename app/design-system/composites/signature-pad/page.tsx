"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SignaturePad } from "@/ds/composites/SignaturePad";

export default function SignaturePadPage() {
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <ComponentPage
      name="SignaturePad"
      description="마우스 또는 터치로 서명을 받고 PNG 데이터 URL로 저장할 수 있는 캔버스 입력 컴포넌트입니다."
      importPath='import { SignaturePad } from "@/ds/composites/SignaturePad"'
      props={[
        {
          name: "onSave",
          type: "(dataUrl: string) => void",
          description: "저장 시 PNG dataURL 반환",
        },
        { name: "width", type: "number", default: "400", description: "캔버스 너비(px)" },
        { name: "height", type: "number", default: "200", description: "캔버스 높이(px)" },
        {
          name: "strokeColor",
          type: "string",
          default: '"var(--foreground)"',
          description: "선 색상",
        },
        { name: "strokeWidth", type: "number", default: "2", description: "선 두께" },
        { name: "disabled", type: "boolean", description: "비활성화 여부" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <SignaturePad onSave={(d) => setSaved(d)} />
        </Preview>
        {saved && (
          <p className="text-xs text-muted mt-2">서명이 저장되었습니다 ({saved.length}자)</p>
        )}
      </Section>

      <Section title="커스텀 스타일">
        <Preview>
          <SignaturePad width={320} height={160} strokeColor="#5b4cc7" strokeWidth={3} />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
