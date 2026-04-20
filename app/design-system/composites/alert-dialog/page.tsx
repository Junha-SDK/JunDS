"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AlertDialog } from "@/ds/composites/AlertDialog";

export default function AlertDialogPage() {
  const [dangerOpen, setDangerOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <ComponentPage
      name="AlertDialog"
      description="경고 다이얼로그. 배경 클릭으로 닫을 수 없으며, 사용자의 명시적 확인이 필요한 작업에 사용합니다."
      importPath='import { AlertDialog } from "@/ds/composites/AlertDialog"'
      props={[
        { name: "open", type: "boolean", required: true, description: "열림 상태" },
        { name: "onConfirm", type: "() => void", required: true, description: "확인 핸들러" },
        { name: "onCancel", type: "() => void", required: true, description: "취소 핸들러" },
        { name: "title", type: "string", required: true, description: "제목" },
        { name: "description", type: "string", required: true, description: "설명 텍스트" },
        { name: "variant", type: '"danger"|"warning"|"info"', default: '"info"', description: "변형 스타일" },
        { name: "confirmLabel", type: "string", default: '"확인"', description: "확인 버튼 텍스트" },
        { name: "cancelLabel", type: "string", default: '"취소"', description: "취소 버튼 텍스트" },
        { name: "loading", type: "boolean", default: "false", description: "로딩 상태" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDangerOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors cursor-pointer"
            >
              삭제하기
            </button>
            <button
              type="button"
              onClick={() => setWarningOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
            >
              경고
            </button>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              정보
            </button>
          </div>

          <AlertDialog
            open={dangerOpen}
            onConfirm={() => setDangerOpen(false)}
            onCancel={() => setDangerOpen(false)}
            title="정말 삭제하시겠습니까?"
            description="이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다."
            variant="danger"
            confirmLabel="삭제"
          />

          <AlertDialog
            open={warningOpen}
            onConfirm={() => setWarningOpen(false)}
            onCancel={() => setWarningOpen(false)}
            title="변경 사항을 저장하지 않았습니다"
            description="저장하지 않고 나가면 변경 사항이 손실됩니다."
            variant="warning"
            confirmLabel="나가기"
          />

          <AlertDialog
            open={infoOpen}
            onConfirm={() => setInfoOpen(false)}
            onCancel={() => setInfoOpen(false)}
            title="업데이트 확인"
            description="새 버전이 준비되었습니다. 지금 업데이트하시겠습니까?"
            variant="info"
            confirmLabel="업데이트"
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
