"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { SwipeAction } from "@/ds/composites/SwipeAction";

export default function SwipeActionPage() {
  return (
    <ComponentPage
      name="SwipeAction"
      description="모바일에서 좌/우로 스와이프하여 숨겨진 액션 버튼을 노출하는 인터랙션. 리스트 아이템에 자주 활용됩니다."
      importPath='import { SwipeAction } from "@/ds/composites/SwipeAction"'
      props={[
        { name: "children", type: "ReactNode", required: true, description: "스와이프 가능한 콘텐츠" },
        { name: "leftActions", type: "{ label, color, onClick }[]", description: "왼쪽 스와이프 시 노출되는 액션" },
        { name: "rightActions", type: "{ label, color, onClick }[]", description: "오른쪽 스와이프 시 노출되는 액션" },
        { name: "threshold", type: "number", default: "80", description: "고정되는 스와이프 거리(px)" },
        { name: "className", type: "string", description: "추가 클래스" },
      ]}
    >
      <Section title="기본 사용" description="모바일/터치 환경에서 좌우로 스와이프해 보세요.">
        <Preview>
          <div className="w-full max-w-md border border-border rounded-xl overflow-hidden">
            <SwipeAction
              rightActions={[
                { label: "보관", color: "#3b82f6", onClick: () => alert("보관") },
                { label: "삭제", color: "#ef4444", onClick: () => alert("삭제") },
              ]}
            >
              <div className="px-4 py-3 bg-white">
                <p className="text-sm font-medium text-foreground">디자인 시스템 회의</p>
                <p className="text-xs text-muted mt-0.5">오늘 14:00 — 컴포넌트 리뷰</p>
              </div>
            </SwipeAction>
          </div>
        </Preview>
      </Section>

      <Section title="양쪽 액션">
        <Preview>
          <div className="w-full max-w-md border border-border rounded-xl overflow-hidden">
            <SwipeAction
              leftActions={[{ label: "완료", color: "#22c55e", onClick: () => alert("완료") }]}
              rightActions={[{ label: "삭제", color: "#ef4444", onClick: () => alert("삭제") }]}
            >
              <div className="px-4 py-3 bg-white">
                <p className="text-sm font-medium text-foreground">장보기</p>
                <p className="text-xs text-muted mt-0.5">우유, 빵, 달걀</p>
              </div>
            </SwipeAction>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
