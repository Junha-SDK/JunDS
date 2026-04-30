"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Sticky } from "@/ds/composites/Sticky";

export default function StickyPage() {
  return (
    <ComponentPage
      name="Sticky"
      description="부모 컨테이너 안에서 스크롤에 따라 상단에 고정되는 래퍼. CSS position: sticky 기반의 가벼운 컴포넌트입니다."
      importPath='import { Sticky } from "@/ds/composites/Sticky"'
      props={[
        { name: "children", type: "ReactNode", required: true, description: "고정될 콘텐츠" },
        { name: "top", type: "number", default: "0", description: "상단으로부터의 오프셋(px)" },
        { name: "zIndex", type: "number", default: "10", description: "z-index 값" },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="기본 동작" description="컨테이너 안에서 스크롤 해보세요. 헤더가 상단에 붙어 따라옵니다.">
        <Preview>
          <div className="w-full max-w-md h-64 overflow-auto border border-border rounded-xl bg-white">
            <Sticky top={0}>
              <div className="px-4 py-2 bg-primary text-white text-sm font-semibold border-b border-primary/40">
                고정된 헤더
              </div>
            </Sticky>
            <div className="p-4 space-y-3 text-sm text-muted">
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i}>스크롤 콘텐츠 라인 {i + 1}</p>
              ))}
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
