"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Affix } from "@/ds/composites/Affix";
import { Button } from "@/ds/primitives/Button";

export default function AffixPage() {
  return (
    <ComponentPage
      name="Affix"
      description="화면 모서리에 고정 배치되는 래퍼. FAB·헬프 위젯·치트 버튼 등을 viewport에 고정할 때 사용합니다."
      importPath='import { Affix } from "@/ds/composites/Affix"'
      props={[
        {
          name: "position",
          type: "{ top?, bottom?, left?, right? }",
          default: "{ bottom: 20, right: 20 }",
          description: "고정 위치 (px)",
        },
        { name: "zIndex", type: "number", default: "40", description: "z-index 값" },
      ]}
    >
      <Section
        title="Default"
        description="실제 페이지에서는 viewport 우하단에 떠 있습니다. 아래는 시각적 예시입니다."
      >
        <Preview>
          <div className="relative w-full h-48 border border-border rounded-xl bg-gray-50 overflow-hidden">
            <span className="absolute top-3 left-3 text-xs text-muted">스크롤되는 페이지 영역</span>
            <div className="absolute bottom-4 right-4 z-10">
              <Button>도움말</Button>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
