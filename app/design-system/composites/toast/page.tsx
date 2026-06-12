"use client";
import {
  ComponentPage,
  Section,
  Guidelines,
  Anatomy,
  UsageNote,
  AccessibilityNote,
  CodeExample,
  VariantGrid,
  VariantItem,
  DecisionMatrix,
} from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DsToastProvider, useDsToast } from "@/ds/composites/Toast";
import { Button } from "@/ds/primitives/Button";

/* ── Demo Components ── */

function BasicToastDemo() {
  const { success, error, warning, info } = useDsToast();
  return (
    <div className="flex gap-3 flex-wrap">
      <Button variant="secondary" onClick={() => success("저장되었습니다!")}>Success</Button>
      <Button variant="secondary" onClick={() => error("오류가 발생했습니다.")}>Error</Button>
      <Button variant="secondary" onClick={() => warning("주의가 필요합니다.")}>Warning</Button>
      <Button variant="secondary" onClick={() => info("참고 알림입니다.")}>Info</Button>
    </div>
  );
}

function ActionToastDemo() {
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

function DurationDemo() {
  const { info } = useDsToast();
  return (
    <div className="flex gap-3 flex-wrap">
      <Button variant="secondary" onClick={() => info("2초 후 사라집니다.", { duration: 2000 })}>
        2초
      </Button>
      <Button variant="secondary" onClick={() => info("5초 후 사라집니다.", { duration: 5000 })}>
        5초
      </Button>
      <Button variant="secondary" onClick={() => info("10초 후 사라집니다.", { duration: 10000 })}>
        10초
      </Button>
    </div>
  );
}

/* ── Page ── */

export default function ToastPage() {
  return (
    <DsToastProvider position="bottom-right">
      <ComponentPage
        name="Toast"
        description="사용자에게 일시적인 피드백 메시지를 전달하는 비침습적 알림 컴포넌트입니다. DsToastProvider로 감싸고 useDsToast 훅으로 프로그래밍 방식으로 토스트를 트리거합니다."
        importPath='import { DsToastProvider, useDsToast } from "@/ds/composites/Toast"'
        status="stable"
        version="1.2.0"
        props={[
          { name: "position", type: '"top-right" | "top-center" | "bottom-right" | "bottom-center"', default: '"bottom-right"', description: "토스트가 나타나는 화면 위치" },
          { name: "maxToasts", type: "number", default: "5", description: "동시에 표시 가능한 최대 토스트 수" },
        ]}
        related={[
          { name: "Alert", href: "/design-system/composites/alert" },
          { name: "Notification", href: "/design-system/composites/notification" },
          { name: "Banner", href: "/design-system/composites/banner" },
        ]}
      >
        {/* ── 개요 ── */}
        <Section title="개요" description="버튼을 클릭하여 각 유형의 토스트를 확인해보세요. 토스트는 일정 시간 후 자동으로 사라집니다.">
          <Preview
            sourceCode={`// 1. 앱 루트에 Provider 설정
<DsToastProvider position="bottom-right">
  <App />
</DsToastProvider>

// 2. 컴포넌트에서 훅 사용
function MyComponent() {
  const { success, error, warning, info } = useDsToast();
  return (
    <Button onClick={() => success("저장되었습니다!")}>저장</Button>
  );
}`}
          >
            <BasicToastDemo />
          </Preview>
        </Section>

        {/* ── 구조 ── */}
        <Section title="구조 (Anatomy)">
          <Anatomy
            items={[
              { label: "DsToastProvider", description: "토스트 시스템의 컨텍스트를 제공하는 최상위 래퍼입니다. 앱 루트에 한 번만 배치합니다." },
              { label: "Toast Container", description: "토스트 목록을 렌더링하는 영역입니다. position에 따라 화면 모서리에 고정됩니다." },
              { label: "Toast Item", description: "개별 토스트 메시지입니다. 아이콘, 메시지, 액션 버튼, 닫기 버튼을 포함합니다." },
              { label: "useDsToast Hook", description: "success, error, warning, info, custom, confirm 메서드를 제공하는 훅입니다." },
            ]}
          />
        </Section>

        {/* ── 유형 ── */}
        <Section title="유형 (Types)" description="4가지 기본 유형의 토스트를 지원합니다. 메시지의 성격에 맞는 유형을 선택하세요.">
          <VariantGrid cols={2}>
            <VariantItem
              label="Success"
              description="작업이 성공적으로 완료되었을 때"
              sourceCode={`success("저장되었습니다!");`}
            >
              <div className="text-center">
                <span className="text-2xl mb-1 block">✅</span>
                <p className="text-xs text-muted">저장, 생성, 업데이트 완료 등</p>
              </div>
            </VariantItem>
            <VariantItem
              label="Error"
              description="오류가 발생하여 작업이 실패했을 때"
              sourceCode={`error("저장에 실패했습니다.");`}
            >
              <div className="text-center">
                <span className="text-2xl mb-1 block">❌</span>
                <p className="text-xs text-muted">네트워크 에러, 유효성 실패 등</p>
              </div>
            </VariantItem>
            <VariantItem
              label="Warning"
              description="주의가 필요한 상황을 알릴 때"
              sourceCode={`warning("세션이 곧 만료됩니다.");`}
            >
              <div className="text-center">
                <span className="text-2xl mb-1 block">⚠️</span>
                <p className="text-xs text-muted">세션 만료 경고, 용량 부족 등</p>
              </div>
            </VariantItem>
            <VariantItem
              label="Info"
              description="참고할 만한 일반 정보를 전달할 때"
              sourceCode={`info("상태가 변경되었습니다.");`}
            >
              <div className="text-center">
                <span className="text-2xl mb-1 block">ℹ️</span>
                <p className="text-xs text-muted">상태 변경, 안내 메시지 등</p>
              </div>
            </VariantItem>
          </VariantGrid>
        </Section>

        {/* ── Decision Matrix ── */}
        <Section title="비슷한 알림 컴포넌트 비교" description="알림에는 영속성·강조·위치에 따라 여러 컴포넌트가 있습니다. 의도에 맞춰 선택하세요.">
          <DecisionMatrix
            rows={[
              {
                name: "Toast",
                href: "/design-system/composites/toast",
                signature: "일시적 피드백",
                useWhen: "작업 완료·실패·실행취소처럼 잠깐 보이고 사라져야 하는 짧은 피드백.",
                avoidWhen: "사용자가 반드시 읽어야 하는 영속 메시지 — Banner/Alert.",
              },
              {
                name: "Alert",
                href: "/design-system/composites/alert",
                signature: "인라인 영속 알림",
                useWhen: "폼 위·페이지 안에 영속적으로 노출되는 상태 메시지(에러·정보·성공).",
                avoidWhen: "잠깐 보일 메시지 — Toast.",
              },
              {
                name: "Banner",
                href: "/design-system/composites/banner",
                signature: "전역 공지",
                useWhen: "헤더 위 / 페이지 상단에 걸쳐 모든 사용자가 봐야 하는 공지·점검 안내.",
                avoidWhen: "사용자별 개인 메시지 — Toast/Notification.",
              },
              {
                name: "Snackbar",
                href: "/design-system/composites/snackbar",
                signature: "Material식 토스트",
                useWhen: "모바일에서 하단 중앙에 짧게 노출되는 가벼운 피드백 (Material Design 스타일).",
                avoidWhen: "데스크탑 — Toast로 일관.",
              },
              {
                name: "Notification",
                href: "/design-system/composites/notification",
                signature: "리스트형 알림",
                useWhen: "알림 센터에 누적되는 사용자별 메시지 (메시지·멘션·시스템 이벤트).",
                avoidWhen: "한 번 보고 사라질 피드백 — Toast.",
              },
              {
                name: "Callout",
                href: "/design-system/composites/callout",
                signature: "문서 강조 박스",
                useWhen: "문서·설정 페이지에서 팁·주의사항을 강조하는 컬러 박스.",
                avoidWhen: "동적인 시스템 알림 — Alert/Toast.",
              },
            ]}
          />
        </Section>

        {/* ── 위치 ── */}
        <Section title="위치 (Positions)" description="DsToastProvider의 position prop으로 토스트가 나타나는 위치를 지정합니다.">
          <Preview
            sourceCode={`<DsToastProvider position="bottom-right">{/* 또는 top-right · top-center · bottom-center */}
  {children}
</DsToastProvider>`}
          >
            <div className="relative w-full h-48 border border-border-light rounded-xl bg-gray-50/50">
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                <div className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-lg border border-primary/20">top-right</div>
              </div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1.5 bg-gray-100 text-muted text-[10px] font-semibold rounded-lg border border-border-light">top-center</div>
              </div>
              <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                <div className="px-3 py-1.5 bg-gray-100 text-muted text-[10px] font-semibold rounded-lg border border-border-light">bottom-right &#40;기본&#41;</div>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1.5 bg-gray-100 text-muted text-[10px] font-semibold rounded-lg border border-border-light">bottom-center</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted">화면 영역</span>
              </div>
            </div>
          </Preview>
          <UsageNote type="info">
            <code className="text-xs font-mono bg-gray-100 px-1 rounded">bottom-right</code>가 기본값이며, 대부분의 웹 앱에서 가장 자연스러운 위치입니다. 모바일에서는 <code className="text-xs font-mono bg-gray-100 px-1 rounded">top-center</code>나 <code className="text-xs font-mono bg-gray-100 px-1 rounded">bottom-center</code>가 더 적합할 수 있습니다.
          </UsageNote>
        </Section>

        {/* ── 액션 버튼 ── */}
        <Section title="액션 버튼" description="토스트에 되돌리기, 이동하기 등의 인라인 액션을 추가할 수 있습니다.">
          <Preview>
            <ActionToastDemo />
          </Preview>
          <CodeExample
            code={`const { success } = useDsToast();

success("파일이 삭제되었습니다.", {
  action: {
    label: "되돌리기",
    onClick: () => restoreFile(),
  },
});

// duration 커스터마이징
warning("업데이트가 필요합니다.", {
  action: { label: "업데이트", onClick: () => update() },
  duration: 6000,  // 6초 동안 표시
});`}
          />
        </Section>

        {/* ── 자동 사라짐 시간 ── */}
        <Section title="자동 사라짐 시간 (Duration)" description="각 토스트의 표시 시간을 개별적으로 설정할 수 있습니다.">
          <Preview>
            <DurationDemo />
          </Preview>
          <UsageNote type="warning">
            에러 메시지는 사용자가 충분히 읽을 수 있도록 기본보다 긴 duration을 설정하거나, 수동 닫기만 허용하는 것을 권장합니다.
          </UsageNote>
        </Section>

        {/* ── 커스텀 콘텐츠 ── */}
        <Section title="커스텀 콘텐츠" description="custom 메서드를 사용하면 자유롭게 토스트 내부를 구성할 수 있습니다. confirm 메서드는 확인/취소 액션이 있는 토스트를 생성합니다.">
          <Preview>
            <CustomContentDemo />
          </Preview>
          <CodeExample
            code={`const { custom, confirm } = useDsToast();

// 커스텀 콘텐츠
custom(
  <div className="flex items-center gap-3">
    <Avatar src="/user.jpg" />
    <div>
      <p className="font-medium">새 메시지</p>
      <p className="text-xs text-muted">김준하님이 메시지를 보냈습니다.</p>
    </div>
  </div>
);

// 확인 토스트
confirm(
  "정말 삭제하시겠습니까?",
  () => handleDelete(),   // 확인 콜백
  () => handleCancel(),   // 취소 콜백
);`}
          />
        </Section>

        {/* ── 가이드라인 ── */}
        <Section title="가이드라인">
          <Guidelines
            items={[
              {
                type: "do",
                description: "짧고 명확한 메시지를 사용하세요. 사용자가 1~2초 안에 이해할 수 있어야 합니다. (예: '저장되었습니다', '링크가 복사되었습니다')",
              },
              {
                type: "dont",
                description: "사용자의 즉각적인 의사결정이 필요한 내용은 토스트가 아니라 모달(Dialog)을 사용하세요.",
              },
              {
                type: "do",
                description: "되돌릴 수 있는 파괴적 작업(삭제 등)에는 '되돌리기' 액션 버튼을 함께 제공하세요.",
              },
              {
                type: "dont",
                description: "동일한 메시지의 토스트를 연속으로 중복 표시하지 마세요. 사용자 경험을 해칩니다.",
              },
              {
                type: "caution",
                description: "에러 토스트는 자동 사라짐 시간을 충분히 길게 설정하거나, 사용자가 직접 닫을 수 있게 하세요.",
              },
              {
                type: "do",
                description: "메시지 유형에 맞는 토스트 함수를 사용하세요. 성공이면 success(), 에러면 error()를 사용합니다.",
              },
            ]}
          />
        </Section>

        {/* ── 접근성 ── */}
        <Section title="접근성">
          <AccessibilityNote
            items={[
              "토스트 컨테이너에 aria-live=\"polite\" 속성이 적용되어 스크린 리더가 새로운 토스트를 자동으로 읽습니다.",
              "에러 토스트에는 role=\"alert\"가 사용되어 즉시 공지됩니다.",
              "각 토스트에는 닫기 버튼이 포함되어 있으며, 키보드로 접근 가능합니다.",
              "자동 사라짐은 사용자가 토스트 위에 마우스를 올리면 일시 중지됩니다.",
              "토스트가 나타나도 현재 포커스 위치가 변경되지 않아 키보드 사용자의 작업 흐름을 방해하지 않습니다.",
              "충분한 색상 대비와 아이콘을 사용하여 색각 이상 사용자도 유형을 구분할 수 있습니다.",
            ]}
          />
        </Section>

        {/* ── 사용 예시 코드 ── */}
        <Section title="전체 사용 예시">
          <CodeExample
            code={`// app/layout.tsx — Provider 설정
import { DsToastProvider } from "@/ds/composites/Toast";

export default function RootLayout({ children }) {
  return (
    <DsToastProvider position="bottom-right" maxToasts={5}>
      {children}
    </DsToastProvider>
  );
}

// components/SaveButton.tsx — 훅 사용
import { useDsToast } from "@/ds/composites/Toast";

function SaveButton() {
  const { success, error } = useDsToast();

  const handleSave = async () => {
    try {
      await saveData();
      success("변경 사항이 저장되었습니다.");
    } catch (e) {
      error("저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return <Button onClick={handleSave}>저장</Button>;
}`}
          />
        </Section>
      </ComponentPage>
    </DsToastProvider>
  );
}
