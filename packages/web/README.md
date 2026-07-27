# @junds/web

JunDS v3 — 의존성 0 바닐라 웹 컴포넌트 코어. Custom Elements v1, light DOM + `@layer junds`.

## 설치

```bash
npm install @junds/web
```

## 빠른 시작

```js
import "@junds/web/define"; // 전 컴포넌트 <jd-*> 등록 (SSR 안전 — Node에서 no-op)
import "@junds/web/junds.css"; // 토큰 + 베이스 + 컴포넌트 스타일 (@layer junds)
```

```html
<jd-button variant="primary">저장</jd-button>
```

`jd-button`의 기본 `type`은 안전한 `button`입니다. 폼 제출 버튼만
`type="submit"`을 명시하세요.

### TextField

오류 상태(`invalid`)와 오류 메시지(`error`)를 분리할 수 있고, 기존
`aria-describedby`는 오류 설명과 자동 병합됩니다.

```html
<jd-text-field id="price" label="가격" name="price" placeholder="0" invalid>
  <span slot="start" aria-hidden="true">₩</span>
  <button slot="end" type="button" aria-label="가격 지우기">×</button>
</jd-text-field>
```

호스트의 `focus()`, `select()`, `checkValidity()`, `reportValidity()`,
`setCustomValidity()`는 내부 네이티브 input으로 위임됩니다.

### 기존 ARIA와 안전하게 조합하기

`FormField`·`Popover`·`Tooltip`은 소비자가 만든 컨트롤에 필요한 ARIA 관계를
자동으로 더합니다. 기존 값은 덮지 않으며, 상태가 끝나면 JunDS가 추가한 값만
제거합니다.

```html
<p id="name-help">프로필에 표시할 이름입니다.</p>
<jd-form-field label="이름" error="필수입니다">
  <input name="name" aria-describedby="name-help" />
</jd-form-field>

<span id="save-shortcut">단축키 ⌘S</span>
<jd-tooltip content="변경 내용을 저장합니다">
  <button slot="trigger" type="button" aria-describedby="save-shortcut">
    저장
  </button>
</jd-tooltip>
```

위 입력은 `name-help`와 오류 id를 함께 사용하고, 툴팁 버튼은 열려 있는 동안만
툴팁 id가 추가됩니다. 별도의 id 병합 코드는 필요하지 않습니다.

### Typewriter

```html
<jd-typewriter id="copy" text="안녕하세요" once></jd-typewriter>
<script type="module">
  const copy = document.querySelector("#copy");
  copy.text = "새 문장"; // 완료 뒤 변경해도 처음부터 다시 재생
</script>
```

### Modal

```html
<jd-modal
  id="confirm"
  aria-labelledby="confirm-title"
  aria-describedby="confirm-body"
>
  <header class="jd-modal__header">
    <h2 id="confirm-title" class="jd-modal__title">삭제 확인</h2>
  </header>
  <div id="confirm-body" class="jd-modal__body">정말 삭제할까요?</div>
  <footer class="jd-modal__footer">
    <jd-button>취소</jd-button>
    <jd-button variant="danger">삭제</jd-button>
  </footer>
</jd-modal>

<script type="module">
  const modal = document.querySelector("#confirm");
  modal.showModal();
  modal.addEventListener("jd-request-close", (event) => {
    // event.preventDefault()로 닫힘 요청을 취소할 수 있습니다.
  });
</script>
```

중첩 모달은 참조 계수 방식으로 스크롤을 잠가 마지막 모달이 닫힐 때 복원합니다.

### 트리셰이킹 — 컴포넌트별 서브패스

```js
import "@junds/web/button"; // <jd-button>만 등록
import "@junds/web/core.css"; // 앱에서 1회: 토큰 + 베이스
import "@junds/web/css/button.css"; // 버튼 스타일만
import { JdButton } from "@junds/web/button/element"; // 클래스만 (부작용 0)
```

