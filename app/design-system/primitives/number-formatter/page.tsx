"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { NumberFormatter } from "@/ds/primitives/NumberFormatter";

export default function NumberFormatterPage() {
  return (
    <ComponentPage
      name="NumberFormatter"
      description="Intl.NumberFormat 기반 숫자 포맷터입니다. 십진수, 통화, 퍼센트, 압축 표기를 지원합니다."
      importPath='import { NumberFormatter } from "@/ds/primitives/NumberFormatter"'
      props={[
        { name: "value", type: "number", description: "포맷팅할 숫자." },
        { name: "format", type: '"decimal" | "currency" | "percent" | "compact"', default: '"decimal"', description: "포맷 종류." },
        { name: "currency", type: "string", default: '"KRW"', description: "ISO 4217 통화 코드 (currency 포맷 사용 시)." },
        { name: "locale", type: "string", default: '"ko-KR"', description: "Intl 로케일 식별자." },
        { name: "decimals", type: "number", description: "표시할 소수점 자릿수." },
        { name: "prefix", type: "string", description: "값 앞에 붙일 접두사." },
        { name: "suffix", type: "string", description: "값 뒤에 붙일 접미사." },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
      ]}
    >
      <Section title="Formats" description="네 가지 포맷의 출력 차이입니다.">
        <Preview>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm tabular-nums max-w-md">
            <span className="text-muted">decimal</span>
            <NumberFormatter value={1234567.89} decimals={2} />
            <span className="text-muted">currency (KRW)</span>
            <NumberFormatter value={125000} format="currency" />
            <span className="text-muted">currency (USD)</span>
            <NumberFormatter value={99.99} format="currency" currency="USD" locale="en-US" />
            <span className="text-muted">percent</span>
            <NumberFormatter value={0.847} format="percent" decimals={1} />
            <span className="text-muted">compact</span>
            <NumberFormatter value={1234567} format="compact" />
            <span className="text-muted">prefix/suffix</span>
            <NumberFormatter value={42} prefix="≈ " suffix=" 회" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
