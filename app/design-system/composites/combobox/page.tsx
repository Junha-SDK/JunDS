"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Combobox } from "@/ds/composites/Combobox";
import type { ComboboxOption } from "@/ds/composites/Combobox";

const basicOptions: ComboboxOption[] = [
  { value: "김준하", label: "김준하" },
  { value: "이서연", label: "이서연" },
  { value: "박민수", label: "박민수" },
  { value: "최유진", label: "최유진" },
  { value: "정다은", label: "정다은" },
  { value: "한지호", label: "한지호" },
];

const descOptions: ComboboxOption[] = [
  { value: "김준하", label: "김준하", description: "개발팀 / 프론트엔드" },
  { value: "이서연", label: "이서연", description: "디자인팀 / UI 디자인" },
  { value: "박민수", label: "박민수", description: "개발팀 / 백엔드" },
  { value: "최유진", label: "최유진", description: "기획팀 / PM" },
  { value: "정다은", label: "정다은", description: "마케팅팀 / 콘텐츠" },
];

export default function ComboboxPage() {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");

  return (
    <ComponentPage
      name="Combobox"
      description="콤보박스. 검색 + 선택 + 새 값 생성을 지원하는 입력 컴포넌트입니다."
      importPath='import { Combobox } from "@/ds/composites/Combobox"'
      props={[
        { name: "options", type: "ComboboxOption[]", description: "선택 옵션 목록" },
        { name: "value", type: "string", description: "선택된 값" },
        { name: "onChange", type: "(value: string) => void", description: "값 변경 핸들러" },
        { name: "placeholder", type: "string", default: '"검색..."', description: "플레이스홀더" },
        { name: "creatable", type: "boolean", default: "false", description: "새 값 생성 허용" },
        { name: "loading", type: "boolean", default: "false", description: "로딩 상태" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화" },
        { name: "error", type: "boolean", default: "false", description: "에러 상태" },
        {
          name: "emptyMessage",
          type: "string",
          default: '"결과 없음"',
          description: "빈 결과 메시지",
        },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="max-w-xs">
            <Combobox
              options={basicOptions}
              value={val1}
              onChange={setVal1}
              placeholder="담당자 검색..."
            />
          </div>
        </Preview>
      </Section>

      <Section title="생성 가능 (Creatable)">
        <Preview>
          <div className="max-w-xs">
            <Combobox
              options={basicOptions}
              value={val2}
              onChange={setVal2}
              placeholder="이름 검색 또는 추가..."
              creatable
            />
            {val2 && <p className="text-xs text-muted mt-2">선택: {val2}</p>}
          </div>
        </Preview>
      </Section>

      <Section title="설명 포함">
        <Preview>
          <div className="max-w-sm">
            <Combobox
              options={descOptions}
              value={val3}
              onChange={setVal3}
              placeholder="팀원 검색..."
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
