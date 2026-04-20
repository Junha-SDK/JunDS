"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { BackTop } from "@/ds/primitives/BackTop";

export default function BackTopPage() {
  return (
    <ComponentPage
      name="BackTop"
      description="페이지를 스크롤하면 나타나는 상단 이동 버튼입니다."
      importPath='import { BackTop } from "@/ds/primitives/BackTop"'
      props={[
        { name: "threshold", type: "number", default: "400", description: "버튼이 나타나는 스크롤 위치 (px)" },
        { name: "children", type: "ReactNode", description: "커스텀 버튼 콘텐츠" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-foreground">
              이 페이지를 아래로 스크롤하면 오른쪽 하단에 상단 이동 버튼이 나타납니다.
            </p>
            <p className="text-sm text-muted-foreground">
              기본 threshold는 400px이며, 스크롤 위치가 threshold를 넘으면 버튼이 표시됩니다.
            </p>
          </div>
        </Preview>
      </Section>
      <BackTop />
    </ComponentPage>
  );
}
