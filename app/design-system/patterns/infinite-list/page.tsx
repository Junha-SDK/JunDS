"use client";
import { useState, useCallback } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { InfiniteList } from "@/ds/patterns/InfiniteList";

interface FakeItem {
  id: number;
  title: string;
  description: string;
}

function generateItems(start: number, count: number): FakeItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: `항목 #${start + i + 1}`,
    description: `이것은 ${
      start + i + 1
    }번째 항목의 설명입니다. 스크롤하면 더 많은 항목이 로드됩니다.`,
  }));
}

export default function InfiniteListPage() {
  const [items, setItems] = useState<FakeItem[]>(() => generateItems(0, 20));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setItems((prev) => {
      const next = [...prev, ...generateItems(prev.length, 20)];
      if (next.length >= 100) setHasMore(false);
      return next;
    });
    setLoading(false);
  }, [loading]);

  return (
    <ComponentPage
      name="InfiniteList"
      description="무한 스크롤 리스트. 스크롤이 하단에 도달하면 자동으로 다음 데이터를 로드합니다."
      importPath='import { InfiniteList } from "@/ds/patterns/InfiniteList"'
      props={[
        { name: "items", type: "T[]", description: "현재 로드된 항목 배열" },
        { name: "renderItem", type: "(item: T) => ReactNode", description: "항목 렌더 함수" },
        { name: "onLoadMore", type: "() => void | Promise<void>", description: "추가 로드 콜백" },
        { name: "hasMore", type: "boolean", description: "더 로드할 데이터 존재 여부" },
        { name: "loading", type: "boolean", description: "로딩 상태" },
      ]}
    >
      <Section title="무한 스크롤 데모 (최대 100개)">
        <Preview>
          <div style={{ height: 400, overflow: "auto" }}>
            <InfiniteList
              items={items}
              hasMore={hasMore}
              loading={loading}
              onLoadMore={loadMore}
              keyExtractor={(item) => String(item.id)}
              renderItem={(item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border"
                >
                  <span className="text-xs font-mono text-muted w-8 text-right">{item.id + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted">{item.description}</p>
                  </div>
                </div>
              )}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            현재 {items.length}개 로드됨 {!hasMore && "— 모두 로드 완료"}
          </p>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
