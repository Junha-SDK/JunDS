# 03-web-arch — packages/web 바닐라 웹 아키텍처 (G0)

작성일: 2026-07-23 · 전제: [DECISIONS.md](./DECISIONS.md) DEC-002/003/004/006(D1·D2) · 인벤토리: [00-inventory.md](./00-inventory.md)
대상: UI 320개 + finance UI 86개 전량. hooks 62개는 Behavior로 전환(§5).
토큰 파이프라인은 02-tokens 스펙에서 별도 정의하며, 이 문서는 토큰의 **소비 방식**(CSS custom properties + `@layer junds.tokens`)만 전제한다.

문서 규약: 각 절은 **결정**과 **근거**를 명시한다. 코드는 규범(normative) 스케치로, 시그니처·불변식이 규범이고 구현 세부는 자유다.

---

## 0. 한눈에 보는 아키텍처

```
@junds/web (런타임 의존성 0)
├─ core/          JdElement 베이스, defineElement/defineJunds, adoptStyles, css, cx
├─ components/    <jd-*> 320 + finance UI 86 — 각 폴더: element.ts + index.ts + *.css.ts
├─ behaviors/     createXxx(el, opts) 51종 (hooks 62 → 51 존속, 00-inventory §4)
├─ a11y/          focus trap · roving tabindex · dismissable · announcer (Behavior 공용층)
├─ icons/         빌드타임 생성 SVG 모듈 + <jd-icon> 레지스트리
└─ dist/          컴포넌트별 ESM + junds.js(ESM 단일) + junds.global.js(IIFE) + junds.css
```

- **Custom Elements v1, Shadow DOM 미사용(light DOM)** — DEC-006 D1 확정.
  스타일 격리는 `@layer junds` + `jd-` 접두로 대신한다. 근거: SSR/SSG 마크업이 순수 HTML로 직렬화되고, 소비자 오버라이드가 일반 CSS로 가능하며, axe 등 접근성 도구와 `aria-*` id 참조가 shadow 경계 없이 동작한다.
- **클래스 export 병행** — 모든 컴포넌트는 태그(`<jd-button>`)와 클래스(`import { JdButton }`)를 둘 다 제공한다.

---

## 1. 컴포넌트 모델 — `JdElement` 베이스 클래스

### 1.1 결정

`HTMLElement`를 직접 확장한 단일 베이스 클래스 `JdElement` 하나로 320+86개 전부를 구현한다. Lit 등 외부 베이스 채택 금지(의존성 0 원칙), 컴포넌트별 수제 `HTMLElement` 확장도 금지(반영 규칙·수명주기 관리가 390회 중복된다).

**근거**: attribute↔property 반영, 업데이트 배칭, Behavior 수명 관리, 이벤트 발행은 전 컴포넌트 공통 관심사다. 베이스 1개 + 선언적 `props` 맵이면 개별 컴포넌트는 `render()`/`update()`만 쓰면 된다.

### 1.2 규범 스케치 — `core/element.ts`

```ts
type PropType = typeof String | typeof Number | typeof Boolean;

export interface PropDef {
  type: PropType;
  default?: unknown;
  /** 프로퍼티 변경을 attribute로 되쓰기. 기본 false */
  reflect?: boolean;
  /** attribute 이름 재정의. false면 attribute 미노출(property 전용) */
  attribute?: string | false;
}

export abstract class JdElement extends HTMLElement {
  /** 서브클래스가 선언. 키는 camelCase 프로퍼티명 */
  static props: Record<string, PropDef> = {};
  static tag: string; // "jd-button" — defineElement가 사용

  static get observedAttributes(): string[] { /* props에서 파생(kebab 변환) */ }

  #ready = false;              // render() 1회 완료 여부
  #updateQueued = false;
  #behaviors = new Set<{ destroy(): void }>();

  connectedCallback() {
    if (!this.#ready) {
      this.#upgradeProps();    // 업그레이드 전 대입된 프로퍼티 회수
      this.render();           // 최초 1회, 멱등·입양 규칙(§3.3) 준수
      this.#ready = true;
    }
    this.connected?.();
  }

  disconnectedCallback() {
    for (const b of this.#behaviors) b.destroy();
    this.#behaviors.clear();
    this.disconnected?.();
  }

  attributeChangedCallback(_n: string, oldV: string | null, newV: string | null) {
    if (oldV !== newV && this.#ready) this.requestUpdate();
  }

  /** 마이크로태스크 배칭 — 같은 태스크의 다중 변경은 update() 1회 */
  requestUpdate() {
    if (this.#updateQueued) return;
    this.#updateQueued = true;
    queueMicrotask(() => { this.#updateQueued = false; this.update(); });
  }

  /** CustomEvent 발행 규약(§1.5)의 단일 진입점 */
  emit<T>(name: `jd-${string}`, detail?: T, opts?: { cancelable?: boolean }): boolean {
    return this.dispatchEvent(new CustomEvent(name, {
      detail, bubbles: true, composed: false, cancelable: opts?.cancelable ?? false,
    }));
  }

  /** Behavior 소유 등록 — disconnected 시 자동 destroy */
  protected own<B extends { destroy(): void }>(b: B): B { this.#behaviors.add(b); return b; }

  /** 최초 연결 시 1회. DOM 골격 구성(멱등·입양) + 스타일 채택 */
  protected abstract render(): void;
  /** 프로퍼티/attribute 변경 반영. render() 이후 임의 횟수 */
  protected update(): void {}
  protected connected?(): void;
  protected disconnected?(): void;
}
```

`static props` 선언으로부터 베이스가 클래스 프로토타입에 접근자를 생성한다(생성자 실행 시 1회, 클래스 단위 캐시). setter는 내부 값 갱신 → `reflect`면 attribute 되쓰기 → `requestUpdate()`.

### 1.3 attribute ↔ property 반영 규칙 (규범)

