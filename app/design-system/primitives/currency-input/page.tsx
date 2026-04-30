"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CurrencyInput } from "@/ds/primitives/CurrencyInput";

export default function CurrencyInputPage() {
  const [krw, setKrw] = useState(125000);
  const [usd, setUsd] = useState(99.99);
  return (
    <ComponentPage
      name="CurrencyInput"
      description="통화 형식으로 숫자를 입력받는 인풋입니다. 포커스 해제 시 locale에 맞춰 통화 기호와 자릿수를 포맷팅합니다."
      importPath='import { CurrencyInput } from "@/ds/primitives/CurrencyInput"'
      props={[
        { name: "value", type: "number", description: "현재 숫자 값." },
        { name: "onChange", type: "(value: number) => void", description: "값 변경 핸들러." },
        { name: "currency", type: "string", default: '"KRW"', description: "ISO 4217 통화 코드." },
        { name: "locale", type: "string", default: '"ko-KR"', description: "Intl 로케일 식별자." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "인풋 크기." },
        { name: "error", type: "boolean", description: "오류 상태 표시." },
      ]}
    >
      <Section title="Basic" description="KRW와 USD 통화 포맷 예시입니다.">
        <Preview>
          <div className="flex flex-col gap-3 max-w-xs">
            <CurrencyInput value={krw} onChange={setKrw} currency="KRW" locale="ko-KR" />
            <CurrencyInput value={usd} onChange={setUsd} currency="USD" locale="en-US" />
          </div>
        </Preview>
      </Section>
      <Section title="Sizes & States">
        <Preview>
          <div className="flex flex-col gap-3 max-w-xs">
            <CurrencyInput value={krw} onChange={setKrw} size="sm" />
            <CurrencyInput value={krw} onChange={setKrw} size="md" />
            <CurrencyInput value={krw} onChange={setKrw} size="lg" />
            <CurrencyInput value={krw} onChange={setKrw} error />
            <CurrencyInput value={krw} onChange={setKrw} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
