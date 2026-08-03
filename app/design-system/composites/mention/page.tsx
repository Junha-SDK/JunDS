"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Mention } from "@/ds/composites/Mention";

const sampleUsers = [
  { key: "1", label: "김준하", description: "프론트엔드 개발자" },
  { key: "2", label: "이수진", description: "디자이너" },
  { key: "3", label: "박민수", description: "백엔드 개발자" },
  { key: "4", label: "최지윤", description: "프로젝트 매니저" },
  { key: "5", label: "정하늘", description: "QA 엔지니어" },
];

export default function MentionPage() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");

  return (
    <ComponentPage
      name="Mention"
      description="텍스트 입력 중 @멘션으로 사용자를 태그할 수 있는 컴포넌트입니다."
      importPath='import { Mention } from "@/ds/composites/Mention"'
      props={[
        { name: "value", type: "string", required: true, description: "입력 값" },
        {
          name: "onChange",
          type: "(value: string) => void",
          required: true,
          description: "값 변경 콜백",
        },
        { name: "users", type: "MentionUser[]", required: true, description: "사용자 목록" },
        { name: "trigger", type: "string", default: '"@"', description: "트리거 문자" },
        { name: "placeholder", type: "string", description: "플레이스홀더" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화 상태" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="max-w-md">
            <Mention
              value={text1}
              onChange={setText1}
              users={sampleUsers}
              placeholder="@를 입력하여 멘션하세요..."
            />
            <p className="mt-3 text-xs text-muted">팁: @ 입력 후 이름을 타이핑하세요</p>
          </div>
        </Preview>
      </Section>

      <Section title="커스텀 트리거">
        <Preview>
          <div className="max-w-md">
            <Mention
              value={text2}
              onChange={setText2}
              users={sampleUsers}
              trigger="#"
              placeholder="#으로 태그하세요..."
            />
          </div>
        </Preview>
      </Section>

      <Section title="비활성화">
        <Preview>
          <div className="max-w-md">
            <Mention
              value="이미 작성된 내용입니다."
              onChange={() => {}}
              users={sampleUsers}
              disabled
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