| 규칙 | 내용 |
|---|---|
| 이름 | attribute는 kebab-case, property는 camelCase. `fullWidth` ↔ `full-width`. 자동 변환, `attribute` 옵션으로 재정의 |
| Boolean | attribute **존재 여부**가 값. `set → toggleAttribute`. `loading=""`도 true |
| Number | `Number(attr)`, NaN이면 default로 폴백 |
| String | 그대로. enum성 문자열(variant 등)은 **reflect: true 기본** — 호스트 속성 셀렉터(`jd-button[variant="danger"]`)가 스타일 훅이기 때문 |
| 복합 데이터(배열·객체·함수) | **attribute 미지원, property 전용**(`attribute: false`). JSON-in-attribute 금지 |
| 우선순위 | 마지막 쓰기 승리. 업그레이드 시점엔 attribute가 초기값, 이후 property 대입이 덮음 |
| 업그레이드 전 프로퍼티 | `#upgradeProps()`: 업그레이드 전에 인스턴스에 직접 대입된 own property를 delete 후 setter로 재대입 (표준 CE 함정 대응) |

**JSON-in-attribute 금지 근거**: 직렬화 비용, escaping 사고, SSR diff 노이즈. 데이터는 property로, 선언적 초기화가 꼭 필요한 곳(예: `<jd-chart>`)은 자식 `<script type="application/json">` 슬롯 패턴을 개별 스펙에서 허용한다.

### 1.4 라이프사이클 요약

```
constructor            → 접근자 설치만. DOM/attribute 접근 금지 (CE 스펙 + SSR 규칙 §3)
connectedCallback      → [최초] upgradeProps → render() → connected()
                         [재연결] connected()만 (render는 1회)
attributeChanged       → requestUpdate() → (microtask) update()
property set           → (reflect) → requestUpdate() → update()
disconnectedCallback   → own() 등록 Behavior 전부 destroy → disconnected()
```

`render()`는 **골격 1회**, `update()`는 **상태 반영 N회**로 역할을 고정한다. VDOM/diff 없음 — update()는 명령형으로 필요한 노드만 만진다. 근거: 의존성 0에서 diff 엔진 자작은 비용 대비 무익하고, 컴포넌트당 만질 노드는 소수다. 리스트형(Table, VirtualScroll)은 컴포넌트 내부에서 키 기반 재사용을 개별 구현한다.

### 1.5 이벤트 규약

- **이름**: `jd-` 접두 + kebab-case. 전 컴포넌트 공통 canonical 셋을 우선 사용:
  `jd-change`(값 확정) · `jd-input`(실시간 입력) · `jd-open` / `jd-close`(열림 상태 변화 **후**) · `jd-select` · `jd-dismiss` · `jd-remove` · `jd-load` / `jd-error`.
- **형태**: 항상 `CustomEvent`, `bubbles: true`, `composed: false`(shadow 없음 — 명시적으로 false 고정), payload는 `detail`에만.
- **취소 가능성**: 과거형(사후 통지) 이벤트는 `cancelable: false`. 진행을 막을 수 있어야 하는 지점은 요청형 `jd-request-*`(예: `jd-request-close`)로 분리하고 그것만 `cancelable: true`. `preventDefault()`되면 컴포넌트는 상태 변화를 중단한다.
- **네이티브 이벤트 재정의 금지**: 내부 네이티브 요소의 `click`/`input`/`change`는 그대로 버블시키고, JunDS 의미가 더해질 때만 `jd-*`를 추가 발행한다(예: `<jd-select>`의 `jd-change`는 정규화된 `{ value }`를 detail로).

각 컴포넌트의 이벤트 표는 컴포넌트 스펙(후속 문서)에서 `이름 / detail 타입 / cancelable / 발행 시점` 4열로 고정 기술한다.

### 1.6 disabled · 폼 연동

**결정: 2단 전략.**

1. **네이티브 위임(기본)** — 폼 컨트롤 대부분(Button, Input, Checkbox, Slider, Textarea…)은 light DOM 내부에 **진짜 네이티브 요소 1개**(`<button>`, `<input>`…)를 렌더한다. light DOM이므로 내부 `<input name="…">`은 조상 `<form>`에 **그냥 참여한다** — value 직렬화, 제출, `:invalid`, 라벨 연결 전부 공짜. `disabled`는 호스트 프로퍼티를 내부 요소로 전파(reflect)한다.
   **근거**: 이것이 light DOM을 선택한 최대 실리다. ElementInternals 재구현 없이 폼 의미론·접근성·IME·자동완성이 브라우저 기본으로 동작한다.

2. **ElementInternals(예외)** — 네이티브 등가물이 없는 값 보유 컨트롤(Rating, TagInput, SegmentedControl, PinInput 합성값, ColorPicker 등)만 사용:

```ts
export abstract class JdFormElement extends JdElement {
  static formAssociated = true;
  protected internals = this.attachInternals();

  /** 서브클래스는 값 변경 시 반드시 호출 */
  protected setFormValue(v: string | FormData | null) { this.internals.setFormValue(v); }
  formDisabledCallback(disabled: boolean) { this.requestUpdate(); }
  formResetCallback() { /* 서브클래스: 초기값 복원 */ }
  get form() { return this.internals.form; }
}
```

`ElementInternals`·`formAssociated`는 Safari 16.4+에서 가용(DEC-004 지원선과 일치). 검증 메시지는 `internals.setValidity()`로 네이티브 검증 파이프라인에 합류시킨다.

---

## 2. 등록 전략

**결정: 컴포넌트 모듈 import 시 자동 define + 명시적 `defineJunds()` 병행. 등록은 전부 `defineElement()` 가드를 통과한다.**

```ts
// core/define.ts
export function defineElement(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements === "undefined") return;        // SSR/Node no-op
  const existing = customElements.get(tag);
  if (existing) {
    if (existing !== ctor) {
      console.warn(`[junds] <${tag}> 태그가 이미 다른 클래스로 정의되어 있어 건너뜁니다. `
        + `JunDS 중복 번들(버전 충돌) 가능성을 확인하세요.`);
    }
    return; // 선등록 승리 — 예외를 던지지 않는다
  }
  customElements.define(tag, ctor);
}
```

