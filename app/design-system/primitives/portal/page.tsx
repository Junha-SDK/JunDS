"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Portal } from "@/ds/primitives/Portal";
import { Button } from "@/ds/primitives/Button";

export default function PortalPage() {
  const [open, setOpen] = useState(false);
  return (
    <ComponentPage
      name="Portal"
      description="자식 노드를 React 트리 외부 (기본: document.body)로 렌더링하는 포털 래퍼입니다. 모달, 토스트, 드롭다운 등 z-index 컨텍스트를 분리해야 할 때 사용합니다."
      importPath='import { Portal } from "@/ds/primitives/Portal"'
      props={[
        { name: "children", type: "ReactNode", description: "포털 대상에 렌더링할 자식." },
        {
          name: "container",
          type: "Element",
          default: "document.body",
          description: "마운트 대상 DOM 노드.",
        },
      ]}
    >
      <Section title="Basic" description="버튼을 누르면 body 끝에 포털 콘텐츠가 추가됩니다.">
        <Preview>
          <div className="flex flex-col gap-3">
            <Button size="sm" onClick={() => setOpen((o) => !o)}>
              {open ? "포털 닫기" : "포털 열기"}
            </Button>
            {open && (
              <Portal>
                <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-foreground text-background rounded-lg shadow-lg text-sm">
                  body 끝에 렌더링된 포털 콘텐츠입니다.
                </div>
              </Portal>
            )}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
