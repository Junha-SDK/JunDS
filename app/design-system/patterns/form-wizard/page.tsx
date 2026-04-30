"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FormWizard } from "@/ds/patterns/FormWizard";
import type { FormWizardStep } from "@/ds/patterns/FormWizard";

const steps: FormWizardStep[] = [
  {
    title: "계정 정보",
    description: "로그인에 사용할 정보를 입력하세요",
    content: (
      <div className="text-sm text-muted">
        이메일과 비밀번호 입력 필드가 들어갈 자리입니다.
      </div>
    ),
  },
  {
    title: "프로필",
    description: "다른 사용자에게 보일 정보입니다",
    content: (
      <div className="text-sm text-muted">
        닉네임과 자기소개 입력 필드가 들어갈 자리입니다.
      </div>
    ),
  },
  {
    title: "확인",
    description: "입력한 내용을 확인하세요",
    content: (
      <div className="text-sm text-muted">
        검토 화면. &quot;완료&quot;를 누르면 onComplete가 호출됩니다.
      </div>
    ),
  },
];

export default function FormWizardPage() {
  return (
    <ComponentPage
      name="FormWizard"
      description="여러 단계로 나뉜 폼을 안내하는 위저드 컴포넌트입니다. 상단 스테퍼와 이전/다음 버튼, 단계별 검증을 포함합니다."
      importPath='import { FormWizard } from "@/ds/patterns/FormWizard"'
      props={[
        { name: "steps", type: "FormWizardStep[]", description: "단계 정의 배열. 각 단계는 title, description, content, validate를 가집니다." },
        { name: "onComplete", type: "(data: Record<string, unknown>) => void", description: "마지막 단계에서 '완료'를 눌렀을 때 호출됩니다." },
        { name: "className", type: "string", description: "추가 CSS 클래스." },
      ]}
    >
      <Section title="Basic" description="3단계 위저드. 스테퍼의 완료된 단계를 클릭하면 해당 단계로 돌아갈 수 있습니다.">
        <Preview>
          <div className="w-full max-w-lg">
            <FormWizard steps={steps} onComplete={(data) => console.log("완료", data)} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
