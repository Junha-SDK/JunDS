"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Tour } from "@/ds/patterns/Tour";
import { Button } from "@/ds/primitives/Button";

export default function TourPage() {
  const [showTour, setShowTour] = useState(false);

  return (
    <ComponentPage
      name="Tour"
      description="단계별로 UI 요소를 하이라이트하며 사용자에게 온보딩 가이드를 제공하는 컴포넌트입니다."
      importPath='import { Tour } from "@/ds/patterns/Tour"'
      props={[
        { name: "steps", type: "TourStep[]", required: true, description: "투어 단계 목록" },
        { name: "open", type: "boolean", required: true, description: "투어 활성화 여부" },
        { name: "onClose", type: "() => void", required: true, description: "투어 종료 콜백" },
        { name: "current", type: "number", description: "현재 단계 (제어 모드)" },
        { name: "onStepChange", type: "(step: number) => void", description: "단계 변경 콜백" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="flex flex-col gap-6">
            <p className="text-sm text-muted">
              아래 버튼을 클릭하면 가이드 투어가 시작됩니다. 각 단계에서 대상 요소가
              하이라이트됩니다.
            </p>

            <Button id="tour-start-btn" variant="primary" onClick={() => setShowTour(true)}>
              투어 시작하기
            </Button>

            <div className="grid grid-cols-3 gap-4">
              <div id="tour-step-1" className="p-4 border border-border rounded-lg">
                <h4 className="text-sm font-medium">1단계: 프로젝트 생성</h4>
                <p className="text-xs text-muted mt-1">새 프로젝트를 만들어보세요.</p>
              </div>
              <div id="tour-step-2" className="p-4 border border-border rounded-lg">
                <h4 className="text-sm font-medium">2단계: 컴포넌트 추가</h4>
                <p className="text-xs text-muted mt-1">필요한 컴포넌트를 추가하세요.</p>
              </div>
              <div id="tour-step-3" className="p-4 border border-border rounded-lg">
                <h4 className="text-sm font-medium">3단계: 배포</h4>
                <p className="text-xs text-muted mt-1">프로젝트를 배포하세요.</p>
              </div>
            </div>
          </div>

          <Tour
            open={showTour}
            onClose={() => setShowTour(false)}
            steps={[
              {
                target: "#tour-start-btn",
                title: "투어 시작",
                description: "이 버튼으로 언제든 투어를 다시 시작할 수 있습니다.",
                placement: "bottom",
              },
              {
                target: "#tour-step-1",
                title: "프로젝트 생성",
                description: "먼저 새 프로젝트를 생성합니다. 프로젝트명과 설명을 입력하세요.",
                placement: "bottom",
              },
              {
                target: "#tour-step-2",
                title: "컴포넌트 추가",
                description: "프로젝트에 필요한 UI 컴포넌트를 추가합니다.",
                placement: "bottom",
              },
              {
                target: "#tour-step-3",
                title: "배포하기",
                description: "모든 준비가 완료되면 프로젝트를 배포합니다.",
                placement: "bottom",
              },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
