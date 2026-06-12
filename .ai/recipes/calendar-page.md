# Recipe — Calendar Page

## Goal

월간 캘린더 + 이벤트 패널 + 새 이벤트 생성. Google Calendar 스타일.

## Used components

- `CalendarMonth` — `@/ds/patterns/CalendarMonth`
- `Modal` — `@/ds/composites/Modal`
- `Form`, `Input`, `Button` — 폼 입력
- `useResource` + `useMutation` — 이벤트 CRUD

## Recipe

```tsx
"use client";
import { useState } from "react";
import { CalendarMonth, type CalendarEvent } from "@/ds/patterns/CalendarMonth";
import { Modal } from "@/ds/composites/Modal";
import { Input } from "@/ds/primitives/Input";
import { Button } from "@/ds/primitives/Button";
import { useResource } from "@/ds/hooks/useResource";
import { useMutation } from "@/ds/hooks/useMutation";

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [composeFor, setComposeFor] = useState<Date | null>(null);

  const events = useResource<CalendarEvent[]>(
    ["events", month.getFullYear(), month.getMonth()],
    () => fetch(`/api/events?y=${month.getFullYear()}&m=${month.getMonth()}`).then((r) => r.json()),
  );

  const createEvent = useMutation(
    (input: { title: string; start: string }) =>
      fetch("/api/events", { method: "POST", body: JSON.stringify(input) }).then((r) => r.json()),
    { invalidates: [["events", month.getFullYear(), month.getMonth()]] },
  );

  const eventsOnSelected = events.data?.filter((e) =>
    selected && new Date(e.start).toDateString() === selected.toDateString()
  ) ?? [];

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 max-w-6xl mx-auto p-6">
      <CalendarMonth
        month={month}
        onMonthChange={setMonth}
        selectedDate={selected}
        onSelectDate={(d) => { setSelected(d); }}
        events={events.data ?? []}
      />

      <aside className="rounded-xl border border-border bg-surface p-4">
        <header className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            {selected?.toLocaleDateString("ko") ?? "날짜 선택"}
          </h3>
          {selected && (
            <Button size="sm" onClick={() => setComposeFor(selected)}>+ 이벤트</Button>
          )}
        </header>
        <ul className="space-y-2">
          {eventsOnSelected.length === 0 ? (
            <li className="text-xs text-muted">이벤트가 없습니다.</li>
          ) : eventsOnSelected.map((e) => (
            <li key={e.id} className="px-3 py-2 rounded-md bg-surface-soft text-sm">
              {e.title}
            </li>
          ))}
        </ul>
      </aside>

      {composeFor && (
        <Modal open onClose={() => setComposeFor(null)} title="새 이벤트">
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              await createEvent.mutate({
                title: String(fd.get("title")),
                start: composeFor!.toISOString(),
              });
              setComposeFor(null);
            }}
            className="space-y-3"
          >
            <Input name="title" placeholder="이벤트 제목" required aria-label="이벤트 제목" />
            <p className="text-xs text-muted">{composeFor.toLocaleDateString("ko")}</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setComposeFor(null)}>취소</Button>
              <Button type="submit" loading={createEvent.loading}>추가</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
```

## Variations

- **주간 뷰**: 별도 컴포넌트(`CalendarWeek`)가 필요 — 후속 작업
- **드래그 이벤트 이동**: `events[].start` 값을 호출자에서 직접 patch
- **반복 이벤트 (RRULE)**: 호출자 측에서 expand 후 `events`로 전달

## See also

- `app/design-system/patterns/calendar/page.tsx` — 단일 픽커 변형 (기존 Calendar)
- `requirements/data-layer.md`
