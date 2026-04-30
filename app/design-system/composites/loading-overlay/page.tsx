"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LoadingOverlay } from "@/ds/composites/LoadingOverlay";
import { Button } from "@/ds/primitives/Button";

export default function LoadingOverlayPage() {
  const [active, setActive] = useState(false);

  const trigger = () => {
    setActive(true);
    setTimeout(() => setActive(false), 2000);
  };

  return (
    <ComponentPage
      name="LoadingOverlay"
      description="감싼 영역 위에 로딩 스피너 오버레이를 띄워 진행 중 상태를 표시합니다."
      importPath='import { LoadingOverlay } from "@/ds/composites/LoadingOverlay"'
      props={[
        { name: "active", type: "boolean", description: "오버레이 활성 여부" },
        { name: "label", type: "string", default: '"로딩 중..."', description: "로딩 텍스트" },
        { name: "blur", type: "boolean", description: "배경 블러 효과 적용" },
        { name: "children", type: "ReactNode", description: "감쌀 콘텐츠" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex flex-col gap-3 items-start">
            <Button onClick={trigger}>2초 동안 로딩</Button>
            <LoadingOverlay active={active}>
              <div className="w-72 p-6 rounded-xl border border-border bg-white">
                <p className="text-sm font-semibold mb-2">사용자 정보</p>
                <p className="text-xs text-muted">이메일: junha@example.com</p>
                <p className="text-xs text-muted">가입일: 2024-01-15</p>
              </div>
            </LoadingOverlay>
          </div>
        </Preview>
      </Section>

      <Section title="블러 배경">
        <Preview>
          <LoadingOverlay active blur label="저장 중...">
            <div className="w-72 p-6 rounded-xl border border-border bg-white">
              <p className="text-sm">블러 효과가 적용된 오버레이입니다.</p>
            </div>
          </LoadingOverlay>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