- **파일 분리**: 각 컴포넌트는 `element.ts`(클래스만, 부작용 0)와 `index.ts`(클래스 import + `defineElement(JdButton.tag, JdButton)` 부작용) 2파일. `@junds/web/button`을 import하면 정의까지 끝난다. 커스텀 태그명이 필요하거나 정의 시점을 제어하려는 소비자는 `@junds/web/button/element`에서 클래스만 가져간다.
- **`defineJunds()`**: 전체 정의 진입점. 루트 `@junds/web/define` 모듈이 전 컴포넌트 index를 import하는 것과 등가이며, 부분 등록도 지원한다:

```ts
import { defineJunds } from "@junds/web/define";
defineJunds();                       // 390종 전량
defineJunds([JdButton, JdModal]);    // 부분
defineJunds([JdButton], { prefix: "x" }); // <x-button> — 멀티 버전 공존 탈출구
```

- **충돌 정책 근거**: CE 레지스트리는 태그당 1클래스 강제(재정의 시 throw)이므로, 마이크로프론트엔드/중복 번들 상황에서 앱을 죽이지 않으려면 "선등록 승리 + 경고"가 유일한 안전 기본값이다. 완전 격리가 필요하면 `prefix` 옵션이 출구다(태그명은 스타일시트의 호스트 셀렉터와 연동되므로, prefix 사용 시 `junds.css` 대신 prefix 인지 빌드가 필요함을 문서화한다 — v3.x 과제로 명시).

---

## 3. SSR / SSG 안전성

### 3.1 모듈 평가 규칙 (규범 — 전 파일 적용)

1. **모듈 톱레벨에서 `window`/`document`/`navigator`/`customElements`의 *사용* 금지.** `typeof window !== "undefined"` 탐지만 허용. → `import "@junds/web/button"`이 Node·SSR 번들에서 그냥 평가된다(정의는 no-op).
2. **`constructor`에서 DOM 읽기/쓰기·attribute 접근 금지** (CE 스펙 요구이기도 함). 모든 DOM 작업은 `connectedCallback` 이후.
3. **`render()`/`update()`는 결정적**: `Math.random()`·`Date.now()` 직접 사용 금지, 네트워크/스토리지 접근 금지. 랜덤·시간이 필요한 표현(Confetti, Clock)은 `connected()` 이후 rAF/타이머에서 시작한다.
4. **`CSSStyleSheet` 생성은 지연**: css 모듈은 팩토리를 export하고 시트는 첫 `adoptStyles()` 호출 때 만든다(§4.2). Node에는 생성자가 없다.

이 4가지는 MySelf 갤러리 운영에서 실증된 제약("SSG 헤드리스 Chrome이라 render 단계 브라우저 API/랜덤 금지" — 00-inventory §6 횡단 리스크 (3))을 라이브러리 규범으로 승격한 것이다. ESLint 커스텀 룰(`no-toplevel-dom`)로 강제한다.

### 3.2 FOUC 방지 — `:defined`

업그레이드 전 커스텀 엘리먼트는 스타일 없는 인라인 요소다. 대응:

```css
@layer junds.base {
  /* 업그레이드 전 기본 박스 — 태그별 display만 선지정 */
  jd-button:not(:defined) { display: inline-flex; }
  jd-modal:not(:defined), jd-drawer:not(:defined) { display: none; }
}
```

light DOM + 클래스 스타일링이라 **SSR로 내부 골격까지 그려진 마크업은 업그레이드 전에도 이미 완성된 스타일을 받는다**(`.jd-button` 규칙은 정의 여부와 무관하게 적용). `:not(:defined)` 규칙은 "빈 호스트만 있는 클라이언트 전용 HTML" 경로의 최소 보정일 뿐이다. 오버레이류(Modal 등)는 업그레이드 전 `display: none`으로 내용 번쩍임을 차단한다.

### 3.3 렌더 멱등성과 "입양(adopt)" 규칙 (규범)

`render()`는 **이미 존재하는 내부 골격을 발견하면 새로 만들지 않고 입양**해야 한다:

```ts
protected render() {
  adoptStyles(buttonStyles);
  this.#btn = this.querySelector<HTMLButtonElement>(":scope > button.jd-button")
    ?? this.#buildSkeleton();   // 없을 때만 생성 + 기존 children 이동
  this.update();
}
```

근거: (1) SSR/프리렌더가 만든 DOM 위에서 업그레이드가 일어나도 DOM이 재구축되지 않아 깜빡임·포커스 유실·hydration mismatch가 없다. (2) React 어댑터(§11)가 내부 구조를 직접 렌더해도 이중 렌더가 발생하지 않는다.

### 3.4 MySelf 독스 headless Chrome 프리렌더에서 안전한 이유

MySelf 독스(D7: `/docs/junds` 단일 페이지 + `?c=` 라우팅)는 headless Chrome으로 페이지를 실행해 스냅샷을 뜬다. 이 파이프라인에서 v3가 안전한 근거:

1. 프리렌더 중 실제 Chrome이므로 CE 업그레이드가 **일어난다** — 그러나 §3.1-3의 결정적 render + 입양 규칙 덕에 산출 HTML이 실행 시점과 무관하게 동일하다(스냅샷 diff 안정).
2. 스냅샷된 HTML을 실제 방문자가 받으면, 같은 render()가 기존 골격을 입양하므로 재실행이 무해하다.
3. `adoptedStyleSheets`는 HTML로 직렬화되지 않는다 — 방문자 브라우저에서 `adoptStyles()`가 다시 채우므로 문제없고, JS 이전 구간은 정적 `junds.css`(§6) + `:not(:defined)`가 커버한다.
4. 애니메이션·타이머는 `connected()` 이후에만 시작하므로(§3.1-3) 스냅샷 시점에 비결정 DOM이 없다. hidden 탭에서 rAF가 멎는 프리뷰 함정도 render 단계에는 무관해진다.

---

## 4. 스타일 전략

### 4.1 결정

- 컴포넌트 CSS는 **constructable stylesheet**로 만들고 `document.adoptedStyleSheets`에 **문서 단위 1회** 주입한다(중복 채택 방지 레지스트리).
- 전 규칙은 `@layer junds` 안, 내부 계층은 `junds.tokens → junds.base → junds.components` 3단.
- 클래스·CSS 변수는 전부 `jd-` / `--jd-` 접두. 호스트는 태그+속성 셀렉터, 내부 노드는 `.jd-*` 클래스.

