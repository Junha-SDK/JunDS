# @junds/web

JunDS v3 — 의존성 0 바닐라 웹 컴포넌트 코어. Custom Elements v1, light DOM + `@layer junds`.

## 설치

```bash
npm install @junds/web
```

## 빠른 시작

```js
import "@junds/web/define";     // 전 컴포넌트 <jd-*> 등록 (SSR 안전 — Node에서 no-op)
import "@junds/web/junds.css";  // 토큰 + 베이스 + 컴포넌트 스타일 (@layer junds)
```

```html
<jd-button variant="primary">저장</jd-button>
```

### 트리셰이킹 — 컴포넌트별 서브패스

```js
import "@junds/web/button";                            // <jd-button>만 등록
import { JdButton } from "@junds/web/button/element";  // 클래스만 (부작용 0)
```

### CDN 한 줄

```html
<script src="https://unpkg.com/@junds/web/dist/junds.min.js"></script>
```

## 라이선스

[MIT](./LICENSE)
