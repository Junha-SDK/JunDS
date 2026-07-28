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
  department: string;
  salary: number;
  status: "active" | "inactive" | "pending";
  joinDate: string;
}

const departments = ["Engineering", "Design", "Marketing", "Sales", "HR"];
const roles = ["Admin", "Manager", "Lead", "Member", "Guest"];
const statuses: User["status"][] = ["active", "inactive", "pending"];
const names = [
  "김준하",
  "이서연",
  "박민수",
  "최유진",
  "정다은",
  "한지우",
  "송태현",
  "오수빈",
  "임재혁",
  "윤하나",
];

const data: User[] = Array.from({ length: 200 }, (_, i) => ({
  id: String(i + 1),
  name: names[i % names.length],
  email: `user${i + 1}@example.com`,
  role: roles[i % roles.length],
  department: departments[i % departments.length],
  salary: 3000 + ((i * 1733 + 541) % 7000),
  status: statuses[i % 3],
  joinDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(
    2,
    "0",
  )}`,
}));

const columns: DataTableColumn<User>[] = [
  {
    key: "name",
    header: "이름",
    group: "인적사항",
    render: (r) => <span className="font-medium">{r.name}</span>,
    sortable: true,
    filterable: true,
    sortFn: (a, b) => a.name.localeCompare(b.name),
    editable: true,
    onEdit: (row, value) => {
      row.name = value;
    },
    sticky: true,
  },
  {
    key: "email",
    header: "이메일",
    group: "인적사항",
    render: (r) => <span className="text-muted">{r.email}</span>,
    filterable: true,
  },
  {
    key: "department",
    header: "부서",
    group: "소속",
    render: (r) => r.department,
    sortable: true,
    filterable: true,
    sortFn: (a, b) => a.department.localeCompare(b.department),
  },
  {
    key: "role",
    header: "역할",
    group: "소속",
    render: (r) => (
      <Badge
        variant={r.role === "Admin" ? "primary" : r.role === "Manager" ? "info" : "default"}
        size="sm"
      >
        {r.role}
      </Badge>
    ),
    sortable: true,
    filterable: true,
    sortFn: (a, b) => a.role.localeCompare(b.role),
  },
  {
    key: "salary",
    header: "연봉 (만원)",
    group: "보상",
    render: (r) => <span className="tabular-nums">{r.salary.toLocaleString()}</span>,
    sortable: true,
    sortFn: (a, b) => a.salary - b.salary,
    align: "right",
    aggregate: (rows) => {
      const avg = Math.round(rows.reduce((s, r) => s + r.salary, 0) / rows.length);
      return <span className="text-primary-ink">평균: {avg.toLocaleString()}</span>;
    },
  },
  {
    key: "status",
    header: "상태",
    render: (r) => (
      <Badge
        variant={r.status === "active" ? "success" : r.status === "pending" ? "warning" : "default"}
        dot
        size="sm"
      >
        {{ active: "활성", inactive: "비활성", pending: "대기" }[r.status]}
      </Badge>
    ),
    sortable: true,
    filterable: true,
    sortFn: (a, b) => a.status.localeCompare(b.status),
  },
  {
    key: "joinDate",
    header: "입사일",
    render: (r) => <span className="text-muted tabular-nums">{r.joinDate}</span>,
    sortable: true,
    sortFn: (a, b) => a.joinDate.localeCompare(b.joinDate),
    hidden: true,
  },
];

export default function DataTablePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  return (
    <ComponentPage
      name="DataTable"
      description="세계 최고 수준의 데이터 테이블. 글로벌 검색, 컬럼별 필터, 멀티 소트, 확장 행, 컬럼 리사이즈, 컬럼 토글, CSV/JSON 내보내기, 벌크 액션, 밀도 조절, 풀스크린, 인라인 편집, 컬럼 그룹핑, 행 요약/집계, 키보드 네비게이션, 가상 스크롤을 지원합니다."
      importPath='import { DataTable } from "@/ds/patterns/DataTable"'
      props={[
        { name: "columns", type: "DataTableColumn<T>[]", required: true, description: "컬럼 정의" },
        { name: "data", type: "T[]", required: true, description: "데이터 배열" },
        { name: "rowKey", type: "(row: T) => string", required: true, description: "행 키 추출" },
        { name: "searchable", type: "boolean", description: "글로벌 검색 활성화" },
        { name: "exportable", type: "boolean", description: "CSV/JSON 내보내기" },
        { name: "selectable", type: "boolean", description: "체크박스 선택" },
        { name: "expandable", type: "boolean", description: "행 확장" },
        { name: "columnToggle", type: "boolean", description: "컬럼 표시/숨김 토글" },
        { name: "densityToggle", type: "boolean", description: "행 밀도 조절" },
        { name: "fullscreenToggle", type: "boolean", description: "풀스크린 토글" },
        { name: "showSummary", type: "boolean", description: "행 요약/집계 표시" },
        { name: "virtualScroll", type: "boolean", description: "가상 스크롤 (대량 데이터)" },
        { name: "bulkActions", type: "BulkAction[]", description: "벌크 액션 버튼" },
        { name: "stickyHeader", type: "boolean", description: "헤더 고정" },
        { name: "striped", type: "boolean", description: "줄무늬 배경" },
        { name: "pageSize", type: "number", default: "20", description: "페이지당 행 수" },
        { name: "pageSizeOptions", type: "number[]", description: "페이지 크기 옵션" },
      ]}
    >
      <Section title="Full Featured (모든 기능 활성화)">
        <Preview padding={false}>
          <DataTable
            columns={columns}
            data={data}
            rowKey={(r) => r.id}
            /* 검색 & 필터 */
            searchable
            searchPlaceholder="이름, 이메일, 부서 검색..."
            /* 선택 & 벌크 */
            selectable
            selectedKeys={selected}
            onSelectionChange={setSelected}
            bulkActions={[
              {
                label: "삭제",
                variant: "danger",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 3h8M4.5 3V2h3v1M3 3v7a1 1 0 001 1h4a1 1 0 001-1V3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                onClick: (keys) => alert(`${keys.size}개 항목 삭제`),
              },
              {
                label: "내보내기",
                onClick: (keys) => alert(`${keys.size}개 항목 내보내기`),
              },
            ]}
            /* 확장 행 */
            expandable
            expandedRowRender={(row) => (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted text-xs mb-1">이메일</p>
                  <p className="font-medium">{row.email}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">부서</p>
                  <p className="font-medium">{row.department}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">입사일</p>
                  <p className="font-medium">{row.joinDate}</p>
                </div>
              </div>
            )}
            /* 도구 */
            exportable
            exportFilename="users"
            columnToggle
            densityToggle
            fullscreenToggle
            /* 표시 */
            showSummary
            striped
            stickyHeader
            pageSize={15}
            pageSizeOptions={[10, 15, 25, 50, 100]}
            caption="사용자 목록 테이블"
          />
        </Preview>
      </Section>

      <Section title="가상 스크롤 (200개 데이터)">
        <Preview padding={false}>
          <DataTable
            columns={columns.map((c) => ({ ...c, sticky: false, hidden: false, group: undefined }))}
            data={data}
            rowKey={(r) => r.id}
            virtualScroll
            searchable
            stickyHeader
            striped
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
