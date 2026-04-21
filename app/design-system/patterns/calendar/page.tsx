"use client";

import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DsCalendar } from "@/ds/patterns/Calendar";

/* ------------------------------------------------------------------ */
/*  Section 1 — 기본 캘린더                                            */
/* ------------------------------------------------------------------ */

const basicEvents = [
  { id: "1", date: "2026-04-21", label: "디자인 리뷰", color: "#5b4cc7", time: "10:00" },
  { id: "2", date: "2026-04-21", label: "팀 미팅", color: "#2f8f57", time: "14:00" },
  { id: "3", date: "2026-04-22", label: "스프린트 계획", color: "#3b82f6", time: "09:00" },
  { id: "4", date: "2026-04-23", label: "코드 리뷰", color: "#dc3f3f", time: "11:00" },
  { id: "5", date: "2026-04-24", label: "배포일", color: "#f59e0b", allDay: true },
  { id: "6", date: "2026-04-25", label: "스프린트 회고", color: "#8b5cf6", time: "16:00" },
  { id: "7", date: "2026-04-25", label: "팀 빌딩", color: "#10b981", time: "18:00" },
  { id: "8", date: "2026-04-28", label: "클라이언트 미팅", color: "#ec4899", time: "10:00" },
  { id: "9", date: "2026-04-28", label: "기획 회의", color: "#6366f1" },
  { id: "10", date: "2026-04-28", label: "문서 작업", color: "#14b8a6" },
  { id: "11", date: "2026-04-30", label: "월말 정산", color: "#f97316", allDay: true },
];

function formatDate(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/* ------------------------------------------------------------------ */
/*  Interactive sub-components (each manages its own state)            */
/* ------------------------------------------------------------------ */

function BasicCalendarDemo() {
  const [selected, setSelected] = useState<Date | null>(null);

  return (
    <div>
      <DsCalendar
        events={basicEvents}
        selectedDate={selected}
        selectionMode="single"
        onDateClick={(d) => setSelected(d)}
      />
      {selected && (
        <p className="mt-3 text-sm text-muted">
          선택된 날짜: <span className="font-semibold text-foreground">{formatDate(selected)}</span>
        </p>
      )}
    </div>
  );
}

function RangeCalendarDemo() {
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);

  const rangeText = (() => {
    if (!range) return "날짜를 두 번 클릭하여 범위를 선택하세요.";
    return `${formatDate(range.start)} ~ ${formatDate(range.end)}`;
  })();

  return (
    <div>
      <DsCalendar
        events={[]}
        selectionMode="range"
        onRangeSelect={setRange}
      />
      <p className="mt-3 text-sm text-muted">
        선택 범위: <span className="font-semibold text-foreground">{rangeText}</span>
      </p>
    </div>
  );
}

function MinMaxCalendarDemo() {
  return (
    <DsCalendar
      events={[]}
      minDate={new Date(2026, 3, 10)}
      maxDate={new Date(2026, 3, 25)}
      onDateClick={() => {}}
    />
  );
}

function WeekViewDemo() {
  return (
    <DsCalendar
      events={basicEvents}
      view="week"
      onDateClick={() => {}}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
  return (
    <ComponentPage
      name="Calendar"
      description="월간/주간 캘린더. 이벤트 표시, 날짜 선택, 범위 선택, 날짜 제한, 주간 뷰를 지원합니다."
      importPath='import { DsCalendar } from "@/ds/patterns/Calendar"'
      props={[
        { name: "events", type: "CalendarEvent[]", description: "이벤트 목록. id, date(YYYY-MM-DD), label, color?, time?, allDay? 포함." },
        { name: "selectedDate", type: "Date | null", description: "현재 선택된 날짜 (controlled)." },
        { name: "selectionMode", type: '"single" | "range"', default: '"single"', description: "날짜 선택 모드. single 또는 range." },
        { name: "selectedRange", type: "{ start: Date | null; end: Date | null }", description: "선택된 날짜 범위 (controlled). range 모드에서 사용." },
        { name: "onDateSelect", type: "(date: Date) => void", description: "날짜 선택 핸들러 (single 모드)." },
        { name: "onRangeSelect", type: "(range: { start: Date; end: Date }) => void", description: "범위 선택 완료 핸들러 (range 모드)." },
        { name: "minDate", type: "Date", description: "선택 가능한 최소 날짜. 이전 날짜는 비활성화." },
        { name: "maxDate", type: "Date", description: "선택 가능한 최대 날짜. 이후 날짜는 비활성화." },
        { name: "view", type: '"month" | "week"', default: '"month"', description: "캘린더 뷰 모드." },
        { name: "onDateClick", type: "(date: Date) => void", description: "날짜 클릭 핸들러." },
        { name: "renderDay", type: "(date, events) => ReactNode", description: "커스텀 셀 렌더." },
        { name: "className", type: "string", description: "루트 요소 추가 클래스." },
      ]}
    >
      {/* Section 1: 기본 캘린더 */}
      <Section title="기본 캘린더">
        <Preview padding={false}>
          <div className="p-4">
            <BasicCalendarDemo />
          </div>
        </Preview>
      </Section>

      {/* Section 2: 날짜 범위 선택 */}
      <Section title="날짜 범위 선택">
        <Preview padding={false}>
          <div className="p-4">
            <RangeCalendarDemo />
          </div>
        </Preview>
      </Section>

      {/* Section 3: 최소/최대 날짜 제한 */}
      <Section title="최소/최대 날짜 제한">
        <p className="text-sm text-muted mb-3">
          minDate: 2026-04-10, maxDate: 2026-04-25. 범위 밖의 날짜는 비활성화됩니다.
        </p>
        <Preview padding={false}>
          <div className="p-4">
            <MinMaxCalendarDemo />
          </div>
        </Preview>
      </Section>

      {/* Section 4: 주간 뷰 */}
      <Section title="주간 뷰">
        <p className="text-sm text-muted mb-3">
          view=&quot;week&quot;으로 주간 뷰를 표시합니다.
        </p>
        <Preview padding={false}>
          <div className="p-4">
            <WeekViewDemo />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
