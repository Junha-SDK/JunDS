"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Table } from "@/ds/composites/Table";

const sampleData = [
  { name: "김준하", role: "Frontend", status: "활성", email: "junha@example.com" },
  { name: "이서윤", role: "Backend", status: "활성", email: "seoyun@example.com" },
  { name: "박도현", role: "Designer", status: "비활성", email: "dohyun@example.com" },
  { name: "최수아", role: "PM", status: "활성", email: "sua@example.com" },
  { name: "정민준", role: "DevOps", status: "활성", email: "minjun@example.com" },
];

export default function TablePage() {
  return (
    <ComponentPage
      name="Table"
      description="데이터 테이블. 줄무늬, 호버, 콤팩트 모드를 지원하며 커스텀 렌더링이 가능합니다."
      importPath='import { Table } from "@/ds/composites/Table"'
      props={[
        { name: "columns", type: "TableColumn[]", required: true, description: "컬럼 정의" },
        { name: "data", type: "T[]", required: true, description: "테이블 데이터" },
        { name: "striped", type: "boolean", default: "false", description: "줄무늬 스타일" },
        { name: "hoverable", type: "boolean", default: "false", description: "호버 효과" },
        { name: "compact", type: "boolean", default: "false", description: "콤팩트 모드" },
        { name: "onRowClick", type: "(row, index) => void", description: "행 클릭 핸들러" },
        { name: "emptyMessage", type: "string", default: '"데이터가 없습니다"', description: "빈 상태 메시지" },
      ]}
    >
      <Section title="기본 테이블">
        <Preview padding={false}>
          <Table
            columns={[
              { key: "name", header: "이름" },
              { key: "role", header: "역할" },
              { key: "email", header: "이메일" },
              {
                key: "status",
                header: "상태",
                align: "center",
                render: (value: string) => (
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      value === "활성"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {value}
                  </span>
                ),
              },
            ]}
            data={sampleData}
          />
        </Preview>
      </Section>

      <Section title="줄무늬 + 호버">
        <Preview padding={false}>
          <Table
            striped
            hoverable
            columns={[
              { key: "name", header: "이름" },
              { key: "role", header: "역할" },
              { key: "email", header: "이메일" },
              { key: "status", header: "상태", align: "center" },
            ]}
            data={sampleData}
          />
        </Preview>
      </Section>

      <Section title="콤팩트 모드">
        <Preview padding={false}>
          <Table
            compact
            hoverable
            columns={[
              { key: "name", header: "이름" },
              { key: "role", header: "역할" },
              { key: "status", header: "상태" },
            ]}
            data={sampleData}
          />
        </Preview>
      </Section>

      <Section title="빈 상태">
        <Preview padding={false}>
          <Table
            columns={[
              { key: "name", header: "이름" },
              { key: "role", header: "역할" },
            ]}
            data={[]}
            emptyMessage="표시할 데이터가 없습니다."
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
