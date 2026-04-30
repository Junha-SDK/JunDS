"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Onboarding, type OnboardingStep } from "@/ds/composites/Onboarding";

const initialSteps: OnboardingStep[] = [
  { id: "profile", title: "프로필 작성", description: "이름과 사진을 등록하세요." },
  { id: "team", title: "팀 초대", description: "동료를 초대해 협업을 시작하세요." },
  { id: "project", title: "첫 프로젝트 생성", description: "새 프로젝트를 만들어보세요." },
  { id: "deploy", title: "배포 연결", description: "GitHub과 연결하고 배포하세요." },
];

export default function OnboardingPage() {
  const [steps, setSteps] = useState(initialSteps);

  const complete = (id: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, completed: true } : s)));

  return (
    <ComponentPage
      name="Onboarding"
      description="여러 단계의 온보딩 과업을 체크리스트와 진행률로 안내하는 컴포넌트입니다."
      importPath='import { Onboarding } from "@/ds/composites/Onboarding"'
      props={[
        { name: "steps", type: "OnboardingStep[]", description: "{ id, title, description?, completed? } 목록" },
        { name: "onComplete", type: "(stepId: string) => void", description: "단계 클릭 시 호출" },
        { name: "onFinish", type: "() => void", description: "전체 완료 시 호출 (완료 버튼 표시)" },
        { name: "title", type: "string", default: '"시작하기"', description: "헤더 제목" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-md">
            <Onboarding steps={steps} onComplete={complete} onFinish={() => setSteps(initialSteps)} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
