"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SpotlightCard } from "@/ds/composites/SpotlightCard";

export default function SpotlightCardPage() {
  return (
    <ComponentPage
      name="SpotlightCard"
      description="마우스 위치를 따라 부드러운 스포트라이트가 비치는 카드. 호버 시 시각적 피드백이 강조됩니다."
      importPath='import { SpotlightCard } from "@/ds/composites/SpotlightCard"'
      props={[
        { name: "children", type: "ReactNode", required: true, description: "카드 내부 콘텐츠" },
        {
          name: "spotlightColor",
          type: "string",
          description: "스포트라이트 색상(기본: 프라이머리 톤)",
        },
        {
          name: "spotlightSize",
          type: "number",
          default: "300",
          description: "스포트라이트 반지름(px)",
        },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="w-full max-w-sm">
            <SpotlightCard>
              <h3 className="text-base font-semibold mb-1">호버해 보세요</h3>
              <p className="text-sm text-muted">마우스 위치를 따라 빛이 부드럽게 따라옵니다.</p>
            </SpotlightCard>
          </div>
        </Preview>
      </Section>

      <Section title="커스텀 색상">
        <Preview>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <SpotlightCard spotlightColor="rgba(34, 197, 94, 0.15)">
              <h3 className="text-base font-semibold mb-1">Success</h3>
              <p className="text-sm text-muted">녹색 톤의 스포트라이트.</p>
            </SpotlightCard>
            <SpotlightCard spotlightColor="rgba(244, 114, 182, 0.18)" spotlightSize={420}>
              <h3 className="text-base font-semibold mb-1">크고 분홍빛</h3>
              <p className="text-sm text-muted">더 큰 반지름의 스포트라이트.</p>
            </SpotlightCard>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
