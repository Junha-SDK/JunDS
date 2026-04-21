"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { DateRangeFilter } from "@/ds/composites/DateRangeFilter";

export default function DateRangeFilterPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [appliedRange, setAppliedRange] = useState<string | null>(null);

  const [presetStart, setPresetStart] = useState("");
  const [presetEnd, setPresetEnd] = useState("");

  return (
    <ComponentPage
      name="DateRangeFilter"
      description="시작일/종료일 입력과 프리셋 버튼을 제공하는 날짜 범위 필터 컴포넌트. 조회/초기화 버튼과 빠른 프리셋을 지원합니다."
      importPath='import { DateRangeFilter } from "@/ds/composites/DateRangeFilter"'
      props={[
        { name: "startDate", type: "string", required: true, description: "시작 날짜 (YYYY-MM-DD)" },
        { name: "endDate", type: "string", required: true, description: "종료 날짜 (YYYY-MM-DD)" },
        { name: "onStartChange", type: "(date: string) => void", required: true, description: "시작 날짜 변경 핸들러" },
        { name: "onEndChange", type: "(date: string) => void", required: true, description: "종료 날짜 변경 핸들러" },
        { name: "onApply", type: "() => void", required: true, description: "조회 버튼 클릭 핸들러" },
        { name: "onReset", type: "() => void", description: "초기화 버튼 클릭 핸들러" },
        { name: "presets", type: "DatePreset[]", description: "프리셋 버튼 목록 (기본: 오늘/7일/30일/이번달)" },
      ]}
    >
      <Section title="기본">
        <p className="text-sm text-muted mb-3">
          시작일과 종료일을 선택한 후 조회 버튼을 클릭합니다. 초기화 버튼으로 날짜를 리셋할 수 있습니다.
        </p>
        <Preview>
          <div className="space-y-3">
            <DateRangeFilter
              startDate={start}
              endDate={end}
              onStartChange={setStart}
              onEndChange={setEnd}
              onApply={() => setAppliedRange(`${start} ~ ${end}`)}
              onReset={() => {
                setStart("");
                setEnd("");
                setAppliedRange(null);
              }}
            />
            {appliedRange && (
              <p className="text-sm text-foreground">
                조회된 범위: <strong>{appliedRange}</strong>
              </p>
            )}
          </div>
        </Preview>
      </Section>

      <Section title="프리셋">
        <p className="text-sm text-muted mb-3">
          기본 제공 프리셋(오늘, 최근 7일, 최근 30일, 이번 달)을 클릭하면 자동으로 날짜가 설정됩니다. 프리셋 활성 상태가 하이라이트됩니다.
        </p>
        <Preview>
          <div className="space-y-3">
            <DateRangeFilter
              startDate={presetStart}
              endDate={presetEnd}
              onStartChange={setPresetStart}
              onEndChange={setPresetEnd}
              onApply={() => {}}
              onReset={() => {
                setPresetStart("");
                setPresetEnd("");
              }}
            />
            {presetStart && presetEnd && (
              <p className="text-sm text-foreground">
                선택된 범위: <strong>{presetStart} ~ {presetEnd}</strong>
              </p>
            )}
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
