"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Pagination } from "@/ds/composites/Pagination";

export default function PaginationPage() {
  const [page, setPage] = useState(5);
  return (
    <ComponentPage
      name="Pagination"
      description="페이지 네비게이션. 스마트 말줄임 처리."
      importPath='import { Pagination } from "@/ds/composites/Pagination"'
      props={[
        { name: "page", type: "number", required: true, description: "현재 페이지" },
        { name: "totalPages", type: "number", required: true, description: "총 페이지 수" },
        {
          name: "onChange",
          type: "(page: number) => void",
          required: true,
          description: "변경 핸들러",
        },
        {
          name: "siblings",
          type: "number",
          default: "1",
          description: "현재 페이지 양 옆 표시 수",
        },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <div className="flex flex-col gap-6 items-center">
            <Pagination page={page} totalPages={20} onChange={setPage} />
            <p className="text-xs text-muted">현재: {page}페이지</p>
            <Pagination page={1} totalPages={3} onChange={() => {}} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
