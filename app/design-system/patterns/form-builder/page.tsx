"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FormBuilder } from "@/ds/patterns/FormBuilder";

export default function FormBuilderPage() {
  const [result, setResult] = useState<Record<string, string> | null>(null);

  return (
    <ComponentPage
      name="FormBuilder"
      description="선언적 폼 빌더. 필드 배열을 넘기면 자동으로 폼 레이아웃 + 유효성 검사를 생성합니다."
      importPath='import { FormBuilder } from "@/ds/patterns/FormBuilder"'
      props={[
        { name: "fields", type: "FormField[]", required: true, description: "폼 필드 배열" },
        { name: "onSubmit", type: "(values) => void", required: true, description: "제출 콜백" },
        { name: "columns", type: "1 | 2", default: "1", description: "컬럼 수" },
        { name: "submitLabel", type: "string", default: '"저장"', description: "제출 버튼 텍스트" },
      ]}
    >
      <Section title="2열 폼 데모">
        <Preview>
          <div className="max-w-lg">
            <FormBuilder
              fields={[
                {
                  name: "name",
                  label: "이름",
                  type: "text",
                  required: true,
                  placeholder: "홍길동",
                },
                {
                  name: "email",
                  label: "이메일",
                  type: "email",
                  required: true,
                  placeholder: "user@example.com",
                },
                {
                  name: "department",
                  label: "부서",
                  type: "select",
                  required: true,
                  options: [
                    { value: "dev", label: "개발팀" },
                    { value: "design", label: "디자인팀" },
                    { value: "pm", label: "기획팀" },
                  ],
                },
                { name: "bio", label: "자기소개", type: "textarea", placeholder: "간단한 소개" },
              ]}
              onSubmit={(values) => setResult(values)}
              columns={2}
              submitLabel="등록"
            />
            {result && (
              <pre className="mt-4 p-3 bg-success-light rounded-lg text-xs text-success font-mono">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
