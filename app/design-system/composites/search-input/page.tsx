"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SearchInput } from "@/ds/composites/SearchInput";

export default function SearchInputPage() {
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("디자인 시스템");

  return (
    <ComponentPage
      name="SearchInput"
      description="디바운스가 내장된 검색 입력 컴포넌트. 로딩 상태와 빠른 초기화 버튼을 제공합니다."
      importPath='import { SearchInput } from "@/ds/composites/SearchInput"'
      props={[
        { name: "value", type: "string", description: "controlled 입력 값" },
        { name: "onChange", type: "(value: string) => void", description: "입력 변경 시 호출" },
        {
          name: "onSearch",
          type: "(value: string) => void",
          description: "디바운스 후 호출되는 검색 핸들러",
        },
        { name: "placeholder", type: "string", default: '"검색..."', description: "플레이스홀더" },
        { name: "debounce", type: "number", default: "300", description: "디바운스 지연(ms)" },
        { name: "loading", type: "boolean", description: "로딩 스피너 표시" },
        { name: "disabled", type: "boolean", description: "비활성화 여부" },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="w-80">
            <SearchInput value={v1} onChange={setV1} placeholder="검색어를 입력하세요" />
          </div>
        </Preview>
      </Section>

      <Section title="크기">
        <Preview>
          <div className="flex flex-col gap-3 w-80">
            <SearchInput size="sm" placeholder="Small" />
            <SearchInput size="md" placeholder="Medium" />
            <SearchInput size="lg" placeholder="Large" />
          </div>
        </Preview>
      </Section>

      <Section title="로딩 / 비활성화">
        <Preview>
          <div className="flex flex-col gap-3 w-80">
            <SearchInput value={v2} onChange={setV2} loading />
            <SearchInput placeholder="비활성화" disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
