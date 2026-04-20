"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ScrollArea } from "@/ds/primitives/ScrollArea";

export default function ScrollAreaPage() {
  return (
    <ComponentPage
      name="ScrollArea"
      description="사용자 정의 스크롤바가 적용된 스크롤 컨테이너입니다."
      importPath='import { ScrollArea } from "@/ds/primitives/ScrollArea"'
      props={[
        { name: "maxHeight", type: "string | number", description: "최대 높이" },
        { name: "orientation", type: '"vertical"|"horizontal"|"both"', default: '"vertical"', description: "스크롤 방향" },
        { name: "children", type: "ReactNode", description: "자식 요소" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex flex-col gap-6 w-full max-w-md">
            <div>
              <p className="text-sm text-muted-foreground mb-2">세로 스크롤 (maxHeight: 200px)</p>
              <ScrollArea maxHeight={200} className="border rounded-lg p-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i} className="py-1 text-sm text-foreground">
                    항목 {i + 1} — 스크롤 영역 안의 콘텐츠입니다.
                  </p>
                ))}
              </ScrollArea>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">가로 스크롤</p>
              <ScrollArea orientation="horizontal" className="border rounded-lg p-4">
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="w-28 h-20 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary"
                    >
                      카드 {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
