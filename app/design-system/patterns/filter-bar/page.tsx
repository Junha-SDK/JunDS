"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FilterBar } from "@/ds/patterns/FilterBar";
import { Select } from "@/ds/composites/Select";
import { Button } from "@/ds/primitives/Button";

export default function FilterBarPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  return (
    <ComponentPage
      name="FilterBar"
      description="검색 + 필터 + 액션을 포함하는 필터 영역."
      importPath='import { FilterBar } from "@/ds/patterns/FilterBar"'
      props={[
        { name: "searchValue", type: "string", description: "검색어" },
        { name: "onSearchChange", type: "(value: string) => void", description: "검색 핸들러" },
        { name: "filters", type: "ReactNode", description: "필터 요소" },
        { name: "actions", type: "ReactNode", description: "우측 액션" },
        { name: "onReset", type: "() => void", description: "초기화" },
        { name: "activeCount", type: "number", description: "활성 필터 수" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="업무 검색..."
            filters={
              <Select
                options={[
                  { value: "all", label: "전체 상태" },
                  { value: "todo", label: "할 일" },
                  { value: "progress", label: "진행 중" },
                  { value: "done", label: "완료" },
                ]}
                value={status}
                onChange={setStatus}
                size="sm"
              />
            }
            actions={<Button size="sm">내보내기</Button>}
            onReset={() => {
              setSearch("");
              setStatus("");
            }}
            activeCount={status ? 1 : 0}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
