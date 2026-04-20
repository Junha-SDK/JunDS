"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { HoverCard } from "@/ds/composites/HoverCard";

export default function HoverCardPage() {
  return (
    <ComponentPage
      name="HoverCard"
      description="호버 시 카드 형태의 미리보기를 표시합니다. 사용자 프로필, 링크 미리보기 등에 활용합니다."
      importPath='import { HoverCard } from "@/ds/composites/HoverCard"'
      props={[
        { name: "trigger", type: "ReactNode", required: true, description: "호버 대상 요소" },
        { name: "children", type: "ReactNode", required: true, description: "카드 내용" },
        { name: "side", type: '"top"|"bottom"|"left"|"right"', default: '"bottom"', description: "카드 표시 위치" },
        { name: "openDelay", type: "number", default: "300", description: "열림 지연 시간 (ms)" },
        { name: "closeDelay", type: "number", default: "200", description: "닫힘 지연 시간 (ms)" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">작성자:</span>
            <HoverCard
              trigger={
                <span className="text-sm font-medium text-primary cursor-pointer hover:underline">
                  @junha
                </span>
              }
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  JH
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">준하</div>
                  <div className="text-xs text-muted mt-0.5">Frontend Developer</div>
                  <div className="text-xs text-muted mt-1">JunDS 디자인 시스템 제작자</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted"><strong className="text-foreground">42</strong> 팔로잉</span>
                    <span className="text-xs text-muted"><strong className="text-foreground">128</strong> 팔로워</span>
                  </div>
                </div>
              </div>
            </HoverCard>
          </div>
        </Preview>
      </Section>

      <Section title="위치 변경">
        <Preview>
          <div className="flex items-center justify-center gap-12 py-16">
            {(["top", "bottom", "left", "right"] as const).map((side) => (
              <HoverCard
                key={side}
                side={side}
                trigger={
                  <span className="px-3 py-1.5 text-sm font-medium bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    {side}
                  </span>
                }
              >
                <p className="text-sm text-muted">
                  {side} 방향으로 표시되는 호버 카드입니다.
                </p>
              </HoverCard>
            ))}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
