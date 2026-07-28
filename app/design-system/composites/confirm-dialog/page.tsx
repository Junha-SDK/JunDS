"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ConfirmDialog } from "@/ds/composites/ConfirmDialog";
import { Button } from "@/ds/primitives/Button";

export default function ConfirmDialogPage() {
  const [normalOpen, setNormalOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  return (
    <ComponentPage
      name="ConfirmDialog"
      description="확인 다이얼로그. 사용자에게 중요한 액션을 다시 확인받을 때 사용합니다."
      importPath='import { ConfirmDialog } from "@/ds/composites/ConfirmDialog"'
      props={[
        { name: "open", type: "boolean", description: "열림 상태" },
        { name: "onClose", type: "() => void", description: "닫기 핸들러" },
        { name: "onConfirm", type: "() => void", description: "확인 핸들러" },
        { name: "title", type: "string", description: "제목" },
        { name: "description", type: "string | ReactNode", description: "설명 텍스트" },
        {
          name: "confirmLabel",
          type: "string",
          default: '"확인"',
          description: "확인 버튼 텍스트",
        },
        { name: "cancelLabel", type: "string", default: '"취소"', description: "취소 버튼 텍스트" },
        { name: "danger", type: "boolean", default: "false", description: "위험 액션 여부" },
        { name: "loading", type: "boolean", default: "false", description: "로딩 상태" },
      ]}
    >
      <Section title="일반 확인">
        <Preview>
          <Button onClick={() => setNormalOpen(true)}>상태 변경</Button>
          <ConfirmDialog
            open={normalOpen}
            onClose={() => setNormalOpen(false)}
            onConfirm={() => setNormalOpen(false)}
            title="상태를 변경하시겠습니까?"
            description="이 업무의 상태가 '완료'로 변경됩니다."
            confirmLabel="변경"
          />
        </Preview>
      </Section>

      <Section title="위험 확인">
        <Preview>
          <Button variant="danger" onClick={() => setDangerOpen(true)}>
            삭제
          </Button>
          <ConfirmDialog
            open={dangerOpen}
            onClose={() => setDangerOpen(false)}
            onConfirm={() => setDangerOpen(false)}
            title="정말 삭제하시겠습니까?"
            description="이 작업은 되돌릴 수 없습니다. 관련된 모든 데이터가 영구적으로 삭제됩니다."
            danger
            confirmLabel="삭제"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
