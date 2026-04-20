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
      </ComponentPage>
    </DsToastProvider>
  );
}
