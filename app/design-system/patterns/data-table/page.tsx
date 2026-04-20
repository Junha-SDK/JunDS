"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DataTable } from "@/ds/patterns/DataTable";
import { Badge } from "@/ds/primitives/Badge";
import type { DataTableColumn } from "@/ds/patterns/DataTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const data: User[] = Array.from({ length: 35 }, (_, i) => ({
  id: String(i + 1),
  name: ["김준하", "이서연", "박민수", "최유진", "정다은"][i % 5],
  email: `user${i + 1}@example.com`,
  role: ["Admin", "User", "Guest"][i % 3],
  status: i % 4 === 0 ? "inactive" : "active",
}));

const columns: DataTableColumn<User>[] = [
  { key: "name", header: "이름", render: (r) => <span className="font-medium">{r.name}</span>, sortable: true, sortFn: (a, b) => a.name.localeCompare(b.name) },
  { key: "email", header: "이메일", render: (r) => <span className="text-muted">{r.email}</span> },
  { key: "role", header: "역할", render: (r) => <Badge variant={r.role === "Admin" ? "primary" : "default"} size="sm">{r.role}</Badge> },
  { key: "status", header: "상태", render: (r) => <Badge variant={r.status === "active" ? "success" : "default"} dot size="sm">{r.status === "active" ? "활성" : "비활성"}</Badge> },
];

export default function DataTablePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  return (
    <ComponentPage
      name="DataTable"
      description="데이터 테이블. 정렬, 선택, 페이지네이션 내장."
      importPath='import { DataTable } from "@/ds/patterns/DataTable"'
      props={[
        { name: "columns", type: "DataTableColumn<T>[]", required: true, description: "컬럼 정의" },
        { name: "data", type: "T[]", required: true, description: "데이터 배열" },
        { name: "rowKey", type: "(row: T) => string", required: true, description: "행 키 추출" },
        { name: "selectable", type: "boolean", description: "체크박스 선택" },
        { name: "pageSize", type: "number", default: "20", description: "페이지당 행 수" },
        { name: "striped", type: "boolean", description: "줄무늬 배경" },
        { name: "onRowClick", type: "(row: T) => void", description: "행 클릭 핸들러" },
      ]}
    >
      <Section title="Full Featured Demo">
        <Preview padding={false}>
          <DataTable
            columns={columns}
            data={data}
            rowKey={(r) => r.id}
            selectable
            selectedKeys={selected}
            onSelectionChange={setSelected}
            pageSize={10}
            striped
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
