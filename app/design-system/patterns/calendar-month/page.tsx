"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { CalendarMonth } from "@/ds/patterns/CalendarMonth";

export default function CalendarMonthPage() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  return (
    <ComponentPage
      name="CalendarMonth"
      description="월 그리드 + 이벤트 도트 + 키보드 화살표/Home/End/PageUp/PageDown 네비."
      importPath='import { CalendarMonth } from "@/ds/patterns/CalendarMonth"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <CalendarMonth
            month={month}
            onMonthChange={setMonth}
            selectedDate={selected}
            onSelectDate={setSelected}
            events={[
              { id: "e1", title: "팀 회의", start: new Date(month.getFullYear(), month.getMonth(), 12).toISOString(), color: "primary" },
              { id: "e2", title: "디자인 리뷰", start: new Date(month.getFullYear(), month.getMonth(), 18).toISOString(), color: "success" },
              { id: "e3", title: "릴리스", start: new Date(month.getFullYear(), month.getMonth(), 25).toISOString(), color: "warning" },
            ]}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
