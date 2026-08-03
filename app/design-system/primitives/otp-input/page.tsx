"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { OTPInput } from "@/ds/primitives/OTPInput";

export default function OTPInputPage() {
  const [code, setCode] = useState("");
  return (
    <ComponentPage
      name="OTPInput"
      description="일회용 인증 코드 입력 컴포넌트입니다. 자동 포커스 이동, Backspace 처리, 붙여넣기를 지원합니다."
      importPath='import { OTPInput } from "@/ds/primitives/OTPInput"'
      props={[
        { name: "length", type: "number", default: "6", description: "코드 자릿수." },
        { name: "onChange", type: "(code: string) => void", description: "값 변경 콜백." },
        {
          name: "onComplete",
          type: "(code: string) => void",
          description: "모든 칸이 채워졌을 때 호출.",
        },
        {
          name: "error",
          type: "boolean",
          description: "오류 상태 (테두리 빨강 + shake 애니메이션).",
        },
        { name: "disabled", type: "boolean", description: "비활성화." },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
      ]}
    >
      <Section
        title="Basic"
        description="6자리 OTP 입력. 모든 칸을 채우면 onComplete가 호출됩니다."
      >
        <Preview>
          <div className="flex flex-col gap-3 items-start">
            <OTPInput length={6} onChange={setCode} />
            <p className="text-xs text-muted font-mono">현재 값: {code || "(비어있음)"}</p>
          </div>
        </Preview>
      </Section>
      <Section title="States">
        <Preview>
          <div className="flex flex-col gap-4 items-start">
            <OTPInput length={4} />
            <OTPInput length={6} error />
            <OTPInput length={6} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
