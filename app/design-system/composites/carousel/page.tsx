"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Carousel } from "@/ds/composites/Carousel";

const colors = [
  { bg: "bg-blue-400", label: "슬라이드 1" },
  { bg: "bg-emerald-400", label: "슬라이드 2" },
  { bg: "bg-amber-400", label: "슬라이드 3" },
  { bg: "bg-rose-400", label: "슬라이드 4" },
  { bg: "bg-violet-400", label: "슬라이드 5" },
];

export default function CarouselPage() {
  return (
    <ComponentPage
      name="Carousel"
      description="캐러셀 슬라이더. CSS scroll-snap 기반으로 도트 인디케이터, 화살표, 자동 재생, 무한 반복을 지원합니다."
      importPath='import { Carousel } from "@/ds/composites/Carousel"'
      props={[
        { name: "children", type: "ReactNode[]", required: true, description: "슬라이드 항목" },
        { name: "showDots", type: "boolean", default: "true", description: "하단 도트 표시" },
        { name: "showArrows", type: "boolean", default: "true", description: "좌우 화살표 표시" },
        { name: "autoPlay", type: "boolean", default: "false", description: "자동 재생" },
        { name: "interval", type: "number", default: "4000", description: "자동 재생 간격 (ms)" },
        { name: "loop", type: "boolean", default: "true", description: "무한 반복" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="max-w-lg mx-auto">
            <Carousel showDots showArrows>
              {colors.map((c) => (
                <div
                  key={c.label}
                  className={`${c.bg} h-48 rounded-xl flex items-center justify-center`}
                >
                  <span className="text-white text-lg font-bold">{c.label}</span>
                </div>
              ))}
            </Carousel>
          </div>
        </Preview>
      </Section>

      <Section title="자동 재생">
        <Preview>
          <div className="max-w-lg mx-auto">
            <Carousel showDots showArrows autoPlay interval={3000}>
              {colors.slice(0, 3).map((c) => (
                <div
                  key={c.label}
                  className={`${c.bg} h-48 rounded-xl flex items-center justify-center`}
                >
                  <span className="text-white text-lg font-bold">{c.label}</span>
                </div>
              ))}
            </Carousel>
          </div>
        </Preview>
      </Section>

      <Section title="도트만 표시">
        <Preview>
          <div className="max-w-lg mx-auto">
            <Carousel showDots showArrows={false}>
              {colors.map((c) => (
                <div
                  key={c.label}
                  className={`${c.bg} h-32 rounded-xl flex items-center justify-center`}
                >
                  <span className="text-white text-lg font-bold">{c.label}</span>
                </div>
              ))}
            </Carousel>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
