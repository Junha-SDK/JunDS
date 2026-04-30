"use client";
import { useState, useEffect } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AnimatedCounter } from "@/ds/composites/AnimatedCounter";

export default function AnimatedCounterPage() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 12000 ? 0 : v + 3500)), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <ComponentPage
      name="AnimatedCounter"
      description="숫자가 부드럽게 증감하는 카운터. 통계 카드·KPI 표시에 적합합니다."
      importPath='import { AnimatedCounter } from "@/ds/composites/AnimatedCounter"'
      props={[
        { name: "value", type: "number", required: true, description: "목표 숫자" },
        { name: "duration", type: "number", default: "1500", description: "애니메이션 시간(ms)" },
        { name: "decimals", type: "number", default: "0", description: "소수점 자리수" },
        { name: "prefix", type: "string", description: "앞에 붙는 접두사 (예: '$')" },
        { name: "suffix", type: "string", description: "뒤에 붙는 접미사 (예: '%')" },
      ]}
    >
      <Section title="Default" description="2초마다 값이 바뀝니다.">
        <Preview>
          <div className="flex items-baseline gap-8">
            <div>
              <p className="text-xs text-muted mb-1">월간 활성 사용자</p>
              <AnimatedCounter value={value} className="text-3xl text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">전환율</p>
              <AnimatedCounter value={87.4} decimals={1} suffix="%" className="text-3xl text-success" />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">매출</p>
              <AnimatedCounter value={42500} prefix="$" className="text-3xl text-primary" />
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
