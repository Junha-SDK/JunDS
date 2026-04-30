"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Rating } from "@/ds/composites/Rating";

export default function RatingPage() {
  const [score, setScore] = useState(3);
  const [half, setHalf] = useState(3.5);

  return (
    <ComponentPage
      name="Rating"
      description="별점 입력/표시 컴포넌트. 반쪽 별, 읽기 전용, 사이즈 변형을 지원합니다."
      importPath='import { Rating } from "@/ds/composites/Rating"'
      props={[
        { name: "value", type: "number", description: "현재 점수" },
        { name: "onChange", type: "(value: number) => void", description: "점수 변경 핸들러" },
        { name: "max", type: "number", default: "5", description: "최대 별 개수" },
        { name: "half", type: "boolean", default: "false", description: "반쪽 별 허용" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "별 크기" },
        { name: "readOnly", type: "boolean", description: "읽기 전용" },
        { name: "disabled", type: "boolean", description: "비활성화" },
      ]}
    >
      <Section title="기본 + 사이즈">
        <Preview>
          <div className="flex flex-col gap-3 items-start">
            <Rating value={score} onChange={setScore} size="sm" />
            <Rating value={score} onChange={setScore} />
            <Rating value={score} onChange={setScore} size="lg" />
            <p className="text-xs text-muted">현재 점수: {score}</p>
          </div>
        </Preview>
      </Section>

      <Section title="반쪽 별">
        <Preview>
          <div className="flex items-center gap-3">
            <Rating value={half} onChange={setHalf} half size="lg" />
            <span className="text-sm tabular-nums">{half.toFixed(1)}</span>
          </div>
        </Preview>
      </Section>

      <Section title="읽기 전용 / 비활성화">
        <Preview>
          <div className="flex flex-col gap-2 items-start">
            <Rating value={4.5} half readOnly />
            <Rating value={2} disabled />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
