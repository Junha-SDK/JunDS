# Recipe — DataTable Page (FilterBar + DataTable + Pagination)

## Goal

검색·필터·페이지네이션이 결합된 표 페이지를 만들고 싶다. `DataTable` 자체에
검색/페이지네이션이 내장되어 있지만, 페이지 헤더 영역의 글로벌 검색·필터·액션
버튼은 `FilterBar`로 분리해서 더 큰 레이아웃에 배치하는 것이 일반적이다.
이 레시피는 두 패턴을 한 페이지에서 합치는 표준 골격을 보여준다.

## Used components

- `FilterBar` — `@/ds/patterns/FilterBar`
- `DataTable` — `@/ds/patterns/DataTable`
- `Select` — `@/ds/composites/Select`
- `Button` — `@/ds/primitives/Button`
- `Tag` — `@/ds/primitives/Tag` (셀 렌더링용)

Props 검증: `.ai/props.json` → patterns → DataTable / FilterBar, composites
→ Select, primitives → Button / Tag. `DataTable` 의 `rowKey` 는 필수이며
`pageSize`/`searchable`/`exportable` 같은 토글로 내장 기능이 켜진다.

## Recipe

```tsx
"use client";
import { useMemo, useState } from "react";
import { FilterBar } from "@/ds/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/ds/patterns/DataTable";
import { Select } from "@/ds/composites/Select";
import { Button } from "@/ds/primitives/Button";
import { Tag } from "@/ds/primitives/Tag";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited" | "disabled";
  joinedAt: string;
}

const ALL_USERS: User[] = [
  { id: "1", name: "김지원", email: "ji@acme.com", status: "active", joinedAt: "2025-09-01" },
  { id: "2", name: "박서연", email: "seo@acme.com", status: "invited", joinedAt: "2025-10-12" },
  { id: "3", name: "이도윤", email: "do@acme.com", status: "disabled", joinedAt: "2024-12-30" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return ALL_USERS.filter((u) => {
      if (status !== "all" && u.status !== status) return false;
      if (search && !`${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, status]);

  const columns: DataTableColumn<User>[] = [
    { key: "name", header: "이름", render: (u) => u.name, sortable: true },
    { key: "email", header: "이메일", render: (u) => u.email },
    {
      key: "status",
      header: "상태",
      render: (u) => (
        <Tag color={u.status === "active" ? "green" : u.status === "invited" ? "orange" : "gray"}>
          {u.status}
        </Tag>
      ),
    },
    { key: "joinedAt", header: "가입일", render: (u) => u.joinedAt, sortable: true, align: "right" },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="이름 또는 이메일로 검색"
        filters={
          <Select
            options={[
              { value: "all", label: "모든 상태" },
              { value: "active", label: "활성" },
              { value: "invited", label: "초대됨" },
              { value: "disabled", label: "비활성" },
            ]}
            value={status}
            onChange={setStatus}
            size="sm"
          />
        }
        actions={<Button variant="primary" size="sm">사용자 초대</Button>}
        onReset={() => { setSearch(""); setStatus("all"); }}
        activeCount={(search ? 1 : 0) + (status !== "all" ? 1 : 0)}
      />

      <DataTable<User>
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        pageSize={10}
        selectable
        densityToggle
        columnToggle
        exportable
        exportFilename="users"
        emptyMessage="조건에 맞는 사용자가 없습니다"
      />
    </div>
  );
}
```

## Variations

- **서버 사이드 페이징** — `serverSide`, `totalRows`, `onPageChange`,
  `onSortChange`, `onFilterChange` 를 켜고 외부 fetch 와 연결한다. 이때
  `data` 는 현재 페이지 row 만 들어 있어야 한다.
- **선택 후 일괄 작업** — `bulkActions` prop 으로 선택한 행에 일괄 액션
  버튼(삭제·내보내기 등)을 노출할 수 있다.
- **별도 페이지네이션** — 표 외부에 큰 `Pagination` 을 두고 싶다면
  `serverSide`로 두고 `Pagination`(`@/ds/composites/Pagination`) 을 따로 둔다.
  `page`, `totalPages`, `onChange` 가 필수.
- **모바일 폴백** — 좁은 화면에서 표 대신 카드 리스트를 쓰고 싶다면
  `useBreakpoint`(`@/ds/hooks/useBreakpoint`) 로 분기한다.

## See also

- 쇼케이스: `/design-system/patterns/data-table`,
  `/design-system/patterns/filter-bar`, `/design-system/composites/pagination`
- 관련 레시피: `./dashboard-overview.md` (요약 카드 + 표)
- 요구사항: `requirements/design-system-library.md`
- 소스: `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/DataTable/DataTable.tsx`,
  `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/FilterBar/FilterBar.tsx`
