"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Kanban } from "@/ds/patterns/Kanban";
import type { KanbanColumn, KanbanItem } from "@/ds/patterns/Kanban";

interface Task extends KanbanItem {
  id: string;
  title: string;
  assignee: string;
  priority: "high" | "medium" | "low";
}

const initialColumns: KanbanColumn<Task>[] = [
  {
    id: "todo",
    title: "할 일",
    color: "#6366f1",
    items: [
      { id: "1", title: "로그인 페이지 디자인", assignee: "이서연", priority: "high" },
      { id: "2", title: "API 문서 작성", assignee: "박민수", priority: "medium" },
    ],
  },
  {
    id: "doing",
    title: "진행 중",
    color: "#f59e0b",
    items: [
      { id: "3", title: "대시보드 개발", assignee: "김준하", priority: "high" },
      { id: "4", title: "데이터베이스 설계", assignee: "한지호", priority: "medium" },
    ],
  },
  {
    id: "done",
    title: "완료",
    color: "#22c55e",
    items: [
      { id: "5", title: "프로젝트 초기 설정", assignee: "김준하", priority: "low" },
    ],
  },
];

const priorityColors = {
  high: "bg-danger-light text-danger",
  medium: "bg-warning-light text-warning",
  low: "bg-gray-100 text-muted",
};

export default function KanbanPage() {
  const [columns, setColumns] = useState(initialColumns);

  const handleMove = (itemId: string, fromColumn: string, toColumn: string) => {
    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, items: [...col.items] }));
      const fromCol = next.find((c) => c.id === fromColumn);
      const toCol = next.find((c) => c.id === toColumn);
      if (!fromCol || !toCol) return prev;
      const itemIdx = fromCol.items.findIndex((i) => i.id === itemId);
      if (itemIdx < 0) return prev;
      const [item] = fromCol.items.splice(itemIdx, 1);
      toCol.items.push(item);
      return next;
    });
  };

  return (
    <ComponentPage
      name="Kanban"
      description="칸반 보드. 드래그 앤 드롭으로 항목을 컬럼 간 이동할 수 있습니다."
      importPath='import { Kanban } from "@/ds/patterns/Kanban"'
      props={[
        { name: "columns", type: "KanbanColumn<T>[]", description: "컬럼 목록 (id, title, items)" },
        { name: "renderCard", type: "(item: T, columnId: string) => ReactNode", description: "카드 렌더 함수" },
        { name: "onMove", type: "(itemId, fromColumn, toColumn) => void", description: "드래그 이동 콜백" },
        { name: "renderColumnHeader", type: "(column) => ReactNode", description: "컬럼 헤더 커스텀" },
      ]}
    >
      <Section title="3열 칸반 보드">
        <Preview padding={false}>
          <div className="p-4 overflow-x-auto">
            <Kanban
              columns={columns}
              onMove={handleMove}
              renderCard={(task) => (
                <div className="bg-white border border-border rounded-lg p-3 shadow-sm">
                  <p className="text-sm font-medium text-foreground mb-2">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{task.assignee}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                      {task.priority === "high" ? "높음" : task.priority === "medium" ? "보통" : "낮음"}
                    </span>
                  </div>
                </div>
              )}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
