"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DateRangePicker } from "@/ds/composites/DateRangePicker";

export default function DateRangePickerPage() {
  const [range1, setRange1] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [range2, setRange2] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(2026, 3, 1),
    end: new Date(2026, 3, 15),
  });

  return (
    <ComponentPage
      name="DateRangePicker"
      description="두 개의 캘린더로 날짜 범위를 선택할 수 있는 컴포넌트입니다."
      importPath='import { DateRangePicker } from "@/ds/composites/DateRangePicker"'
      props={[
        { name: "value", type: "DateRange", required: true, description: "선택된 날짜 범위 ({ start, end })" },
        { name: "onChange", type: "(range: DateRange) => void", required: true, description: "범위 변경 콜백" },
        { name: "placeholder", type: "string", default: '"날짜 범위 선택"', description: "플레이스홀더" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화 상태" },
        { name: "minDate", type: "Date", description: "선택 가능한 최소 날짜" },
        { name: "maxDate", type: "Date", description: "선택 가능한 최대 날짜" },
      ]}
    >
      <Section title="기본 사용">
        <Preview>
          <DateRangePicker value={range1} onChange={setRange1} />
          <p className="mt-3 text-sm text-muted">
            {range1.start && range1.end
              ? `${range1.start.toLocaleDateString("ko-KR")} ~ ${range1.end.toLocaleDateString("ko-KR")}`
              : "날짜를 선택해주세요"}
          </p>
        </Preview>
      </Section>

      <Section title="초기값이 설정된 경우">
        <Preview>
          <DateRangePicker value={range2} onChange={setRange2} />
        </Preview>
      </Section>

      <Section title="비활성화">
        <Preview>
          <DateRangePicker
            value={{ start: new Date(2026, 3, 10), end: new Date(2026, 3, 20) }}
            onChange={() => {}}
            disabled
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
