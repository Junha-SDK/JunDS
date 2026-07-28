"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Globe } from "@/ds/composites/Globe";

export default function GlobePage() {
  return (
    <ComponentPage
      name="Globe"
      description="자전하는 점-격자 지구본. 글로벌 서비스나 네트워크 시각화의 장식 요소로 사용합니다."
      importPath='import { Globe } from "@/ds/composites/Globe"'
      props={[
        { name: "size", type: "number", default: "300", description: "지구본 지름(px)" },
        {
          name: "color",
          type: "string",
          default: "var(--primary)",
          description: "외곽선/글로우 색상",
        },
        {
          name: "dotColor",
          type: "string",
          default: "var(--primary-light)",
          description: "격자 점 색상",
        },
        { name: "speed", type: "number", default: "20", description: "한 바퀴 회전에 걸리는 초" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex justify-center">
            <Globe size={260} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
