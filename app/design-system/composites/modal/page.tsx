"use client";
import { useState } from "react";
import { ComponentPage, Section, Guidelines, Anatomy, UsageNote, AccessibilityNote, CodeExample, VariantGrid, VariantItem } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Modal } from "@/ds/composites/Modal";
import { Button } from "@/ds/primitives/Button";

export default function ModalPage() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<"sm" | "md" | "lg" | "xl" | "full">("md");

  return (
    <ComponentPage
      name="Modal"
      description="사용자의 주의를 집중시키는 대화형 오버레이입니다. Portal 기반으로 렌더링되며, ESC 키 닫기, 배경 클릭 닫기, 포커스 트랩을 기본 지원합니다. Header/Footer 서브 컴포넌트로 일관된 레이아웃을 구성할 수 있습니다."
      importPath='import { Modal } from "@/ds/composites/Modal"'
      status="stable"
      version="1.0.0"
      props={[
        { name: "open", type: "boolean", required: true, description: "모달의 열림/닫힘 상태를 제어합니다." },
        { name: "onClose", type: "() => void", required: true, description: "모달이 닫혀야 할 때 호출되는 콜백입니다. ESC 키, 배경 클릭, 닫기 버튼 등에서 트리거됩니다." },
        { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "모달 너비를 결정합니다. 컨텐츠 양에 맞게 선택하세요." },
        { name: "dismissible", type: "boolean", default: "true", description: "배경(backdrop) 클릭으로 닫기를 허용할지 결정합니다. 중요한 확인 모달에서는 false로 설정하세요." },
        { name: "className", type: "string", description: "모달 컨테이너에 추가할 커스텀 클래스입니다." },
      ]}
      related={[
        { name: "Drawer", href: "/design-system/composites/drawer" },
        { name: "AlertDialog", href: "/design-system/composites/alert-dialog" },
        { name: "ConfirmDialog", href: "/design-system/composites/confirm-dialog" },
        { name: "Sheet", href: "/design-system/composites/sheet" },
        { name: "BottomSheet", href: "/design-system/composites/bottom-sheet" },
      ]}
    >
      {/* ── Overview ── */}
      <Section title="Overview" description="모달은 현재 페이지 위에 떠오르는 대화 상자입니다. 사용자가 중요한 결정을 내리거나, 추가 정보를 입력하거나, 경고를 확인해야 할 때 사용합니다. 아래 버튼을 클릭하여 직접 체험해 보세요.">
        <Preview>
          <div className="flex gap-3 flex-wrap">
            {(["sm", "md", "lg", "xl", "full"] as const).map((s) => (
              <Button
                key={s}
                variant="secondary"
                onClick={() => {
                  setSize(s);
                  setOpen(true);
                }}
              >
                {s.toUpperCase()} Modal
              </Button>
            ))}
          </div>

          <Modal open={open} onClose={() => setOpen(false)} size={size}>
            <Modal.Header onClose={() => setOpen(false)}>
              {size.toUpperCase()} 모달 데모
            </Modal.Header>
            <div className="p-5">
              <p className="text-sm text-muted leading-relaxed">
                이 모달은 <strong>{size}</strong> 크기입니다. ESC 키를 누르거나 배경을 클릭하여 닫을 수 있습니다.
                모달이 열리면 포커스가 자동으로 모달 내부로 이동하며, Tab 키로 순환합니다.
              </p>
            </div>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setOpen(false)}>확인</Button>
            </Modal.Footer>
          </Modal>
        </Preview>
      </Section>

      {/* ── Anatomy ── */}
      <Section title="Anatomy" description="Modal 컴포넌트의 구조를 이해하면 올바르게 조합할 수 있습니다.">
        <Anatomy
          items={[
            { label: "Backdrop", description: "모달 뒤에 깔리는 반투명 배경입니다. 클릭 시 onClose가 호출됩니다 (dismissible=true일 때)." },
            { label: "Container", description: "모달 콘텐츠를 감싸는 흰색 카드입니다. size prop에 따라 max-width가 달라집니다." },
            { label: "Header (Modal.Header)", description: "모달 상단의 제목과 닫기 버튼 영역입니다. onClose를 전달하면 X 버튼이 자동으로 표시됩니다." },
            { label: "Body", description: "모달의 주요 콘텐츠 영역입니다. 별도 서브 컴포넌트 없이 자유롭게 구성합니다." },
            { label: "Footer (Modal.Footer)", description: "모달 하단의 액션 버튼 영역입니다. 취소/확인 버튼을 배치합니다. 우측 정렬이 기본입니다." },
          ]}
        />
      </Section>

      {/* ── Sizes ── */}
      <Section title="Sizes" description="콘텐츠의 양과 복잡도에 따라 5가지 크기를 선택할 수 있습니다.">
        <VariantGrid cols={3}>
          <VariantItem label="Small (sm)" description="간단한 확인, 짧은 메시지 표시">
            <code className="text-xs text-muted">max-w-md</code>
          </VariantItem>
          <VariantItem label="Medium (md)" description="기본 크기. 폼, 상세 정보 표시">
            <code className="text-xs text-muted">max-w-lg</code>
          </VariantItem>
          <VariantItem label="Large (lg)" description="복잡한 폼, 테이블 포함 콘텐츠">
            <code className="text-xs text-muted">max-w-2xl</code>
          </VariantItem>
        </VariantGrid>
        <div className="mt-4">
          <VariantGrid cols={2}>
            <VariantItem label="Extra Large (xl)" description="대시보드, 미리보기 등 넓은 콘텐츠">
              <code className="text-xs text-muted">max-w-4xl</code>
            </VariantItem>
            <VariantItem label="Full" description="전체 화면에 가까운 크기. 에디터, 갤러리 등">
              <code className="text-xs text-muted">max-w / max-h with 2rem margin</code>
            </VariantItem>
          </VariantGrid>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section title="주요 기능" description="Modal은 접근성과 UX를 위한 핵심 기능을 기본 내장하고 있습니다.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border p-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Focus Trap</h4>
            <p className="text-xs text-muted leading-relaxed">모달이 열리면 포커스가 내부에 갇힙니다. Tab 키로 순환하며 마지막 요소에서 첫 번째로 돌아갑니다.</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">ESC 키 닫기</h4>
            <p className="text-xs text-muted leading-relaxed">키보드의 Escape 키를 누르면 즉시 모달이 닫힙니다. 별도 설정 없이 자동 동작합니다.</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Backdrop 닫기</h4>
            <p className="text-xs text-muted leading-relaxed">반투명 배경을 클릭하면 모달이 닫힙니다. dismissible=false로 비활성화할 수 있습니다.</p>
          </div>
        </div>
      </Section>

      {/* ── Guidelines ── */}
      <Section title="Guidelines" description="모달을 효과적으로 사용하기 위한 디자인 원칙입니다.">
        <Guidelines
          items={[
            {
              type: "do",
              description: "중요한 결정이나 확인이 필요한 상황에서만 모달을 사용하세요. 삭제 확인, 결제 승인, 중요 설정 변경 등이 적합합니다.",
            },
            {
              type: "dont",
              description: "모달 안에 또 다른 모달을 중첩하지 마세요. 사용자가 맥락을 잃고 혼란스러워집니다. 복잡한 흐름은 페이지 전환으로 처리하세요.",
            },
            {
              type: "do",
              description: "모달의 Footer에는 명확한 액션 버튼을 배치하세요. 주요 액션(확인)은 우측에, 보조 액션(취소)은 좌측에 놓습니다.",
            },
            {
              type: "caution",
              description: "긴 스크롤이 필요한 콘텐츠는 모달 대신 새 페이지나 Drawer를 고려하세요. 모달 내부 스크롤은 사용성을 저하시킵니다.",
            },
          ]}
        />
      </Section>

      {/* ── Usage Notes ── */}
      <Section title="사용 시 참고사항">
        <div className="flex flex-col gap-3">
          <UsageNote type="info">
            Modal은 React Portal을 사용하여 DOM 트리 최상위에 렌더링됩니다.
            부모 요소의 <code className="text-xs bg-gray-100 px-1 rounded">overflow: hidden</code>이나
            <code className="text-xs bg-gray-100 px-1 rounded">z-index</code>에 영향을 받지 않습니다.
          </UsageNote>
          <UsageNote type="tip">
            모달이 열릴 때 <code className="text-xs bg-gray-100 px-1 rounded">body</code>의 스크롤이 자동으로 잠깁니다.
            닫히면 원래 상태로 복원됩니다.
          </UsageNote>
          <UsageNote type="warning">
            <code className="text-xs bg-gray-100 px-1 rounded">dismissible=false</code>로 설정하면 반드시 모달 내부에 명시적인 닫기 수단(버튼)을 제공하세요.
            그렇지 않으면 사용자가 모달을 벗어날 수 없습니다.
          </UsageNote>
        </div>
      </Section>

      {/* ── Accessibility ── */}
      <Section title="접근성" description="Modal은 WAI-ARIA Dialog 패턴을 준수합니다.">
        <AccessibilityNote
          items={[
            "role='dialog'와 aria-modal='true'가 자동으로 적용되어 스크린 리더가 모달 컨텍스트를 인식합니다.",
            "Modal.Header의 제목이 aria-labelledby로 모달과 연결되어 스크린 리더가 모달의 목적을 안내합니다.",
            "모달이 열리면 첫 번째 포커스 가능한 요소로 자동 포커스됩니다.",
            "Focus trap이 내장되어 Tab/Shift+Tab 키가 모달 내부에서만 순환합니다.",
            "Escape 키로 언제든 모달을 닫을 수 있습니다.",
            "모달이 닫히면 스크롤 잠금이 해제되고 body 스크롤이 복원됩니다.",
          ]}
        />
      </Section>

      {/* ── Code Example ── */}
      <Section title="코드 예시" description="Modal을 Header, Body, Footer로 구성하는 기본 패턴입니다.">
        <CodeExample
          code={`import { useState } from "react";
import { Modal } from "@/ds/composites/Modal";
import { Button } from "@/ds/primitives/Button";

function DeleteConfirmModal() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // 삭제 로직 실행
    setOpen(false);
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        삭제
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} size="sm">
        <Modal.Header onClose={() => setOpen(false)}>
          항목 삭제
        </Modal.Header>
        <div className="p-5">
          <p className="text-sm text-muted">
            이 항목을 삭제하시겠습니까?
            삭제된 데이터는 복구할 수 없습니다.
          </p>
        </div>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제하기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}`}
        />
      </Section>
    </ComponentPage>
  );
}
