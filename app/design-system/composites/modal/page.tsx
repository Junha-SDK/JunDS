"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Modal } from "@/ds/composites/Modal";
import { Button } from "@/ds/primitives/Button";

export default function ModalPage() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");

  return (
    <ComponentPage
      name="Modal"
      description="모달 다이얼로그. Portal 기반, ESC 닫기, Header/Footer 서브 컴포넌트."
      importPath='import { Modal } from "@/ds/composites/Modal"'
      props={[
        { name: "open", type: "boolean", required: true, description: "열림 상태" },
        { name: "onClose", type: "() => void", required: true, description: "닫기 핸들러" },
        { name: "size", type: '"sm"|"md"|"lg"|"xl"|"full"', default: '"md"', description: "크기" },
        { name: "dismissible", type: "boolean", default: "true", description: "배경 클릭으로 닫기" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex gap-3">
            {(["sm", "md", "lg"] as const).map((s) => (
              <Button key={s} variant="secondary" onClick={() => { setSize(s); setOpen(true); }}>
                {s.toUpperCase()} Modal
              </Button>
            ))}
          </div>

          <Modal open={open} onClose={() => setOpen(false)} size={size}>
            <Modal.Header onClose={() => setOpen(false)}>
              {size.toUpperCase()} 모달
            </Modal.Header>
            <div className="p-5">
              <p className="text-sm text-muted">
                모달 내용입니다. ESC 키 또는 배경 클릭으로 닫을 수 있습니다.
              </p>
            </div>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>취소</Button>
              <Button onClick={() => setOpen(false)}>확인</Button>
            </Modal.Footer>
          </Modal>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
