"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DataGrid } from "@/ds/composites/DataGrid";

interface Row extends Record<string, unknown> {
  id: number;
  name: string;
  role: string;
  commits: number;
}

const rows: Row[] = [
  { id: 1, name: "김준하", role: "Frontend", commits: 128 },
  { id: 2, name: "이서연", role: "Backend", commits: 92 },
  { id: 3, name: "박민준", role: "Design", commits: 41 },
  { id: 4, name: "최지우", role: "DevOps", commits: 76 },
  { id: 5, name: "정하늘", role: "Frontend", commits: 53 },
];

export default function DataGridPage() {
  return (
    <ComponentPage
      name="DataGrid"
      description="정렬, 페이지네이션, 행 선택을 지원하는 데이터 테이블."
      importPath='import { DataGrid } from "@/ds/composites/DataGrid"'
      props={[
        { name: "data", type: "T[]", description: "표시할 행 데이터 배열" },
        { name: "columns", type: "DataGridColumn<T>[]", description: "key, header, sortable, render 등을 가진 컬럼 정의" },
        { name: "pageSize", type: "number", default: "20", description: "한 페이지에 표시할 행 수" },
        { name: "selectable", type: "boolean", description: "체크박스 선택 활성화" },
        { name: "onSelect", type: "(rows: T[]) => void", description: "선택 변경 콜백" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-2xl">
            <DataGrid<Row>
              data={rows}
              columns={[
                { key: "id", header: "ID", width: 60, sortable: true },
                { key: "name", header: "이름", sortable: true },
                { key: "role", header: "역할" },
                { key: "commits", header: "커밋", sortable: true },
              ]}
              pageSize={3}
              selectable
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