여러 컴포넌트를 사용할 때 `core.css`는 앱 진입점에서 한 번만 가져오고,
`css/<component>.css`만 필요한 만큼 추가합니다. 전체 CSS가 더 편한 앱은 기존처럼
`@junds/web/junds.css` 한 줄을 사용해도 됩니다.

### 컴포넌트 확장

```ts
import { defineElement, defineProps, JdElement } from "@junds/web";

class JdCounter extends JdElement {
  static tag = "jd-counter";
  static props = defineProps({
    count: { type: Number, default: 0, reflect: true },
  });

  declare count: number;

  protected render() {
    this.textContent = String(this.count);
  }

  protected update() {
    this.textContent = String(this.count);
  }
}

defineElement(JdCounter.tag, JdCounter);
const counter = document.querySelector<JdCounter>("jd-counter")!;
counter.count = 2;
await counter.updateComplete;
```

`updateComplete`는 최초 렌더와 같은 태스크에서 배칭된 업데이트가 끝난 뒤 resolve됩니다.

### 문자열 콘텐츠와 안전한 HTML

`items[].icon`, `content`, `question`, `answer`와 렌더 콜백이 반환한 문자열은 항상
평문으로 렌더됩니다. `<svg>…</svg>`처럼 HTML로 보이는 문자열도 자동으로 파싱하지
않으므로 API 응답이나 사용자 입력을 그대로 전달해도 DOM이 생성되지 않습니다.

아이콘·복합 본문은 가능하면 DOM 노드나 light DOM 슬롯으로 전달하세요.

```js
const icon = document.createElement("jd-app-icon");
icon.name = "home";

tabs.items = [
  { value: "home", label: "홈", icon },
  { value: "literal", label: "원문", icon: "<strong>HTML이 아닌 텍스트</strong>" },
];
```

정적 상수처럼 이미 검증한 마크업을 꼭 파싱해야 할 때만 신뢰 경계를 명시합니다.

```js
import { unsafeHtml } from "@junds/web/content";

const TRUSTED_HOME_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12 12 3l9 9"/></svg>';

tabs.items = [
  { value: "home", label: "홈", icon: unsafeHtml(TRUSTED_HOME_SVG) },
];
```

`unsafeHtml()`은 문자열을 정제하지 않습니다. 사용자 입력·API 응답에는 사용하지 마세요.
JSON 슬롯은 신뢰 표시를 담을 수 없으므로 JSON의 문자열은 항상 평문입니다.

### CDN 한 줄

```html
<script src="https://unpkg.com/@junds/web/dist/junds.min.js"></script>
```

## 라이브러리 품질 검증

아래 명령은 저장소 루트에서 실행합니다.

```sh
npm run coverage -w @junds/web
npm run build -w @junds/web
npm run test:browser -w @junds/web
npm run audit:a11y -w @junds/web
```

- `coverage`는 Web 패키지 소스만 측정하며 보고서는 `coverage/web/`에 생성됩니다.
- `test:browser`는 Chromium·Firefox·WebKit을 모두 실행합니다. 최초 한 번
  `npx playwright install chromium firefox webkit`이 필요합니다.
  관리 Chromium이 없는 개발 머신에서 시스템 Chrome만 빠르게 확인할 때는
  `JUNDS_SYSTEM_CHROME=1 npm run test:browser:chromium -w @junds/web`을 사용합니다.
- 접근성 감사에는 비어 있는 컴포넌트를 자동 생성하지 않습니다. 실제로 작성된 데모
  fixture만 coverage로 인정하며 공개 태그 수·페이지 수·fixture 비율의 하락도
  실패합니다. 상세 결과는 `coverage/web-a11y/a11y-summary.json`에 생성됩니다.
- `critical`·`serious` axe 위반은 항상 실패합니다. `moderate`·`minor`는 보고서에
  남는 advisory이며, 릴리스 전 전체 차단이 필요하면
  `npm run audit:a11y:strict -w @junds/web`을 사용합니다.

## 라이선스

[MIT](./LICENSE)
