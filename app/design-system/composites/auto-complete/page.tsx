"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AutoComplete } from "@/ds/composites/AutoComplete";

const fruitOptions = [
  { key: "apple", label: "사과", description: "빨간 과일" },
  { key: "banana", label: "바나나", description: "노란 과일" },
  { key: "grape", label: "포도", description: "보라색 과일" },
  { key: "orange", label: "오렌지", description: "주황색 과일" },
  { key: "strawberry", label: "딸기", description: "빨간 작은 과일" },
  { key: "watermelon", label: "수박", description: "초록색 큰 과일" },
  { key: "peach", label: "복숭아", description: "분홍색 과일" },
  { key: "kiwi", label: "키위", description: "갈색 껍질의 과일" },
];

export default function AutoCompletePage() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ComponentPage
      name="AutoComplete"
      description="입력에 따라 자동완성 제안을 표시하는 검색 입력 컴포넌트입니다."
      importPath='import { AutoComplete } from "@/ds/composites/AutoComplete"'
      props={[
        { name: "value", type: "string", required: true, description: "입력 값" },
        {
          name: "onChange",
          type: "(value: string) => void",
          required: true,
          description: "값 변경 콜백",
        },
        {
          name: "options",
          type: "AutoCompleteOption[]",
          required: true,
          description: "자동완성 옵션 목록",
        },
        {
          name: "onSelect",
          type: "(option: AutoCompleteOption) => void",
          description: "옵션 선택 콜백",
        },
        { name: "placeholder", type: "string", description: "플레이스홀더" },
        { name: "loading", type: "boolean", default: "false", description: "로딩 상태" },
        {
          name: "emptyMessage",
          type: "string",
          default: '"결과 없음"',
          description: "결과 없을 때 메시지",
        },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화 상태" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="max-w-sm">
            <AutoComplete
              value={value1}
              onChange={setValue1}
              options={fruitOptions}
              onSelect={(opt) => setSelected(opt.label)}
              placeholder="과일을 검색하세요..."
            />
            {selected && <p className="mt-3 text-sm text-muted">선택된 항목: {selected}</p>}
          </div>
        </Preview>
      </Section>

      <Section title="로딩 상태">
        <Preview>
          <div className="max-w-sm">
            <AutoComplete
              value={value2}
              onChange={setValue2}
              options={[]}
              loading
              placeholder="검색 중..."
            />
          </div>
        </Preview>
      </Section>

      <Section title="비활성화">
        <Preview>
          <div className="max-w-sm">
            <AutoComplete value="사과" onChange={() => {}} options={fruitOptions} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
