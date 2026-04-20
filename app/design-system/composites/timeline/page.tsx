"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { Timeline } from "@/ds/composites/Timeline";
import type { TimelineItem } from "@/ds/composites/Timeline";

const items: TimelineItem[] = [
  { key: "1", title: "업무 생성", time: "09:00", color: "primary", description: "김준하님이 새 업무를 생성했습니다." },
  { key: "2", title: "담당자 배정", time: "09:30", color: "neutral", description: "이서연님이 담당자로 배정되었습니다." },
  { key: "3", title: "진행 시작", time: "10:15", color: "success", description: "작업을 시작했습니다." },
  { key: "4", title: "검토 요청", time: "14:00", color: "warning", description: "박민수님에게 검토를 요청했습니다." },
  { key: "5", title: "완료", time: "16:30", color: "success", description: "업무가 완료 처리되었습니다." },
];

export default function TimelinePage() {
  return (
    <ComponentPage
      name="Timeline"
      description="타임라인. 시간 순서대로 이벤트를 시각적으로 나열합니다."
      importPath='import { Timeline } from "@/ds/composites/Timeline"'
      props={[
        { name: "items", type: "TimelineItem[]", description: "타임라인 아이템 목록" },
        { name: "lineStyle", type: '"solid"|"dashed"', default: '"solid"', description: "연결선 스타일" },
      ]}
    >
      <Section title="기본">
        <Preview>
          <div className="max-w-md">
            <Timeline items={items} />
          </div>
        </Preview>
      </Section>

      <Section title="점선 연결">
        <Preview>
          <div className="max-w-md">
            <Timeline items={items} lineStyle="dashed" />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
