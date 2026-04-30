"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AddressInput } from "@/ds/composites/AddressInput";

export default function AddressInputPage() {
  return (
    <ComponentPage
      name="AddressInput"
      description="우편번호 검색 + 기본 주소 + 상세주소 입력을 묶은 한국형 주소 입력 컴포넌트."
      importPath='import { AddressInput } from "@/ds/composites/AddressInput"'
      props={[
        { name: "onSelect", type: "(address: { zonecode, address, detail }) => void", description: "주소 변경 콜백" },
        { name: "placeholder", type: "string", default: '"주소 검색"', description: "기본 주소 입력 placeholder" },
        { name: "disabled", type: "boolean", description: "비활성화" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="max-w-md w-full">
            <AddressInput onSelect={() => {}} />
          </div>
        </Preview>
      </Section>

      <Section title="Disabled">
        <Preview>
          <div className="max-w-md w-full">
            <AddressInput disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
