"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PhoneInput } from "@/ds/primitives/PhoneInput";

export default function PhoneInputPage() {
  const [value, setValue] = useState("");
  return (
    <ComponentPage
      name="PhoneInput"
      description="국가 코드 선택 드롭다운이 포함된 전화번호 입력입니다. 입력값을 자릿수에 맞춰 자동으로 하이픈 포맷팅합니다."
      importPath='import { PhoneInput } from "@/ds/primitives/PhoneInput"'
      props={[
        { name: "value", type: "string", description: "숫자만 포함된 전화번호 값." },
        { name: "onChange", type: "(value: string, fullNumber: string) => void", description: "변경 콜백. 두 번째 인자는 국가 dial 코드가 붙은 전체 번호." },
        { name: "defaultCountry", type: '"KR" | "US" | "JP" | "CN" | "GB"', default: '"KR"', description: "기본 국가 코드." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "인풋 크기." },
        { name: "error", type: "boolean", description: "오류 상태 표시." },
        { name: "disabled", type: "boolean", description: "비활성화." },
      ]}
    >
      <Section title="Basic" description="국가 버튼을 누르면 코드 선택 드롭다운이 열립니다.">
        <Preview>
          <div className="flex flex-col gap-3">
            <PhoneInput value={value} onChange={setValue} />
            <p className="text-xs text-muted font-mono">value: {value || "(비어있음)"}</p>
          </div>
        </Preview>
      </Section>
      <Section title="Sizes & States">
        <Preview>
          <div className="flex flex-col gap-3">
            <PhoneInput size="sm" defaultCountry="US" />
            <PhoneInput size="md" defaultCountry="JP" />
            <PhoneInput size="lg" defaultCountry="GB" />
            <PhoneInput error />
            <PhoneInput disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
