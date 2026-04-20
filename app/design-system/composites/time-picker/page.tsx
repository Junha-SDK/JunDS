"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { TimePicker } from "@/ds/composites/TimePicker";

export default function TimePickerPage() {
  const [time24, setTime24] = useState("14:30");
  const [time12, setTime12] = useState("09:00");
  const [timeStep, setTimeStep] = useState("");

  return (
    <ComponentPage
      name="TimePicker"
      description="시간을 선택할 수 있는 드롭다운 컴포넌트. 12시간/24시간 형식과 분 단위 간격을 지원합니다."
      importPath='import { TimePicker } from "@/ds/composites/TimePicker"'
      props={[
        { name: "value", type: "string", description: "HH:mm 형식의 시간 값" },
        { name: "onChange", type: "(time: string) => void", required: true, description: "시간 변경 콜백" },
        { name: "format", type: '"12h" | "24h"', default: '"24h"', description: "시간 형식" },
        { name: "minuteStep", type: "number", default: "1", description: "분 단위 간격" },
        { name: "disabled", type: "boolean", default: "false", description: "비활성화 상태" },
        { name: "placeholder", type: "string", default: '"시간 선택"', description: "플레이스홀더" },
      ]}
    >
      <Section title="24시간 형식">
        <Preview>
          <TimePicker value={time24} onChange={setTime24} format="24h" />
          <p className="mt-3 text-sm text-muted">선택된 시간: {time24}</p>
        </Preview>
      </Section>

      <Section title="12시간 형식 (AM/PM)">
        <Preview>
          <TimePicker value={time12} onChange={setTime12} format="12h" />
          <p className="mt-3 text-sm text-muted">선택된 시간: {time12}</p>
        </Preview>
      </Section>

      <Section title="15분 간격">
        <Preview>
          <TimePicker
            value={timeStep}
            onChange={setTimeStep}
            minuteStep={15}
            placeholder="15분 간격으로 선택"
          />
        </Preview>
      </Section>

      <Section title="비활성화">
        <Preview>
          <TimePicker value="10:00" onChange={() => {}} disabled />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