**근거**: (1) adoptedStyleSheets는 `<style>` 주입과 달리 파싱 1회·CSP `style-src` 인라인 예외 불필요·중복 제어가 명시적이다(Safari 16.4+ 가용). (2) 레이어에 담긴 규칙은 **레이어 밖 소비자 CSS에 항상 진다** — 특이도 전쟁 없이 오버라이드가 성립하므로 Shadow DOM 격리의 실질 대체물이 된다.

### 4.2 `css` 태그와 `adoptStyles` — 규범 스케치

```ts
// core/styles.ts
export function css(strings: TemplateStringsArray, ...vals: string[]): JdStyles {
  const text = String.raw(strings, ...vals);
  let sheet: CSSStyleSheet | undefined;
  return {
    text, // 정적 CSS 추출 빌드(§6)가 이 텍스트를 수집
    sheet() {  // 지연 생성 — SSR 안전(§3.1-4)
      if (!sheet) { sheet = new CSSStyleSheet(); sheet.replaceSync(text); }
      return sheet;
    },
  };
}

const adopted = new WeakMap<Document, Set<JdStyles>>();
export function adoptStyles(styles: JdStyles, doc: Document = document): void {
  let set = adopted.get(doc);
  if (!set) adopted.set(doc, (set = new Set()));
  if (set.has(styles)) return;                      // 문서당 1회
  set.add(styles);
  doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, styles.sheet()];
}
```

레이어 순서 선언은 라이브러리가 가장 먼저 채택하는 시트 1장이 담당한다:

```css
@layer junds.tokens, junds.base, junds.components;
```

(정적 `junds.css`에도 같은 선언이 1행으로 선두에 온다. `@layer` 선언은 멱등이라 이중 로드 무해.)

### 4.3 컴포넌트 CSS 작성 규약

```ts
// components/button/button.css.ts
import { css } from "../../core/styles.js";
export default css`
@layer junds.components {
  jd-button { display: inline-flex; }
  jd-button[full-width] { display: flex; width: 100%; }

  .jd-button {
    display: inline-flex; align-items: center; justify-content: center;
    gap: var(--jd-space-2); height: var(--jd-size-control-md);
    padding-inline: var(--jd-space-5); border-radius: var(--jd-radius-full);
    font: var(--jd-font-label-md); color: var(--jd-color-on-accent);
    background: var(--jd-color-accent);
    transition: filter .2s var(--jd-ease-out), scale .2s var(--jd-ease-out);
  }
  .jd-button:disabled { opacity: .4; pointer-events: none; }
  .jd-button:focus-visible { outline: 2px solid var(--jd-color-focus); outline-offset: 2px; }

  jd-button[variant="danger"] > .jd-button { background: var(--jd-color-danger); }
  jd-button[variant="ghost"]  > .jd-button { background: transparent; color: var(--jd-color-text); }
  jd-button[size="sm"] > .jd-button { height: var(--jd-size-control-sm); font: var(--jd-font-label-sm); }
}`;
```

- variant/size 분기는 **호스트 속성 셀렉터 → 자식 조합자**로 처리한다(reflect가 스타일 훅). update()에서 클래스 토글로 중복 관리하지 않는다 — DOM 조작 최소화.
- 값은 원칙적으로 `--jd-*` 토큰만 사용. 리터럴 색·픽셀은 컴포넌트 고유 지오메트리에 한해 허용(02-tokens에서 토큰 목록 확정).
- 기존 v2의 Tailwind 유틸(예: Button.tsx의 `variantStyles` 문자열)은 이 형태의 컴포넌트 CSS로 **의미 번역**한다 — 클래스 문자열 기계 변환 금지(00-inventory 횡단 리스크 (1)의 정면 해소 경로).

### 4.4 소비자 오버라이드 시나리오

```css
/* (a) 토큰 오버라이드 — 전역 리브랜딩. 레이어 불필요 */
:root { --jd-color-accent: oklch(60% .19 255); --jd-radius-full: 10px; }

/* (b) 국소 오버라이드 — 레이어 밖 규칙은 특이도 무관하게 junds 레이어를 이긴다 */
.checkout jd-button[variant="primary"] > .jd-button { box-shadow: none; }

/* (c) 소비자가 자기 CSS도 레이어로 관리하는 경우 — junds보다 뒤에 선언하면 승리 */
@layer junds, app;
@layer app { jd-button > .jd-button { letter-spacing: .01em; } }
```

라이브러리는 `!important`를 쓰지 않는다(규범). 오버라이드 서열이 항상 "소비자 > junds"로 유지되는 것이 이 전략의 계약이다.

---

## 5. Behavior 스펙 (hooks 62 → 51 전환)

### 5.1 규약

DEC-006 D2 확정 시그니처:

```ts
export interface Behavior<Opts = void> {
  update?(next: Partial<Opts>): void;  // 옵션 변경 반영 (재생성 없이)
  destroy(): void;                     // 멱등 — 2회 호출 무해
}
export type BehaviorFactory<E extends Element, Opts, Extra = {}> =
  (el: E, opts?: Opts) => Behavior<Opts> & Extra;
```

- **즉시 활성**: `createXxx()` 호출 즉시 리스너/옵저버가 붙는다. 지연 시작이 필요한 것만 `{ activate, deactivate }`를 Extra로 노출(focus trap 등).
- **정리 책임**: create에서 등록한 모든 리스너·옵저버·타이머는 destroy가 회수한다. 컴포넌트 안에서는 반드시 `this.own(createXxx(...))`으로 감싸 disconnected 시 자동 회수(§1.2).
- **DOM 소유권**: Behavior는 대상 엘리먼트의 **서브트리 구조를 변경하지 않는다** — attribute·클래스·리스너·측정만. 구조를 만드는 것은 컴포넌트의 render() 몫이다. (예외: announcer처럼 `document.body`에 자기 소유 노드를 만드는 문서 싱글턴 — §8)
- **이벤트**: Behavior가 상태 변화를 알릴 때는 대상 엘리먼트에 `jd-*` CustomEvent를 dispatch하거나(§1.5 규약 동일), 구독형이면 `subscribe(cb): unsubscribe`를 Extra로 노출한다. 둘 다 제공하지 않는다(중복 API 금지) — DOM 문맥이 있으면 이벤트, 없으면(미디어쿼리·네트워크 등 전역 감시) subscribe.
- **순수 유틸 강등**: 엘리먼트 문맥이 없는 훅(debounce, throttle, copyText, cookie…)은 Behavior가 아니라 일반 함수로 제공한다.

