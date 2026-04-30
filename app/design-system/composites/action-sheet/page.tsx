"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ActionSheet } from "@/ds/composites/ActionSheet";
import { Button } from "@/ds/primitives/Button";

export default function ActionSheetPage() {
  const [open, setOpen] = useState(false);

  return (
    <ComponentPage
      name="ActionSheet"
      description="모바일에서 화면 하단에 떠오르는 액션 메뉴. 여러 선택지 중 하나를 고를 때 사용합니다."
      importPath='import { ActionSheet } from "@/ds/composites/ActionSheet"'
      props={[
        { name: "open", type: "boolean", required: true, description: "열림 상태" },
        { name: "onClose", type: "() => void", required: true, description: "닫기 핸들러" },
        { name: "title", type: "string", description: "상단 제목" },
        { name: "actions", type: "ActionSheetAction[]", required: true, description: "{ label, onClick, danger?, disabled? } 배열" },
        { name: "cancelLabel", type: "string", default: '"취소"', description: "취소 버튼 라벨" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <Button onClick={() => setOpen(true)}>Action Sheet 열기</Button>
          <ActionSheet
            open={open}
            onClose={() => setOpen(false)}
            title="이 게시물에 대한 작업"
            actions={[
              { label: "공유하기", onClick: () => {} },
              { label: "북마크", onClick: () => {} },
              { label: "신고하기", onClick: () => {}, danger: true },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
