"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Starfield } from "@/ds/patterns/Starfield";

export default function StarfieldPage() {
  return (
    <ComponentPage
      name="Starfield"
      description="Canvas 기반의 애니메이션 별 배경. 반짝이는 별들과 유성 효과로 몰입감 있는 배경을 만듭니다."
      importPath='import { Starfield } from "@/ds/patterns/Starfield"'
      props={[
        { name: "starCount", type: "number", default: "220", description: "별 개수" },
        { name: "shootingStarInterval", type: "number", default: "5", description: "유성 발생 간격 (초)" },
        { name: "backgroundColor", type: "string", default: '"#0b0d1a"', description: "배경색" },
        { name: "className", type: "string", description: "추가 CSS 클래스" },
      ]}
    >
      <Section title="기본">
        <Preview padding={false}>
          <div className="h-[400px] rounded-xl overflow-hidden">
            <Starfield />
          </div>
        </Preview>
      </Section>

      <Section title="커스터마이징">
        <Preview padding={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted">starCount: 80 / interval: 2s</p>
              <div className="h-[200px] rounded-xl overflow-hidden">
                <Starfield starCount={80} shootingStarInterval={2} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted">starCount: 400 / interval: 1s</p>
              <div className="h-[200px] rounded-xl overflow-hidden">
                <Starfield starCount={400} shootingStarInterval={1} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted">배경색: 네이비</p>
              <div className="h-[200px] rounded-xl overflow-hidden">
                <Starfield starCount={150} backgroundColor="#0a1628" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted">배경색: 다크 퍼플</p>
              <div className="h-[200px] rounded-xl overflow-hidden">
                <Starfield starCount={180} backgroundColor="#1a0a2e" shootingStarInterval={3} />
              </div>
            </div>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
