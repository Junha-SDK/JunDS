"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Typewriter } from "@/ds/composites/Typewriter";

export default function TypewriterPage() {
  return (
    <ComponentPage
      name="Typewriter"
      description="문자열을 한 글자씩 타이핑하고 지우며 순회하는 텍스트 애니메이션. 히어로 카피나 강조 문구에 적합합니다."
      importPath='import { Typewriter } from "@/ds/composites/Typewriter"'
      props={[
        { name: "texts", type: "string[]", required: true, description: "순회할 문자열 목록" },
        { name: "speed", type: "number", default: "80", description: "타이핑 속도(ms / 문자)" },
        { name: "deleteSpeed", type: "number", default: "40", description: "지우기 속도(ms / 문자)" },
        { name: "delay", type: "number", default: "2000", description: "한 문장 완성 후 대기(ms)" },
        { name: "loop", type: "boolean", default: "true", description: "반복 여부" },
        { name: "cursor", type: "boolean", default: "true", description: "커서 표시 여부" },
        { name: "cursorChar", type: "string", default: '"|"', description: "커서 문자" },
        { name: "onComplete", type: "() => void", description: "loop=false 일 때 완료 시 호출" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="text-2xl font-semibold">
            <Typewriter texts={["디자인 시스템", "AI 친화 컴포넌트", "JunDS"]} />
          </div>
        </Preview>
      </Section>

      <Section title="속도 / 커서 변형">
        <Preview>
          <div className="flex flex-col gap-4 text-lg">
            <div>
              빠른 속도 ·{" "}
              <Typewriter texts={["fast", "rapid", "instant"]} speed={40} deleteSpeed={20} delay={800} />
            </div>
            <div>
              커스텀 커서 ·{" "}
              <Typewriter texts={["Hello", "World"]} cursorChar="_" />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