### 5.2 매핑표

hooks 62개 전수의 Behavior/유틸/N-A 판정과 iOS 등가물은 **[00-inventory.md §4](./00-inventory.md)** 가 단일 소스다(존속 51 · 내부화/React 전용 11 · 중복 통합 4쌍). 이 문서에서 표를 중복 유지하지 않는다.

### 5.3 사용 예 (컴포넌트 내부 / 독립 사용)

```ts
// 컴포넌트 내부 — Modal
protected connected() {
  this.own(createFocusTrap(this.#panel, { initialFocus: "[data-autofocus]" }));
  this.own(createClickOutside(this.#panel, () => this.#requestClose("outside")));
}

// 라이브러리 없이 앱 코드에서 독립 사용
import { createScrollSpy } from "@junds/web/behaviors/scroll-spy";
const spy = createScrollSpy(document.querySelectorAll("main h2"), { offset: 96 });
spy.subscribe((id) => history.replaceState(null, "", `#${id}`));
// SPA 라우트 이탈 시: spy.destroy();
```

---

## 6. 패키징

### 6.1 결정

`packages/web` = **`@junds/web`**, `"type": "module"`, 런타임 의존성 0. 배포 형태 3종:

1. **컴포넌트별 ESM** — `@junds/web/button` (자동 define) / `@junds/web/button/element` (클래스만).
2. **단일 파일 CDN** — `dist/cdn/junds.js`(ESM, 전량 define) + `dist/cdn/junds.global.js`(IIFE, `window.JunDS` 네임스페이스). `<script>` 한 줄 소비용.
3. **정적 CSS** — `dist/junds.css`(전체) + `dist/css/button.css`(컴포넌트별). §4.2의 `css` 태그 `text`를 빌드타임 수집해 생성한다. adoptedStyleSheets 경로와 내용이 동일하며, JS 이전 렌더 구간·프리렌더 스냅샷·非JS 문서용.

### 6.2 exports 맵 (스크립트 생성)

```jsonc
{
  "name": "@junds/web",
  "type": "module",
  "sideEffects": ["./dist/define.js", "./dist/components/*/index.js", "./dist/cdn/*", "./dist/**/*.css"],
  "exports": {
    ".":            "./dist/index.js",              // 클래스·유틸·Behavior 전부 re-export (부작용 0)
    "./define":     "./dist/define.js",             // defineJunds + 전량 자동 define (부작용)
    "./button":           "./dist/components/button/index.js",
    "./button/element":   "./dist/components/button/element.js",
    // …컴포넌트 388종 동형 — scripts/gen-exports.mjs 가 components/ 디렉터리에서 생성
    "./behaviors":   "./dist/behaviors/index.js",
    "./behaviors/*": "./dist/behaviors/*.js",
    "./icons/*":     "./dist/icons/*.js",
    "./junds.css":   "./dist/junds.css",
    "./css/*":       "./dist/css/*"
  }
}
```

- **트리셰이킹**: 루트 `"."`와 `element.js`·behavior 모듈은 부작용 0(순수)이다. 부작용은 `index.js`(define)와 CDN 번들에만 존재하며 `sideEffects` 배열로 정확히 선언한다. 결과: `import { JdButton } from "@junds/web"` 후 번들러가 미사용 컴포넌트를 전부 탈락시킬 수 있고, `import "@junds/web/button"`은 정의 부작용이 보존된다.
- **exports 맵 수기 관리 금지**: 390여 엔트리는 `scripts/gen-exports.mjs`가 디렉터리 구조에서 생성하고 CI에서 drift를 검사한다(MySelf의 projectDocsMap.test와 같은 강제 패턴).
- 기존 `@junds/ui`(v2)의 카테고리 배럴(`/primitives`, `/composites`…)은 **web에서 계승하지 않는다**. 카테고리는 문서 분류일 뿐 번들 경계가 아니며, v2 호환 표면은 packages/react 어댑터가 담당한다(§11).

### 6.3 finance UI

finance UI 86종도 동일 규약의 컴포넌트다(`<jd-live-ticker>` 등, `@junds/web/live-ticker`). 데이터 연동은 DEC-003대로 `@junds/finance-data`로 분리 — 컴포넌트는 property/메서드로 데이터를 **받기만** 하고(예: `el.data = ticks`), fetch·구독 로직을 갖지 않는다. 이로써 web 패키지의 의존성 0이 finance 포함 상태로 성립한다.

---

## 7. 의존성 대체 설계 3종

### 7.1 `cn()` → `cx()` 자체 유틸 (clsx + tailwind-merge 대체)

**결정**: clsx 동형의 초경량 `cx()`를 자체 구현하고, tailwind-merge는 **무대체 폐기**한다.
**근거**: twMerge의 존재 이유는 Tailwind 유틸 충돌 해소인데 v3는 Tailwind를 쓰지 않는다(§4.3). 남는 요구는 조건부 클래스 조합뿐이며 15줄이면 된다. v2에서 cn을 쓰던 273개 파일의 관심사는 React 어댑터·마이그레이션 층에서 `cx`로 일괄 치환된다(시그니처 동일).

```ts
// core/cx.ts — 전체 구현 (규범)
export type ClassValue =
  | string | number | null | undefined | false
  | ClassValue[] | Record<string, unknown>;

