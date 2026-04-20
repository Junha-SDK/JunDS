"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { StarRating } from "@/ds/primitives/StarRating";

export default function StarRatingPage() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(4);
  return (
    <ComponentPage
      name="StarRating"
      description="별 아이콘을 사용한 평점 입력 및 표시 컴포넌트입니다."
      importPath='import { StarRating } from "@/ds/primitives/StarRating"'
      props={[
        { name: "value", type: "number", description: "현재 별점 값" },
        { name: "onChange", type: "(value: number) => void", description: "값 변경 핸들러" },
        { name: "max", type: "number", default: "5", description: "최대 별 개수" },
        { name: "size", type: '"sm"|"md"|"lg"', default: '"md"', description: "크기" },
        { name: "readonly", type: "boolean", default: "false", description: "읽기 전용" },
      ]}
    >
      <Section title="Interactive Demo">
        <Preview>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Small (선택: {a}점)</p>
              <StarRating value={a} onChange={setA} size="sm" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Medium (선택: {b}점)</p>
              <StarRating value={b} onChange={setB} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Large (선택: {c}점)</p>
              <StarRating value={c} onChange={setC} size="lg" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">읽기 전용 (4점)</p>
              <StarRating value={4} readonly />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
