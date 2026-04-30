"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { VirtualScroll } from "@/ds/composites/VirtualScroll";

const ITEMS = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  title: `아이템 #${i + 1}`,
  desc: `대용량 리스트의 ${i + 1}번째 항목입니다.`,
}));

export default function VirtualScrollPage() {
  return (
    <ComponentPage
      name="VirtualScroll"
      description="수만 건의 리스트를 부드럽게 표시하기 위한 가상 스크롤 컴포넌트. 보이는 영역만 렌더링하여 성능을 유지합니다."
      importPath='import { VirtualScroll } from "@/ds/composites/VirtualScroll"'
      props={[
        { name: "items", type: "T[]", required: true, description: "전체 아이템 배열" },
        { name: "itemHeight", type: "number", required: true, description: "각 아이템의 고정 높이(px)" },
        { name: "renderItem", type: "(item: T, index: number) => ReactNode", required: true, description: "아이템 렌더 함수" },
        { name: "overscan", type: "number", default: "5", description: "보이는 영역 위/아래로 여유 렌더 개수" },
        { name: "className", type: "string", description: "추가 클래스" },
        { name: "style", type: "CSSProperties", description: "인라인 스타일" },
      ]}
    >
      <Section title="10,000개 리스트" description="아래 컨테이너 안에서 스크롤하면 즉시 반응합니다.">
        <Preview>
          <div className="w-full max-w-md border border-border rounded-xl bg-white">
            <VirtualScroll
              items={ITEMS}
              itemHeight={56}
              style={{ height: 320 }}
              renderItem={(item) => (
                <div className="px-4 py-3 border-b border-border-light flex items-center gap-3 h-full">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {item.id + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted truncate">{item.desc}</p>
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
