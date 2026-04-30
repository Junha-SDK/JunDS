# Recipe — Command Palette (⌘K)

## Goal

⌘K(또는 Ctrl+K) 단축키로 열리는 글로벌 명령 검색을 추가하고, 헤더에는 호출
힌트 칩을 표시한다. 명령 항목은 그룹·아이콘·키워드 검색을 지원해야 하고,
첫 사용자에게는 `Spotlight` 로 찾아갈 곳을 강조해 줄 수 있다.

## Used components

- `CommandPalette` — `@/ds/patterns/CommandPalette`
- `Kbd` — `@/ds/primitives/Kbd`
- `Spotlight` — `@/ds/composites/Spotlight`
- `Button` — `@/ds/primitives/Button`

Props 검증: `.ai/props.json` → patterns → CommandPalette, primitives → Kbd,
composites → Spotlight. `CommandPalette` 는 외부 제어를 `open` /
`onOpenChange` 로 받는다. 내부적으로 `⌘K` 를 자체 구독하고 있어 추가
키보드 훅을 달지 않아도 된다.

## Recipe

```tsx
"use client";
import { useState } from "react";
import { CommandPalette, type CommandItem } from "@/ds/patterns/CommandPalette";
import { Kbd } from "@/ds/primitives/Kbd";
import { Spotlight } from "@/ds/composites/Spotlight";
import { Button } from "@/ds/primitives/Button";

export default function AppShellWithCommandK() {
  const [open, setOpen] = useState(false);
  const [highlightHint, setHighlightHint] = useState(true);

  const items: CommandItem[] = [
    {
      id: "go-dashboard",
      label: "대시보드로 이동",
      description: "메인 대시보드를 엽니다",
      group: "이동",
      keywords: ["home", "dash"],
      action: () => { window.location.href = "/dashboard"; },
    },
    {
      id: "go-settings",
      label: "설정 열기",
      group: "이동",
      keywords: ["preferences", "config"],
      action: () => { window.location.href = "/settings"; },
    },
    {
      id: "create-project",
      label: "새 프로젝트 만들기",
      description: "프로젝트 생성 모달을 엽니다",
      group: "동작",
      keywords: ["new", "add"],
      action: () => { /* setProjectModalOpen(true) */ },
    },
    {
      id: "toggle-theme",
      label: "다크 모드 토글",
      group: "환경",
      keywords: ["theme", "dark"],
      action: () => { document.documentElement.classList.toggle("dark"); },
    },
  ];

  return (
    <>
      {/* 헤더의 호출 힌트 */}
      <div className="flex items-center justify-end gap-2 p-3 border-b border-border">
        <Button
          id="cmdk-trigger"
          variant="ghost"
          size="sm"
          onClick={() => { setOpen(true); setHighlightHint(false); }}
          rightIcon={<Kbd keys={["⌘", "K"]} />}
        >
          명령어 검색
        </Button>
      </div>

      {/* 첫 방문자에게 강조 (선택) */}
      <Spotlight target="#cmdk-trigger" active={highlightHint} padding={6}>
        <div className="absolute -bottom-12 right-0 px-3 py-2 rounded-lg bg-foreground text-white text-xs whitespace-nowrap">
          ⌘K 로 어디든 빠르게 이동하세요.
        </div>
      </Spotlight>

      <CommandPalette
        items={items}
        open={open}
        onOpenChange={setOpen}
        placeholder="명령 검색 또는 페이지 이동..."
      />
    </>
  );
}
```

## Variations

- **외부 제어 없이** — 가장 간단한 형태는 `<CommandPalette items={items} />`
  뿐이다. 내장된 ⌘K 키 바인딩만으로 충분할 때.
- **결과 없음 메시지 커스터마이즈** — 현재 컴포넌트는 표준 메시지를 가진다.
  비어 있을 때를 다르게 하려면 items 를 동적으로 페치한 뒤 빈 결과는
  `EmptyState` 가 들어 있는 fake item 으로 대체한다.
- **그룹 분리** — `group` 필드로 자동 그루핑된다. "이동", "동작" 처럼
  카테고리 이름을 같이 통일하면 결과가 깔끔하다.
- **앱 전역 등록** — `app/layout.tsx` 에 한 번만 두고 명령 항목은
  Context 또는 `useDsToast` 처럼 별도 Provider 로 누적시키면 페이지마다
  명령을 동적으로 등록할 수 있다.

## See also

- 쇼케이스: `/design-system/patterns/command-palette`,
  `/design-system/primitives/kbd`, `/design-system/composites/spotlight`
- 관련 레시피: `./dashboard-overview.md`, `./notification-stack.md`
- 요구사항: `requirements/design-system-library.md`,
  `requirements/agent-onboarding.md`
- 소스: `/Users/junha/develop/jjunhaa/JunDS/ds/patterns/CommandPalette/CommandPalette.tsx`
