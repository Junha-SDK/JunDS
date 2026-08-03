"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { LoginForm } from "@/ds/patterns/LoginForm";
import { Button } from "@/ds/primitives/Button";
import { Tabs } from "@/ds/composites/Tabs";

export default function LoginFormPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <ComponentPage
      name="LoginForm"
      description="보안 로그인/회원가입 폼. 비밀번호 강도, 자동완성, 소셜 로그인, 보안 표시를 기본 제공합니다."
      importPath='import { LoginForm } from "@/ds/patterns/LoginForm"'
      props={[
        { name: "onSubmit", type: "(data) => void", required: true, description: "제출 콜백" },
        {
          name: "showPasswordStrength",
          type: "boolean",
          description: "비밀번호 강도 표시 (회원가입용)",
        },
        {
          name: "showConfirmPassword",
          type: "boolean",
          description: "비밀번호 확인 필드 (회원가입용)",
        },
        { name: "socialButtons", type: "ReactNode", description: "소셜 로그인 버튼" },
        { name: "error", type: "string", description: "에러 메시지" },
        { name: "forgotHref", type: "string", description: "비밀번호 찾기 링크" },
        { name: "signupHref", type: "string", description: "회원가입 링크" },
      ]}
    >
      <Section title="로그인 / 회원가입 전환">
        <Preview>
          <div className="flex justify-center mb-4">
            <Tabs
              tabs={[
                { value: "login", label: "로그인" },
                { value: "signup", label: "회원가입" },
              ]}
              value={mode}
              onChange={setMode}
              variant="segment"
              size="sm"
            />
          </div>

          {mode === "login" ? (
            <LoginForm
              onSubmit={(data) => console.log("Login:", data)}
              title="로그인"
              forgotHref="#"
              signupHref="#"
              logo={
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="5" height="5" rx="1" fill="white" />
                    <rect x="12" y="3" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                    <rect x="3" y="12" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                    <rect x="12" y="12" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                  </svg>
                </div>
              }
              socialButtons={
                <Button variant="outline" fullWidth>
                  Google로 로그인
                </Button>
              }
            />
          ) : (
            <LoginForm
              onSubmit={(data) => console.log("Signup:", data)}
              title="회원가입"
              subtitle="새 계정을 만드세요"
              showPasswordStrength
              showConfirmPassword
              logo={
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="5" height="5" rx="1" fill="white" />
                    <rect x="12" y="3" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                    <rect x="3" y="12" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                    <rect x="12" y="12" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                  </svg>
                </div>
              }
            />
          )}
        </Preview>
      </Section>
    </ComponentPage>
  );
}