export function cx(...args: ClassValue[]): string {
  let out = "";
  for (const a of args) {
    if (!a) continue;
    if (typeof a === "string" || typeof a === "number") out += (out && " ") + a;
    else if (Array.isArray(a)) { const s = cx(...a); if (s) out += (out && " ") + s; }
    else for (const k in a) if (a[k]) out += (out && " ") + k;
  }
  return out;
}
```

바닐라 컴포넌트 내부에서는 `el.classList.toggle()`을 우선하고, cx는 문자열 조립이 실제로 편한 지점(초기 골격 생성, React 어댑터)에서만 쓴다.

### 7.2 lucide-react → 빌드타임 자체 SVG 아이콘 파이프라인

**결정**: 소스 오브 트루스는 `packages/web/icons/svg/*.svg`(자체 드로잉 24×24, stroke 기반), 빌드 스크립트가 아이콘별 ESM 모듈을 생성한다. 런타임 fetch 없음, 폰트 없음.

```
icons/svg/check.svg ──┐
icons/aliases.json ───┤→ scripts/build-icons.mjs (svgo 최적화·뷰박스 검증·이름 규약 검사)
                      └→ dist/icons/check.js:  export const checkIcon = { name:"check", svg:"<svg …>" }
                         dist/icons/index.js:  전량 re-export (트리셰이킹 가능)
```

소비 2경로:

```ts
// (a) 직접 — 트리셰이킹 최선. 컴포넌트 내부 사용 표준
import { checkIcon } from "@junds/web/icons/check";
node.innerHTML = checkIcon.svg;

// (b) 선언적 — <jd-icon name="check">. 명시 등록제(자동 전량 로드 금지)
import { registerIcons } from "@junds/web/icon";
registerIcons(checkIcon, chevronDownIcon);
```

CDN 번들만 전량 자동 등록한다. `icons/aliases.json`은 v2 finance `AppIcon`이 쓰던 lucide 이름 → jd 이름 대응표(예: `ChevronsUpDown → chevrons-up-down`)로, React 어댑터의 무수정 마이그레이션을 보장한다. **초기 아이콘 셋 범위 = AppIcon.tsx가 실제 import하는 이름 전수 + primitives/Icon 기존 자체분**(전 lucide 미러링 금지 — 필요분만 드로잉).
svgo 규칙: `fill`/`stroke`는 `currentColor` 강제, width/height 제거(뷰박스만), `aria-hidden="true"` 기본 부여.

### 7.3 valibot → 제거 (수기 파서)

**결정**: valibot을 **제거**하고 `runtime/schema.ts`의 PageDoc/ActionNode/PropValue 스키마를 경로 추적 수기 파서로 재작성한다. 범용 마이크로 검증 라이브러리 자작은 하지 않는다.
**근거**: valibot 사용처는 runtime 파서 1파일뿐(00-inventory §2)이고, 대상 스키마는 닫힌 유한 집합이다. 콤비네이터의 가치(스키마 재사용·추론)는 이 규모에서 수기 함수의 단순성을 이기지 못하며, 의존성 0 원칙과 일치한다.

```ts
// runtime/parse.ts — 패턴 규범
export class JdParseError extends Error {
  constructor(public path: string[], msg: string) { super(`${path.join(".")}: ${msg}`); }
}

export function parseActionNode(x: unknown, path: string[]): ActionNode {
  const o = expectObject(x, path);
  switch (expectString(o.kind, [...path, "kind"])) {
    case "noop":     return { kind: "noop" };
    case "navigate": return { kind: "navigate", to: expectNonEmpty(o.to, [...path, "to"]) };
    case "setState": return { kind: "setState",
      path: expectNonEmpty(o.path, [...path, "path"]),
      value: parsePropValue(o.value, [...path, "value"]) };
    // …variant별 1 case. 미지 kind는 JdParseError
    default: throw new JdParseError([...path, "kind"], `알 수 없는 action kind`);
  }
}
```

TS 타입(`ActionNode` 등)은 현행 schema.ts의 수기 타입을 그대로 이관한다(이미 Infer에 의존하지 않는 명시 타입이 병존함). runtime 트랙이 커져 스키마가 열린 집합이 되면 그때 80줄급 콤비네이터로 승격을 재심의한다 — G0에서는 하지 않는다.

---

## 8. 접근성 규약 — Behavior 공용화

**결정**: 포커스·키보드·ARIA 상태 관리는 `a11y/` 계층의 공용 Behavior 5종으로 강제 일원화한다. 컴포넌트가 개별 재구현하는 것을 리뷰 규칙으로 금지한다.

| Behavior | 시그니처 | 담당 |
|---|---|---|
| `createFocusTrap(container, opts)` | `{ activate, deactivate, destroy }` | Tab 순환 감금, initialFocus, 복귀 포커스. Modal/Drawer/CommandPalette/Tour |
| `createRovingTabindex(container, opts)` | `{ update, destroy }` — opts: `{ selector, orientation: "horizontal"\|"vertical"\|"grid", wrap }` | 화살표 내비 + `tabindex 0/-1` 관리. Tabs/Menubar/RadioGroup/SegmentedControl/TreeView/DataGrid |
| `createDismissable(el, onDismiss, opts)` | `{ destroy }` | Esc + 클릭아웃 + (opt) 스크롤 dismiss 통합. Popover/Dropdown/Tooltip/ContextMenu |
| `createListNavigation(input, listbox, opts)` | `{ destroy }` | `aria-activedescendant` 방식 콤보박스 내비. AutoComplete/Combobox/MultiSelect/Mention |
| `announce(message, opts)` | 문서 싱글턴 유틸 | `aria-live` 리전(`polite`/`assertive`)을 body에 1회 생성 후 재사용. v2 AnnouncerProvider 대체 |

- **light DOM 이점의 명문화**: `aria-labelledby`/`aria-controls`/`aria-activedescendant`의 id 참조가 컴포넌트 경계를 넘어 자유롭다(shadow 경계 없음). id는 `jd-uid()` 유틸(문서 단위 증분 카운터 — `Math.random` 금지 §3.1)로 발급한다.
- **ARIA 패턴 준거**: 각 인터랙티브 컴포넌트 스펙은 WAI-ARIA APG 패턴명을 명시하고(예: Tabs → "Tabs Pattern": `role=tablist/tab/tabpanel` + roving), 어떤 공용 Behavior 조합으로 충족하는지 적는다. role·aria 속성 부여는 render()/update()의 의무이고, 키보드·포커스 동작은 위 Behavior의 의무다.
- **포커스 링**: `:focus-visible` + `--jd-color-focus` 토큰으로 통일(§4.3). `outline: none` 후 자체 링 재구현 금지.
- `prefers-reduced-motion`은 컴포넌트 CSS가 미디어쿼리로 직접 존중하고, JS 주도 애니메이션은 `createReducedMotionWatcher`를 구독한다.

---

## 9. 테스트 전략

### 9.1 결정

| 층 | 도구 | 대상 |
|---|---|---|
| 단위 | **vitest + happy-dom** | 반영 규칙, 이벤트 발행, render 멱등성/입양, Behavior 수명주기, 파서·유틸 |
| 상호작용 | **Playwright** (기존 루트 `playwright.config.ts`에 프로젝트 추가) | 포커스 트랩, roving, 키보드 내비, 폼 제출, `:defined` FOUC, adoptedStyleSheets 실적용 |
| a11y 감사 | **vitest + axe-core** — 기존 `vitest.a11y.config.ts` 패턴 재활용 | 컴포넌트별 렌더 결과 axe 스캔 |

**근거**: happy-dom은 Custom Elements v1·`attachInternals`를 지원하고 jsdom보다 빠르다(기존 v2 설정의 jsdom은 React 테스트 유산 — web 패키지는 happy-dom으로 간다). 단, adoptedStyleSheets의 실제 계산 스타일·포커스 순서는 DOM 시뮬레이터가 보증하지 못하므로 상호작용층은 실브라우저(Playwright) 의무.

### 9.2 vitest.a11y.config.ts 재활용

루트의 기존 파일은 "별도 config로 감사 스위트를 일반 `npm test`에서 배제하고 `audit:a11y`로만 돌린다"는 **패턴**이 자산이다. web 패키지에 동형 이식:

```ts
// packages/web/vitest.a11y.config.ts — react 플러그인 제거, 환경 교체 외 동형
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],   // 전 컴포넌트 defineJunds() 1회
    include: ["__tests__/a11y/**/*.test.ts"],
    css: false,
  },
});
```

light DOM이라 axe가 shadow 관통 없이 전체 트리를 그대로 스캔한다 — v2 대비 감사 신뢰도가 오히려 오른다. 감사 케이스는 v2 `ds/__tests__/a11y`의 시나리오(역할·이름·상태 존재 검증)를 태그 기반으로 포팅한다.

### 9.3 규범 단위 테스트 형태

```ts
test("jd-button: loading이면 내부 button이 disabled + aria-busy", async () => {
  document.body.innerHTML = `<jd-button loading>저장</jd-button>`;
  const el = document.querySelector<JdButton>("jd-button")!;
  await customElements.whenDefined("jd-button");
  await Promise.resolve(); // microtask 배칭 플러시
  const btn = el.querySelector("button.jd-button")!;
  expect(btn.disabled).toBe(true);
  expect(btn.getAttribute("aria-busy")).toBe("true");
});
```

실행 환경: nvm Node 22 계열(기존 레포 관례). CI 게이트 = `vitest run` + Playwright 상호작용 스위트 + `audit:a11y` + gen-exports drift 검사(§6.2).

---

## 10. 규범 예시 — JdButton 정본

베이스클래스 사용 패턴의 정본. 이후 모든 컴포넌트는 이 형태를 따른다.

### 10.1 `components/button/element.ts` (전체 스케치)

```ts
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import buttonStyles from "./button.css.js";

