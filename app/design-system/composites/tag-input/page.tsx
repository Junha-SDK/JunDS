"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TagInput } from "@/ds/composites/TagInput";

export default function TagInputPage() {
  const [tags, setTags] = useState<string[]>(["React", "Next.js"]);
  const [skills, setSkills] = useState<string[]>(["TypeScript"]);

  return (
    <ComponentPage
      name="TagInput"
      description="Enter로 태그를 추가하고 Backspace로 삭제할 수 있는 다중 태그 입력 컴포넌트입니다."
      importPath='import { TagInput } from "@/ds/composites/TagInput"'
      props={[
        { name: "value", type: "string[]", required: true, description: "현재 태그 목록" },
        { name: "onChange", type: "(tags: string[]) => void", required: true, description: "태그 변경 핸들러" },
        { name: "placeholder", type: "string", default: '"태그 입력 후 Enter"', description: "플레이스홀더" },
        { name: "maxTags", type: "number", description: "최대 태그 개수" },
        { name: "disabled", type: "boolean", description: "비활성화 여부" },
        { name: "error", type: "boolean", description: "오류 상태 스타일" },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "크기" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="w-full max-w-md">
            <TagInput value={tags} onChange={setTags} />
          </div>
        </Preview>
      </Section>

      <Section title="크기 / 최대 개수">
        <Preview>
          <div className="flex flex-col gap-3 w-full max-w-md">
            <TagInput size="sm" value={skills} onChange={setSkills} placeholder="스킬을 입력하세요 (최대 5개)" maxTags={5} />
            <TagInput size="md" value={skills} onChange={setSkills} placeholder="medium" />
            <TagInput size="lg" value={skills} onChange={setSkills} placeholder="large" />
          </div>
        </Preview>
      </Section>

      <Section title="오류 / 비활성화">
        <Preview>
          <div className="flex flex-col gap-3 w-full max-w-md">
            <TagInput value={tags} onChange={setTags} error />
            <TagInput value={tags} onChange={setTags} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
