"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PinInput } from "@/ds/primitives/PinInput";

export default function PinInputPage() {
  const [result, setResult] = useState("");
  return (
    <ComponentPage
      name="PinInput"
      description="PIN/OTP 입력. 자동 포커스 이동, 마스킹, 붙여넣기 지원."
      importPath='import { PinInput } from "@/ds/primitives/PinInput"'
      props={[
        { name: "length", type: "number", default: "6", description: "자릿수" },
        { name: "masked", type: "boolean", description: "마스킹 (●)" },
        { name: "numeric", type: "boolean", default: "true", description: "숫자만 허용" },
        {
          name: "onComplete",
          type: "(value: string) => void",
          description: "모든 자리 입력 완료 시",
        },
        { name: "error", type: "boolean", description: "에러 상태" },
      ]}
    >
      <Section title="6자리 OTP">
        <Preview>
          <div className="flex flex-col items-center gap-3">
            <PinInput length={6} onComplete={(v) => setResult(v)} />
            {result && <p className="text-sm text-success font-semibold">입력 완료: {result}</p>}
          </div>
        </Preview>
      </Section>

      <Section title="4자리 PIN (마스킹)">
        <Preview>
          <div className="flex justify-center">
            <PinInput length={4} masked onComplete={(v) => setResult(v)} />
          </div>
        </Preview>
      </Section>

      <Section title="에러 상태">
        <Preview>
          <div className="flex justify-center">
            <PinInput length={6} error />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
