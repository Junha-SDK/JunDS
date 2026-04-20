"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { EmptyState } from "@/ds/composites/EmptyState";
import { Button } from "@/ds/primitives/Button";

export default function EmptyStatePage() {
  return (
    <ComponentPage
      name="EmptyState"
      description="빈 상태 표시. 아이콘, 제목, 설명, 액션 버튼."
      importPath='import { EmptyState } from "@/ds/composites/EmptyState"'
      props={[
        { name: "title", type: "string", required: true, description: "제목" },
        { name: "description", type: "string", description: "설명" },
        { name: "icon", type: "ReactNode", description: "커스텀 아이콘" },
        { name: "action", type: "ReactNode", description: "액션 버튼" },
      ]}
    >
      <Section title="Demo">
        <Preview>
          <EmptyState
            title="업무가 없습니다"
            description="새 업무를 추가해서 프로젝트를 시작해보세요."
            action={<Button size="sm">업무 추가</Button>}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
