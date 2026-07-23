# @junds/react

JunDS v3 React 어댑터 — 바닐라 코어(`@junds/web`)를 감싸 **v2(`@junds/ui`) API 표면을 유지**하는
얇은 래퍼다(03-web-arch §11). v2 소비 코드는 import 경로만 바꾸면 무수정 컴파일·동작하는 것이 계약이다.

**G1 파일럿 표면**: `Button` · `TextField`(+ v2 호환 `Input`/`FormField`) · `Modal`

```tsx
// v2: import { Button } from "@/ds/primitives/Button";
import { Button, Input, FormField, Modal } from "@junds/react";
import "@junds/web/junds.css"; // 시각의 단일 소스는 바닐라 코어

<Button variant="danger" loading>삭제 중...</Button>
```

## 동작 원리 (DEC-008-(1) — 골격 렌더 + 입양)

어댑터가 내부 골격(`<button class="jd-button">` 등)을 React로 직접 렌더하고, 업그레이드된
CE의 `render()`가 입양 규칙(§3.3)으로 재사용한다. children·className·ref·네이티브 이벤트는
v2와 동일하게 React(내부 실요소) 소유로 남고, 시각·상태 반영은 CE 한 곳이 담당한다.
SSR은 완성 골격(반영 attribute 포함)을 내보내 hydration 전에도 스타일이 완성된다(§11-4).

## v2 호환 판정표

O=무수정 호환 · 합성=어댑터 층 번역 · △=부분 · ✗=불가

| 컴포넌트 | 프롭 | 판정 | 비고 |
|---|---|---|---|
| Button | `variant`(6종)/`size`(4종)/`loading`/`fullWidth`/`disabled` | O | 호스트 attribute 반영 → css 훅 |
| | `leftIcon`/`rightIcon` | 합성 | 어댑터가 v2 배치 그대로(loading 시 대체/숨김) |
| | `type` 기본값 | 합성 | v2/네이티브 `submit` 유지(코어 단독 기본은 `button`) |
| | 나머지 네이티브 프롭·`ref`·`onClick` | O | v2와 동일하게 내부 `<button>`에 |
| | `asChild` | ✗ | 입양 쿼리가 `button` 태그 고정 + variant가 호스트 속성 셀렉터 의존 — Slot 폴백(기본 시각만)+경고 |
| Input | `size`/`placeholder`/`disabled`/`className`/네이티브·`ref` | O | `<jd-text-field>` 위임 |
| | `error`(boolean 단독) | △ | v3는 메시지=상태(css `[error]:not([error=""])`) — 시각 미반영+경고. FormField 메시지와 함께면 완전 호환 |
| | `leftSlot`/`rightSlot` | ✗ | G1 범위 외(DEC-012-5) — 경고 후 무시 |
| FormField | `label`/`error`/`htmlFor`/`hint`/`className` | 합성 | 자식 Input/TextField의 jd-text-field로 폴드. aria 자동 연결은 v2 대비 가산 |
| | `required` | △ | 별표 css + **네이티브 `required`도 켜짐**(v2는 별표만 — 의미 가산) |
| Modal | `open`/`onClose`/`size`(5종)/`className`/`children`/`ref` | O | 제어형 역번역: `jd-request-close`를 preventDefault하고 `onClose`만 호출 |
| | `dismissible` | 합성 | `persistent = !dismissible` (DEC-012-4 반전의 역번역) |
| | `Modal.Header`/`Modal.Footer` | △ | 구조·a11y는 v2 동형. `jd-modal__header/footer` css는 코어에 아직 없음(웹 후속) |
| | `onOpenChange` (v3 가산) | 합성 | `jd-open` + cleanup으로 합성(DEC-008-(2)) |

v3 네이티브 표면 `TextField`(label·error 메시지 문자열·size)도 함께 노출한다 — 신규 코드 권장 경로.

## 개발

루트 devDependencies 호이스팅 사용(자체 devDeps 없음). 타입체크는 `../web/dist/types`를
참조하므로 **웹 빌드 선행** 필요(루트 `v3:build` 순서가 보장).

```sh
npm run test -w @junds/react    # vitest 55 (happy-dom + RTL, SSR/hydration 실측 포함)
npm run build -w @junds/react   # esbuild ESM + tsc 타입
```

상세 실측 기록과 스펙 보정은 `docs-spec/DECISIONS.md`의 DEC-022 참조.
