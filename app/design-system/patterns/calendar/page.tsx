"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DsCalendar } from "@/ds/patterns/Calendar";

const events = [
  { id: "1", date: "2026-04-19", label: "디자인 리뷰", color: "#5b4cc7" },
  { id: "2", date: "2026-04-19", label: "팀 미팅", color: "#2f8f57" },
  { id: "3", date: "2026-04-21", label: "배포", color: "#dc3f3f" },
  { id: "4", date: "2026-04-25", label: "스프린트 회고", color: "#b7791f" },
  { id: "5", date: "2026-04-25", label: "코드 리뷰" },
  { id: "6", date: "2026-04-25", label: "문서 작업" },
  { id: "7", date: "2026-04-28", label: "클라이언트 미팅", color: "#7c5ce7" },
];

export default function CalendarPage() {
  return (
    <ComponentPage
      name="Calendar"
      description="월간 캘린더. 이벤트 표시, 날짜 클릭, 커스텀 셀 렌더링."
      importPath='import { DsCalendar } from "@/ds/patterns/Calendar"'
      props={[
        { name: "events", type: "CalendarEvent[]", description: "이벤트 목록" },
        { name: "renderDay", type: "(date, events) => ReactNode", description: "커스텀 셀 렌더" },
        { name: "onDateClick", type: "(date: Date) => void", description: "날짜 클릭 핸들러" },
      ]}
    >
      <Section title="Demo">
        <Preview padding={false}>
          <div className="p-4">
            <DsCalendar events={events} onDateClick={(d) => console.log(d)} />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
