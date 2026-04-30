# Recipe — Notification Stack (Toast Provider + Notification Center)

## Goal

알림은 두 갈래로 다룬다. (1) 즉시 사라지는 가벼운 피드백은
`DsToastProvider` 를 앱 루트에 두고 `useDsToast` 훅으로 호출한다.
(2) 누적되는 알림은 헤더의 벨 아이콘에 `NotificationCenter` 로 보관한다.
이 레시피는 두 컴포넌트를 한 앱 셸에 함께 통합하는 표준 형태를 보여준다.

## Used components

- `DsToastProvider`, `useDsToast` — `@/ds/composites/Toast`
- `NotificationCenter` — `@/ds/patterns/NotificationCenter`
- `Button` — `@/ds/primitives/Button`

Props 검증: `.ai/props.json` → patterns → NotificationCenter, primitives →
Button. `Toast` 의 Provider/Hook 시그니처는 소스
(`/Users/junha/develop/jjunhaa/JunDS/ds/composites/Toast/Toast.tsx`)에서
확인한다 — `position`, `maxToasts` 두 옵션이 있고 훅은
`{ toast, success, error, warning, info, custom, confirm }` 메서드를 노출한다.

## Recipe — 1) Provider 등록 (root layout)

```tsx
// app/layout.tsx 또는 app/(app)/layout.tsx
import { DsToastProvider } from "@/ds/composites/Toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <DsToastProvider position="bottom-right" maxToasts={5}>
          {children}
        </DsToastProvider>
      </body>
    </html>
  );
}
```

## Recipe — 2) 어떤 페이지에서든 토스트 호출

```tsx
"use client";
import { useDsToast } from "@/ds/composites/Toast";
import { Button } from "@/ds/primitives/Button";

export default function SaveBar() {
  const toast = useDsToast();

  const handleSave = async () => {
    try {
      // await api.save(...)
      toast.success("저장되었습니다.", {
        action: { label: "되돌리기", onClick: () => toast.info("되돌렸어요") },
      });
    } catch {
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleDelete = () => {
    toast.confirm(
      "정말 삭제하시겠습니까? 되돌릴 수 없습니다.",
      () => toast.success("삭제 완료"),
      () => toast.info("취소했어요"),
    );
  };

  return (
    <div className="flex gap-2">
      <Button variant="primary" onClick={handleSave}>저장</Button>
      <Button variant="danger" onClick={handleDelete}>삭제</Button>
    </div>
  );
}
```

## Recipe — 3) 헤더 우측의 NotificationCenter

```tsx
"use client";
import { useState } from "react";
import { NotificationCenter, type NotificationItem } from "@/ds/patterns/NotificationCenter";

export default function HeaderBell() {
  const [items, setItems] = useState<NotificationItem[]>([
    { id: "1", title: "새 댓글", description: "이도윤님이 댓글을 남겼습니다.", time: "방금" },
    { id: "2", title: "결제 완료", description: "Pro 구독이 갱신되었습니다.", time: "1시간 전", read: true },
    { id: "3", title: "신규 가입", description: "user@acme.com", time: "어제" },
  ]);

  return (
    <NotificationCenter
      notifications={items}
      onMarkAllRead={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
      onClear={() => setItems([])}
    />
  );
}
```

## Variations

- **블로킹 토스트** — `toast.confirm` 또는 `toast.custom(content, { blocking: true })`
  은 백드롭이 깔리고 자동 닫힘이 비활성화된다. 결제 직전 확인처럼 사용자
  주의가 필수일 때 쓴다.
- **위치 변경** — Provider 의 `position` 을 `"top-center"` 등으로 바꾸면
  앱 전반의 토스트 위치가 통일된다.
- **서버 푸시 통합** — `NotificationCenter.notifications` 를
  WebSocket/SSE 로 갱신하고, 새 항목이 도착할 때마다
  `useDsToast().info(...)` 를 함께 호출하면 정착·요약 두 채널을 동시에
  가질 수 있다.
- **읽음 동기화** — `onMarkAllRead` 안에서 서버 patch 를 호출한 뒤 응답에
  맞춰 setItems 한다.

## See also

- 쇼케이스: `/design-system/composites/toast`,
  `/design-system/patterns/notification-center`,
  `/design-system/composites/notification`
- 관련 레시피: `./settings-page.md` (자동 저장 토스트),
  `./command-palette.md` (글로벌 액션 후 알림)
- 요구사항: `requirements/design-system-library.md`
- 소스: `/Users/junha/develop/jjunhaa/JunDS/ds/composites/Toast/Toast.tsx`,
  `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/NotificationCenter/NotificationCenter.tsx`
