"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SortableList } from "@/ds/patterns/SortableList";

interface TaskItem {
  id: string;
  title: string;
  priority: string;
  [key: string]: unknown;
}

const initialItems: TaskItem[] = [
  { id: "1", title: "디자인 시스템 컴포넌트 정리", priority: "높음" },
  { id: "2", title: "API 엔드포인트 리팩토링", priority: "높음" },
  { id: "3", title: "단위 테스트 작성", priority: "보통" },
  { id: "4", title: "문서 업데이트", priority: "낮음" },
  { id: "5", title: "성능 최적화 분석", priority: "보통" },
];

export default function SortableListPage() {
  const [items, setItems] = useState(initialItems);

  const handleReorder = (reordered: TaskItem[]) => {
    setItems(reordered);
  };

  return (
    <ComponentPage
      name="SortableList"
      description="정렬 가능한 리스트. 드래그 핸들을 이용해 항목의 순서를 변경할 수 있습니다."
      importPath='import { SortableList } from "@/ds/patterns/SortableList"'
      props={[
        { name: "items", type: "T[]", description: "항목 배열 (id 필수)" },
        { name: "onReorder", type: "(items: T[]) => void", description: "순서 변경 콜백" },
        {
          name: "renderItem",
          type: "(item: T, index: number) => ReactNode",
          description: "항목 렌더 함수",
        },
        { name: "handle", type: "boolean", description: "드래그 핸들 표시 여부 (기본 true)" },
      ]}
    >
      <Section title="드래그로 순서 변경">
        <Preview>
          <SortableList
            items={items}
            onReorder={handleReorder}
            renderItem={(item, index) => (
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-lg">
                <span className="text-xs font-mono text-muted w-5 text-center">{index + 1}</span>
                <span className="text-sm font-medium text-foreground flex-1">{item.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.priority === "높음"
                      ? "bg-red-50 text-red-600"
                      : item.priority === "보통"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            )}
          />
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted">
              현재 순서: {items.map((i) => i.title.slice(0, 6) + "…").join(" → ")}
            </p>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
