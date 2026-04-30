"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ErrorBoundary } from "@/ds/primitives/ErrorBoundary";
import { Button } from "@/ds/primitives/Button";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("의도적으로 발생시킨 오류입니다");
  return <p className="text-sm text-muted">정상 동작 중입니다.</p>;
}

function DemoDefault() {
  const [boom, setBoom] = useState(false);
  return (
    <div className="flex flex-col gap-3 max-w-md">
      <ErrorBoundary key={boom ? "err" : "ok"}>
        <Bomb shouldThrow={boom} />
      </ErrorBoundary>
      <Button size="sm" variant="danger" onClick={() => setBoom(true)} disabled={boom}>오류 발생시키기</Button>
      {boom && <Button size="sm" variant="ghost" onClick={() => setBoom(false)}>리셋</Button>}
    </div>
  );
}

function DemoCustom() {
  const [boom, setBoom] = useState(false);
  return (
    <div className="flex flex-col gap-3 max-w-md">
      <ErrorBoundary
        key={boom ? "err" : "ok"}
        fallback={(error, reset) => (
          <div className="p-3 border border-warning/30 rounded-lg bg-warning-light text-sm">
            <strong>커스텀 fallback:</strong> {error.message}
            <button onClick={() => { setBoom(false); reset(); }} className="ml-2 underline">복구</button>
          </div>
        )}
      >
        <Bomb shouldThrow={boom} />
      </ErrorBoundary>
      <Button size="sm" variant="danger" onClick={() => setBoom(true)} disabled={boom}>오류 발생시키기</Button>
    </div>
  );
}

export default function ErrorBoundaryPage() {
  return (
    <ComponentPage
      name="ErrorBoundary"
      description="자식 트리에서 발생한 렌더링 오류를 잡아 fallback UI로 대체하는 React Error Boundary입니다. 함수형 fallback으로 reset 핸들러를 받아 복구할 수 있습니다."
      importPath='import { ErrorBoundary } from "@/ds/primitives/ErrorBoundary"'
      props={[
        { name: "children", type: "ReactNode", description: "오류를 감시할 자식 트리." },
        { name: "fallback", type: "ReactNode | (error, reset) => ReactNode", description: "오류 발생 시 표시할 UI. 함수면 Error 객체와 reset 콜백을 인자로 받습니다." },
        { name: "onError", type: "(error: Error, errorInfo: ErrorInfo) => void", description: "오류 발생 시 호출되는 콜백 (로깅용)." },
        { name: "className", type: "string", description: "기본 fallback에 적용되는 CSS 클래스." },
      ]}
    >
      <Section title="Default Fallback" description="fallback을 지정하지 않으면 기본 오류 UI가 표시됩니다.">
        <Preview>
          <DemoDefault />
        </Preview>
      </Section>
      <Section title="Custom Fallback" description="함수형 fallback으로 error와 reset을 받아 직접 UI를 구성합니다.">
        <Preview>
          <DemoCustom />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
