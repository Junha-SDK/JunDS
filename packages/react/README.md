# @junds/react

JunDS v3 React 어댑터는 바닐라 코어(`@junds/web`)의 390개 Custom Element를 React의
props·event handler·구체 ref 표면으로 제공합니다. `Button`·`TextField`
(v2 호환 `Input`/`FormField`)·`Modal`은 v2(`@junds/ui`) 호환 골격까지 보존하고,
나머지 387개는 바닐라 DOM을 중복 구현하지 않는 생성 어댑터입니다.

```tsx
// 권장: 필요한 컴포넌트만 등록하는 subpath
import { Alert } from "@junds/react/alert";
import "@junds/web/core.css"; // 앱에서 1회: 토큰 + 베이스
import "@junds/web/css/alert.css"; // Alert 스타일만

<Alert
  variant="warning"
  aria-label="저장 경고"
  dismissible
  onJdDismiss={(event) => console.log(event.detail)}
>
  저장하지 않은 변경 사항이 있습니다.
</Alert>;
```

기존 코드의 일괄 마이그레이션에는 루트 import도 유지합니다. 다만 루트는 전체 공개
표면이므로 새 코드에서는 `@junds/react/alert`, `@junds/react/accordion`처럼 컴포넌트별
subpath를 권장합니다.

## 동작 원리

- 생성 어댑터는 `<jd-*>` 호스트만 렌더하고, 스칼라는 attribute/property, 배열·객체는
  layout effect의 property 대입, `jd-change`는 `onJdChange`로 전달합니다.
- 배열·객체 프롭을 제거하면 최초 Custom Element 기본값으로 복원합니다.
- `aria-*`·`data-*`·`tabIndex`·`role`·`onClick` 등 표준 React 호스트 프롭을 그대로
  사용할 수 있으며 ref는 각 `JdAccordion` 같은 구체 클래스 타입입니다.
- 생성 이벤트는 소스의 `emit()` detail을 정적으로 추론합니다. 공개 타입으로 안전하게
  표현할 수 없는 이벤트만 `unknown`을 유지합니다.
- 손저작 3종은 내부 골격(`<button class="jd-button">` 등)을 React가 먼저 렌더하고,
  업그레이드된 CE가 입양합니다(DEC-008-(1)). SSR에서도 완성된 골격을 유지합니다.

```tsx
import { Accordion } from "@junds/react/accordion";
import type { JdAccordion } from "@junds/web/accordion/element";

const ref = useRef<JdAccordion>(null);

<Accordion
  ref={ref}
  items={[{ key: "shipping", title: "배송", content: "하루 걸립니다." }]}
  onJdChange={(event) => {
    event.detail.openKeys; // string[]
  }}
/>;
```

## v2 호환 판정표

O=무수정 호환 · 합성=어댑터 층 번역 · △=부분 · ✗=불가

| 컴포넌트  | 프롭                                                        | 판정 | 비고                                                                                      |
| --------- | ----------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| Button    | `variant`(6종)/`size`(4종)/`loading`/`fullWidth`/`disabled` | O    | 호스트 attribute 반영 → css 훅                                                            |
|           | `leftIcon`/`rightIcon`                                      | 합성 | 어댑터가 v2 배치 그대로(loading 시 대체/숨김)                                             |
|           | `type` 기본값                                               | 합성 | 안전한 `button`. 제출 액션만 `type="submit"` 명시                                         |
|           | 나머지 네이티브 프롭·`ref`·`onClick`                        | O    | v2와 동일하게 내부 `<button>`에                                                           |
|           | `asChild`                                                   | 합성 | `data-jd-*` 훅으로 variant/size/loading/fullWidth 유지. 비-button disabled도 클릭·탭 차단 |
| Input     | `size`/`placeholder`/`disabled`/`className`/네이티브·`ref`  | O    | `<jd-text-field>` 위임                                                                    |
|           | `error`(boolean 단독)                                       | O    | 메시지 없는 `invalid` 시각 + `aria-invalid`로 반영                                        |
|           | `leftSlot`/`rightSlot`                                      | O    | CE control 골격의 start/end 영역으로 렌더                                                 |
| FormField | `label`/`error`/`htmlFor`/`hint`/`className`                | 합성 | 자식 Input/TextField로 폴드. hint/error의 aria 설명 자동 병합                             |
|           | `required`                                                  | △    | 별표 css + **네이티브 `required`도 켜짐**(v2는 별표만 — 의미 가산)                        |
| Modal     | `open`/`onClose`/`size`(5종)/`className`/`children`/`ref`   | O    | 제어형 역번역: `jd-request-close`를 preventDefault하고 `onClose`만 호출                   |
|           | `dismissible`                                               | 합성 | `persistent = !dismissible` (DEC-012-4 반전의 역번역)                                     |
|           | `Modal.Header`/`Modal.Body`/`Modal.Footer`                  | O    | 일관된 패딩·구분선·모바일 배치 + labelledby/describedby 자동 연결                         |
|           | `onOpenChange` (v3 가산)                                    | 합성 | `jd-open` + cleanup으로 합성(DEC-008-(2))                                                 |

v3 네이티브 표면 `TextField`도 함께 노출합니다. `invalid`는 메시지 없는 실패 상태,
`error`는 사용자에게 보여줄 메시지이며 두 값은 독립적으로 사용할 수 있습니다.

```tsx
<Input
  error={hasError}
  leftSlot={<SearchIcon aria-hidden />}
  rightSlot={<button type="button" aria-label="지우기">×</button>}
/>

<Modal open={open} onClose={close}>
  <Modal.Header onClose={close}>프로필 수정</Modal.Header>
  <Modal.Body>입력 내용을 확인해주세요.</Modal.Body>
  <Modal.Footer>
    <Button onClick={close}>취소</Button>
    <Button type="submit">저장</Button>
  </Modal.Footer>
</Modal>
```

## React 18·19 계약

React 18은 Custom Element 스칼라 값을 주로 attribute로 전달하고, React 19는 등록된
element의 공개 property가 있으면 property를 우선합니다. 어댑터는 두 경로에서 결과가
같도록 숫자·문자열을 원래 타입으로 유지하고, boolean `false`는 attribute로 직렬화하지
않습니다. 배열·객체는 두 버전 모두 layout effect에서 property로 전달합니다.

CI는 React 18과 19를 각각 설치해 같은 타입·unit·SSR/hydration 계약을 실행합니다.

## 개발

루트 devDependencies 호이스팅 사용(자체 devDeps 없음). 타입체크는 `../web/dist/types`를
참조하므로 **웹 빌드 선행** 필요(루트 `v3:build` 순서가 보장).

```sh
npm run test -w @junds/react    # happy-dom + RTL, SSR/hydration 실측 포함
npm run coverage -w @junds/react # coverage/react/에 전용 커버리지 산출
npm run build -w @junds/react   # esbuild ESM + tsc 타입
```

상세 실측 기록과 스펙 보정은 `docs-spec/DECISIONS.md`의 DEC-022 참조.
