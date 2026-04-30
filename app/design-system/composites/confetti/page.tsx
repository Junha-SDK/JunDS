"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Confetti } from "@/ds/composites/Confetti";
import { Button } from "@/ds/primitives/Button";

export default function ConfettiPage() {
  const [active, setActive] = useState(false);

  const trigger = () => {
    setActive(false);
    setTimeout(() => setActive(true), 50);
  };

  return (
    <ComponentPage
      name="Confetti"
      description="축하 이벤트 시 화면에 색종이 입자가 떨어지는 효과. 결제 완료, 목표 달성 등의 순간에 사용합니다."
      importPath='import { Confetti } from "@/ds/composites/Confetti"'
      props={[
        { name: "active", type: "boolean", description: "true가 되면 입자가 생성되어 떨어집니다." },
        { name: "count", type: "number", default: "50", description: "생성할 입자 개수" },
        { name: "duration", type: "number", default: "3000", description: "낙하 애니메이션 지속 시간(ms)" },
        { name: "className", type: "string", description: "컨테이너에 추가할 클래스" },
      ]}
    >
      <Section title="Trigger">
        <Preview>
          <div className="flex flex-col items-center gap-3">
            <Button onClick={trigger}>축하 효과 실행</Button>
            <p className="text-xs text-muted">버튼을 눌러 효과를 확인하세요.</p>
            <Confetti active={active} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
