"use client";
import { useState, useMemo } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { VirtualList } from "@/ds/patterns/VirtualList";

export default function VirtualListPage() {
  const [count] = useState(10000);

  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `사용자 ${(i + 1).toLocaleString()}`,
        email: `user${i + 1}@example.com`,
        role: ["개발자", "디자이너", "기획자", "마케터", "운영"][i % 5],
      })),
    [count],
  );

  return (
    <ComponentPage
      name="VirtualList"
      description="가상 스크롤 리스트. 대량의 항목을 효율적으로 렌더링합니다. DOM에는 보이는 항목만 존재합니다."
      importPath='import { VirtualList } from "@/ds/patterns/VirtualList"'
      props={[
        { name: "items", type: "T[]", description: "전체 항목 배열" },
        { name: "height", type: "number", description: "리스트 컨테이너 높이 (px)" },
        { name: "itemHeight", type: "number", description: "개별 항목 높이 (px)" },
        { name: "renderItem", type: "(item: T, index: number) => ReactNode", description: "항목 렌더 함수" },
        { name: "overscan", type: "number", description: "뷰포트 밖 추가 렌더 항목 수 (기본 5)" },
      ]}
    >
      <Section title="10,000개 항목 가상 스크롤">
        <Preview>
          <p className="text-xs text-muted mb-2">총 {count.toLocaleString()}개 항목 — DOM에는 일부만 렌더됩니다</p>
          <VirtualList
            items={items}
            height={400}
            itemHeight={48}
            keyExtractor={(item) => String(item.id)}
            renderItem={(item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 border-b border-border"
                style={{ height: 48 }}
              >
                <span className="text-xs font-mono text-muted w-12 text-right">{(index + 1).toLocaleString()}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted truncate">{item.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted">{item.role}</span>
              </div>
            )}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
