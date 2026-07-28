"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FocusGuard } from "@/ds/primitives/FocusGuard";
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";

export default function FocusGuardPage() {
  const [active, setActive] = useState(false);
  return (
    <ComponentPage
      name="FocusGuard"
      description="자식 트리 내부에서만 Tab 포커스가 순환하도록 가두는 포커스 트랩입니다. 모달, 시트, 다이얼로그 등에 사용합니다."
      importPath='import { FocusGuard } from "@/ds/primitives/FocusGuard"'
      props={[
        { name: "children", type: "ReactNode", description: "포커스를 가둘 자식 트리." },
        {
          name: "active",
          type: "boolean",
          default: "true",
          description: "포커스 트랩 활성화 여부.",
        },
        {
          name: "autoFocus",
          type: "boolean",
          default: "true",
          description: "마운트 시 첫 번째 포커스 가능한 요소에 자동 포커스.",
        },
        {
          name: "returnFocus",
          type: "boolean",
          default: "true",
          description: "언마운트 시 이전에 포커스되어 있던 요소로 포커스 복귀.",
        },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
      ]}
    >
      <Section title="Basic" description="active를 켜면 Tab이 박스 내부에서만 순환합니다.">
        <Preview>
          <div className="flex flex-col gap-3 max-w-md">
            <Button size="sm" onClick={() => setActive((a) => !a)}>
              {active ? "트랩 해제" : "트랩 활성화"}
            </Button>
            <FocusGuard
              active={active}
              className="p-4 border border-primary/30 rounded-lg bg-primary-light flex flex-col gap-2"
            >
              <Input placeholder="첫 번째 입력" />
              <Input placeholder="두 번째 입력" />
              <Button size="sm" variant="secondary">
                버튼
              </Button>
            </FocusGuard>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