const SPINNER_SVG =
  `<svg class="jd-button__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

export class JdButton extends JdElement {
  static tag = "jd-button";
  static props = {
    variant:   { type: String,  default: "primary", reflect: true }, // §1.3 enum → reflect
    size:      { type: String,  default: "md",      reflect: true },
    type:      { type: String,  default: "button" },
    loading:   { type: Boolean, reflect: true },
    disabled:  { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, reflect: true },                     // attr: full-width
  };

  declare variant: string; declare size: string; declare type: string;
  declare loading: boolean; declare disabled: boolean; declare fullWidth: boolean;

  #btn!: HTMLButtonElement;

  protected render() {
    adoptStyles(buttonStyles);
    // 입양 규칙(§3.3): SSR/어댑터가 그린 골격이 있으면 재사용
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-button");
    this.#btn = existing ?? this.#build();
    this.update();
  }

  #build(): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = "jd-button";
    b.append(...this.childNodes);   // 사용자가 쓴 children을 내부 button으로 이동
    this.append(b);
    return b;
  }

  protected update() {
    const b = this.#btn;
    b.type = this.type as "button" | "submit" | "reset";
    b.disabled = this.disabled || this.loading;   // 네이티브 위임(§1.6-1)
    b.toggleAttribute("aria-busy", this.loading);
    let spin = b.querySelector(":scope > .jd-button__spinner");
    if (this.loading && !spin) b.insertAdjacentHTML("afterbegin", SPINNER_SVG);
    else if (!this.loading && spin) spin.remove();
    // variant/size/fullWidth는 reflect된 호스트 속성 → CSS가 처리. JS 분기 없음(§4.3)
  }
}
```

주해: (1) 클릭 이벤트는 내부 네이티브 `<button>`의 `click`이 그대로 버블된다 — `jd-click` 같은 재발명 금지(§1.5). (2) `<form>` 안에서 `type="submit"` 제출이 공짜로 동작한다(§1.6-1). (3) `disabled` 시 네이티브 `click` 미발행도 공짜. (4) v2의 leftIcon/rightIcon/asChild는 React 어댑터 관심사(§11) — 바닐라 HTML에서는 children에 `<jd-icon>`을 직접 쓴다.

### 10.2 `components/button/index.ts`

```ts
import { JdButton } from "./element.js";
import { defineElement } from "../../core/define.js";
export { JdButton };
defineElement(JdButton.tag, JdButton);   // §2 — SSR no-op·충돌 가드 내장
```

### 10.3 소비자 사용 3종

