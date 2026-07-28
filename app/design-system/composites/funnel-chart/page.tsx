"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { FunnelChart } from "@/ds/composites/FunnelChart";

export default function FunnelChartPage() {
  return (
    <ComponentPage
      name="FunnelChart"
      description="단계별 전환율을 시각화하는 깔때기 차트. 각 단계의 값과 직전 단계 대비 전환률을 함께 표시합니다."
      importPath='import { FunnelChart } from "@/ds/composites/FunnelChart"'
      props={[
        {
          name: "data",
          type: "{ label: string; value: number; color?: string }[]",
          description: "단계별 데이터",
        },
        { name: "height", type: "number", default: "300", description: "차트 전체 높이(px)" },
        { name: "className", type: "string", description: "컨테이너 클래스" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-xl">
            <FunnelChart
              data={[
                { label: "방문", value: 12000 },
                { label: "회원가입", value: 4800 },
                { label: "장바구니", value: 1900 },
                { label: "결제", value: 940 },
                { label: "재구매", value: 320 },
              ]}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
