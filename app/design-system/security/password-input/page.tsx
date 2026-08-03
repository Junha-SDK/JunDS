"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { PasswordInput } from "@/ds/primitives/PasswordInput";

export default function PasswordInputPage() {
  const [pw, setPw] = useState("");
  return (
    <ComponentPage
      name="PasswordInput"
      description="보안 비밀번호 입력. 표시/숨김 토글, 실시간 강도 게이지, 규칙 체크리스트를 제공합니다."
      importPath='import { PasswordInput } from "@/ds/primitives/PasswordInput"'
      props={[
        {
          name: "showStrength",
          type: "boolean",
          description: "강도 게이지 표시 (취약/보통/양호/강력)",
        },
        {
          name: "showRules",
          type: "boolean",
          description: "규칙 체크리스트 표시 (8자, 대소문자, 숫자, 특수문자)",
        },
        { name: "rules", type: "PasswordRule[]", description: "커스텀 규칙 배열" },
        { name: "error", type: "boolean", description: "에러 상태" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="강도 게이지 + 규칙 체크리스트">
        <Preview>
          <div className="max-w-sm">
            <PasswordInput
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              showStrength
              showRules
            />
          </div>
        </Preview>
      </Section>

      <Section title="강도만 표시">
        <Preview>
          <div className="max-w-sm">
            <PasswordInput
              placeholder="비밀번호"
              showStrength
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
        </Preview>
      </Section>

      <Section title="기본 (토글만)">
        <Preview>
          <div className="flex flex-col gap-3 max-w-sm">
            <PasswordInput placeholder="기본 비밀번호 필드" />
            <PasswordInput placeholder="에러 상태" error />
            <PasswordInput placeholder="Large" size="lg" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
