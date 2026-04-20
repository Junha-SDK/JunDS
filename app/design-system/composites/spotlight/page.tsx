"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Spotlight } from "@/ds/composites/Spotlight";
import { Button } from "@/ds/primitives/Button";

export default function SpotlightPage() {
  const [active, setActive] = useState(false);

  return (
    <ComponentPage
      name="Spotlight"
      description="특정 요소를 강조하는 어두운 오버레이와 투명 컷아웃을 제공하는 하이라이트 컴포넌트입니다."
      importPath='import { Spotlight } from "@/ds/composites/Spotlight"'
      props={[
        { name: "target", type: "string", required: true, description: "CSS 셀렉터 (강조할 대상)" },
        { name: "active", type: "boolean", required: true, description: "활성화 여부" },
        { name: "padding", type: "number", default: "8", description: "컷아웃 패딩 (px)" },
        { name: "children", type: "ReactNode", description: "하이라이트 아래 표시할 콘텐츠" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted">
              아래 버튼을 클릭하면 대상 요소에 스포트라이트 효과가 적용됩니다.
            </p>
            <Button variant="primary" onClick={() => setActive(true)}>
              스포트라이트 켜기
            </Button>
            <div
              id="spotlight-demo-target"
              className="p-4 border border-border rounded-lg bg-gray-50"
            >
              <p className="text-sm font-medium">강조 대상 영역</p>
              <p className="text-xs text-muted mt-1">이 영역이 스포트라이트로 강조됩니다.</p>
            </div>
          </div>
          <Spotlight target="#spotlight-demo-target" active={active}>
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <p className="text-sm font-medium mb-2">이 영역이 강조되었습니다!</p>
              <Button size="sm" variant="primary" onClick={() => setActive(false)}>
                닫기
              </Button>
            </div>
          </Spotlight>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
