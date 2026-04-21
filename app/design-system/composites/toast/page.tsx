"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DsToastProvider, useDsToast } from "@/ds/composites/Toast";
import { Button } from "@/ds/primitives/Button";

function ToastDemo() {
  const { success, error, warning, info } = useDsToast();
  return (
    <div className="flex gap-3 flex-wrap">
      <Button variant="secondary" onClick={() => success("저장되었습니다!")}>Success</Button>
      <Button variant="secondary" onClick={() => error("오류가 발생했습니다.")}>Error</Button>
      <Button variant="secondary" onClick={() => warning("주의가 필요합니다.")}>Warning</Button>
      <Button variant="secondary" onClick={() => info("알림 메시지입니다.")}>Info</Button>
    </div>
  );
}

function ActionDemo() {
  const { success, warning } = useDsToast();
  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        variant="secondary"
        onClick={() =>
          success("파일이 삭제되었습니다.", {
            action: { label: "되돌리기", onClick: () => alert("되돌리기 완료!") },
          })
        }
      >
        삭제 + 되돌리기
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          warning("새 업데이트가 있습니다.", {
            action: { label: "업데이트", onClick: () => alert("업데이트 시작!") },
            duration: 6000,
          })
        }
      >
        업데이트 알림
      </Button>
    </div>
  );
}

function CustomContentDemo() {
  const { custom, confirm } = useDsToast();
  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        variant="secondary"
        onClick={() =>
          custom(
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">🎉</div>
              <div>
                <p className="text-sm font-medium text-foreground">축하합니다!</p>
                <p className="text-xs text-muted">레벨이 올랐습니다.</p>
              </div>
            </div>,
          )
        }
      >
        커스텀 토스트
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          confirm(
            "정말 삭제하시겠습니까?",
            () => alert("삭제됨!"),
            () => alert("취소됨!"),
          )
        }
      >
        확인 토스트
      </Button>
    </div>
  );
}

export default function ToastPage() {
  return (
    <DsToastProvider position="bottom-right">
      <ComponentPage
        name="Toast"
        description="토스트 알림. DsToastProvider + useDsToast 훅으로 사용."
        importPath='import { DsToastProvider, useDsToast } from "@/ds/composites/Toast"'
        props={[
          { name: "position", type: '"top-right"|"top-center"|"bottom-right"|"bottom-center"', default: '"bottom-right"', description: "위치" },
          { name: "maxToasts", type: "number", default: "5", description: "최대 표시 수" },
        ]}
      >
        <Section title="Interactive Demo">
          <Preview>
            <ToastDemo />
          </Preview>
        </Section>

        <Section title="액션 버튼">
          <Preview>
            <ActionDemo />
          </Preview>
        </Section>

        <Section title="커스텀 콘텐츠">
          <Preview>
            <CustomContentDemo />
          </Preview>
        </Section>
      </ComponentPage>
    </DsToastProvider>
  );
}