```html
<!-- (1) HTML만 — CDN IIFE. 빌드 도구 0 -->
<link rel="stylesheet" href="https://cdn.example.com/junds@3/junds.css">
<script src="https://cdn.example.com/junds@3/junds.global.js" defer></script>

<form action="/save" method="post">
  <jd-button type="submit" variant="primary" size="lg">저장</jd-button>
  <jd-button variant="ghost" full-width>취소</jd-button>
</form>
```

```ts
// (2) ESM — 번들러. 쓰는 것만 정의·번들
import "@junds/web/button";
import "@junds/web/junds.css"; // 또는 css/button.css

const btn = document.querySelector("jd-button")!;
btn.loading = true;
btn.addEventListener("click", onSave);
```

```html
<!-- (3) CDN ESM — 모던 브라우저 직접 -->
<script type="module">
  import { JdButton, defineJunds } from "https://cdn.example.com/junds@3/junds.js";
  defineJunds([JdButton]);
  document.body.insertAdjacentHTML("beforeend",
    `<jd-button variant="danger">삭제</jd-button>`);
</script>
```

---

## 11. React 어댑터 원리 (packages/react — 개요)

**결정**: v3의 `@junds/react`는 자체 렌더 구현을 버리고 **바닐라 코어를 감싸는 얇은 래퍼**가 되며, v2 `@junds/ui`의 API 표면(프롭명·이벤트명·타입)을 유지한다. 상세는 후속 스펙(0x-react-adapter)에서 확정하고 여기서는 원리만 규범화한다.

```tsx
// 어댑터 공장 — 원리 스케치
const Button = wrapElement(JdButton, {
  tag: "jd-button",
  props: ["variant", "size", "loading", "disabled", "fullWidth", "type"],
  events: {},                          // 예: Modal이면 { onOpenChange: "jd-close" } 식 매핑
  compose: composeButtonChildren,      // leftIcon/rightIcon/asChild 등 React 전용 프롭 처리
});
```

동작 원리 4개 축:

1. **속성 → props**: 선언된 프롭은 ref 이펙트에서 **property 대입**으로 전달한다(attribute 아님 — 복합 데이터·boolean 정합 §1.3). 나머지 미지 프롭은 attribute/`className`/`style` passthrough. `ref`는 호스트 엘리먼트로 forward.
2. **이벤트 → onXxx**: `events` 매핑표에 따라 `onChange ↔ jd-change`처럼 `addEventListener`를 이펙트로 관리한다. 네이티브 이벤트(onClick 등)는 React 위임이 그대로 동작하므로 매핑 불필요.
3. **children과 골격**: 어댑터가 내부 골격(예: `<button class="jd-button">`)을 **React 트리로 직접 렌더**하고, 업그레이드된 element.render()는 입양 규칙(§3.3)에 따라 그 골격을 재사용한다 — React가 children의 소유권을 유지하므로 리렌더와 충돌하지 않고, `leftIcon`/`asChild`(Slot) 같은 React 전용 합성은 어댑터 층에서 v2 코드 그대로 수행된다.
4. **SSR(Next)**: 어댑터가 완성 골격을 서버 HTML로 내보내므로 hydration 전에도 스타일 완성 상태(§3.2). 클라이언트에서 CE 업그레이드는 골격 입양으로 끝난다.

이 구조로 v2 소비 코드(`<Button variant="primary" loading>`)는 무수정 컴파일되고, 시각·동작의 단일 소스는 바닐라 코어 1곳이 된다. React 19의 CE 네이티브 지원이 성숙하면 wrapElement 내부 구현만 얇아진다(표면 불변).

---

## 12. 미결·후속 연결

- 02-tokens: `--jd-*` 토큰 명세와 v2 `ds/tokens`(TS) → CSS vars 이관 경로 (DEC-006 D5 주의사항).
- core/layout 삼중복(Divider·Grid·Stack류) 단일화는 컴포넌트 카탈로그 스펙에서 확정 — 본 문서의 모델은 어느 결정에도 중립.
- `prefix` 재매핑 시 CSS 호스트 셀렉터 대응 빌드(§2)는 v3.x 과제.
- runtime(PageDoc Renderer) 전체 재설계는 별도 트랙 — 본 문서는 valibot 제거 방침(§7.3)까지만 규정.

## 부록 A. 결정 대장 (이 문서 신설분)

| ID | 결정 | 근거 요약 |
|---|---|---|
| WEB-01 | 단일 베이스 JdElement + 선언적 props 맵, 외부 베이스/개별 수제 금지 | 반영·배칭·수명 관리의 390회 중복 제거, 의존성 0 |
| WEB-02 | VDOM 없음 — render() 1회 골격 + update() 명령형 반영 | diff 엔진 자작 무익, 노드 수 소수 |
| WEB-03 | JSON-in-attribute 금지, 복합 데이터는 property 전용 | 직렬화 비용·escaping·SSR diff 노이즈 |
| WEB-04 | 이벤트: 과거형 cancelable 금지 / 요청형 `jd-request-*`만 cancelable | 취소 의미론 명확화 |
| WEB-05 | 폼: 네이티브 위임 기본, ElementInternals는 네이티브 등가물 부재 시만 | light DOM의 최대 실리 — 폼·a11y·IME 공짜 |
| WEB-06 | 등록: import 자동 define + defineJunds 병행, 선등록 승리+경고 | CE 레지스트리 재정의 throw 회피, MFE 안전 |
| WEB-07 | 모듈 톱레벨 DOM 금지 4규칙 + render 멱등·입양 | SSR/Node import 안전 + 프리렌더 스냅샷 안정 |
| WEB-08 | adoptedStyleSheets 문서 1회 + `@layer junds.tokens/base/components` + 정적 CSS 병행 빌드 | 파싱 1회·CSP·소비자 무조건 승리 오버라이드 |
| WEB-09 | cx 자체 15줄(twMerge 무대체 폐기), 아이콘 빌드타임 생성+명시 등록, valibot 제거(수기 파서) | §7 각 절 |
| WEB-10 | a11y 공용 Behavior 5종 강제, 개별 재구현 금지 | 패턴 일관성·감사 가능성 |
| WEB-11 | vitest+happy-dom / Playwright / axe 3층, a11y 별도 config 패턴 계승 | happy-dom CE·internals 지원+속도, 실브라우저 의무 구간 분리 |
