# 06 — 문서 화면 스펙: MySelf `/docs/junds` (G0)

작성일: 2026-07-23 · 전제: DEC-006 D7(단일 등록 페이지 + `?c=` 내부 라우팅, SSG 개별 페이지 금지) · 대상 레포: MySelf(이 스펙 시점에는 **읽기 전용** — 구현은 별도 게이트 통과 후).
현행 근거: `MySelf/src/features/docs/components/pages/junds/`(JunDSLive.tsx, junds-shared.tsx, junds-usage.ts, junds-usage.data.ts, junds-live.css), `MySelf/src/styles/docs.css`의 `doc-grid--junds`. 수치 근거: 00-inventory.md(갤러리 Specimen 188 · USAGE 211키 · UI 313 + hooks 61 + finance 86 = **메타 460**).

---

## 1. IA — 정보 구조

한 페이지, 두 뷰. "전부 나열"(현행: 산문 문서 안에 188개 Specimen 세로 나열)을 폐기한다.

```
/docs/junds                        [카탈로그]  ← SSG 프리렌더 대상 (유일)
  └── ?c=<id>                      [상세]      ← 클라이언트 전환 전용
```

- **카탈로그(홈)**: 검색 + 카테고리/태그 필터 + 카드 그리드. 카드 = 이름·카테고리·태그·웹/iOS 지원 배지·미니 라이브 프리뷰(뷰포트 진입 시 활성화).
- **상세**: 대형 라이브 스테이지 + props 컨트롤 패널 + 코드 탭 3종(웹 바닐라 / SwiftUI / UIKit) + 복사 + 토큰·접근성 표.
- **레이아웃**: 사이트 공통 헤더만 유지. 그 아래는 JunDS 전용 캔버스 — 독스 3칼럼(doc-left/doc-right 레일)을 이 페이지에서는 미노출하고 `max-width: 1360px` 전폭 캔버스를 쓴다(`doc-grid--junds`를 v3 모드로 확장, 산문 820px 규칙은 인트로 문단에만 잔존).

### 1.1 URL 스킴

| URL | 뷰 | 히스토리 |
|---|---|---|
| `/docs/junds` | 카탈로그 | 기준 엔트리 |
| `/docs/junds?c=button` | Button 상세 | `pushState` |
| `/docs/junds?cat=input&q=date` | 카탈로그(필터 적용) | `replaceState` (히스토리 오염 금지) |

- `c` 값 = ledger `id`(kebab-case, 예: `button`, `otp-input`, `use-debounce`). 유일한 pushState 트리거.
- `cat`/`q`는 필터 공유용 딥링크만 지원 — 타이핑·칩 클릭마다 `replaceState`로 현재 엔트리를 갱신한다.
- 코드 탭 선택(web/swiftui/uikit)은 URL에 넣지 않는다. `localStorage["junds.codeTab"]`에 전역 저장 — "나는 iOS 개발자" 성향이 페이지 전체·재방문에 걸쳐 유지된다.
- 미지의 `c`(오타·삭제된 id): 상세 프레임 안에 "없음" 상태 + 유사 이름 제안 3개 + 카탈로그 복귀 링크. 리다이렉트하지 않는다(주소창 보존).

### 1.2 히스토리 · 스크롤 복원

페이지 마운트 중 `history.scrollRestoration = "manual"` (언마운트 시 원복).

1. **카탈로그 → 상세**: 클릭 시 ① 현재 카탈로그 엔트리에 `replaceState({view:"catalog", scrollY})`로 스크롤 저장 → ② `pushState({view:"detail", c})` → ③ 상세 렌더 후 `scrollTo(0,0)`.
2. **뒤로가기(popstate)**: `state.view==="catalog"`이면 카탈로그 재표시 후 저장된 `scrollY`를 더블 rAF(미니 프리뷰 IO 판정 이후)로 복원. 카드 그리드는 프리뷰 영역 고정 높이라(§3.3) 복원 좌표가 어긋나지 않는다.
3. **상세 → 상세**(연관 컴포넌트 링크): `pushState` + 스크롤 톱. 뒤로가기는 이전 상세로.
4. **딥링크 진입**(`?c=` 직접 로드): 히스토리 스택에 카탈로그가 없다. 상세의 "카탈로그" 버튼은 `history.state`가 자기 것일 때 `pushState`가 아니라 **`replaceState`로 카탈로그 전환**(탭 하나로 들어온 사람의 뒤로가기 = 이전 사이트).

### 1.3 SSG 프리렌더 경계 (정확한 선)

MySelf 빌드는 `vite build` 후 headless Chrome 프리렌더(`scripts/prerender.ts`) + 하이드레이션 검증(`check-hydration.ts`)이다. 이 페이지의 정적/클라이언트 경계:

**정적(프리렌더 HTML에 포함)** — `/docs/junds` 무쿼리 1회만 프리렌더:
- 페이지 셸(마스트헤드·인트로 산문·검색 입력 껍데기·카테고리 섹션 헤더 7개).
- **460개 카드 셸 전부**: 이름·카테고리·태그·지원 배지 텍스트 + 프리뷰 자리의 정적 플레이스홀더(스켈레톤 div). SEO·FCP·검색엔진의 컴포넌트명 색인이 여기서 나온다. 예산: 프리렌더 HTML ≤ 250KB(카드당 ~0.4KB).

**클라이언트 전용(하이드레이션 이후에만 존재)**:
- 검색/필터 동작, 미니 라이브 프리뷰 마운트(IO), 상세 뷰 전체(스테이지·컨트롤·코드 탭·표), 코드 하이라이트, 복사.

**하이드레이션 결정성 규칙**(현행 함정 계승):
- React 초기 렌더 = 프리렌더 HTML과 문자 단위 동일. render 단계에서 `window`/`location`/`Date.now`/난수 접근 금지.
- `?c=` 딥링크는 초기 렌더에 반영하지 않는다. 하이드레이션 직후 `useLayoutEffect`에서 `location.search`를 읽어 상세로 전환 — 페인트 전에 스위치되므로 카탈로그 플래시는 발생하지 않고, 전환 전까지 정적 카탈로그가 로딩 스켈레톤 역할을 한다.
- IntersectionObserver 생성·관찰은 전부 effect에서. 프리렌더 Chrome에서는 effect가 돌아도 플레이스홀더→프리뷰 교체가 스냅샷에 섞이지 않도록, 미니 프리뷰 마운트는 `requestIdleCallback` 1틱 뒤로 미룬다(프리렌더 스냅샷은 idle 이전에 캡처됨을 check-hydration으로 검증).

---

## 2. 데이터 파이프라인

### 2.1 단일 소스: ledger.json → 카탈로그 메타

카탈로그 메타(이름/카테고리/태그/지원 배지)는 **JunDS 레포 `docs-spec/registry/ledger.json`에서 파생**한다(스키마: `{id, category, tier, web, ios, docs, ...}`). MySelf에 손으로 목록을 쓰지 않는다.

- JunDS 레포에 생성기 `scripts/emit-docs-catalog.mjs`(신규)를 두고, `ledger.json` + COMPONENTS.md를 읽어 **`junds-catalog.data.ts`** 를 방출한다. 방출물을 MySelf `pages/junds/`로 복사(현행 `junds-usage.data.ts`의 "scratchpad/emit-data.mjs 재생성, 손편집 금지" 규약과 동일).
- 방출 스키마:

```ts
// junds-catalog.data.ts — AUTO-GENERATED from JunDS docs-spec/registry/ledger.json
export type Cat = "layout" | "primitive" | "input" | "composite" | "pattern" | "finance" | "hook";
export type Support = "done" | "wip" | "planned" | "na"; // na = 해당 플랫폼에 개념 없음(Portal 등)
export interface CatalogEntry {
  id: string;        // "otp-input" — ?c= 값
  name: string;      // "OTPInput"
  category: Cat;     // ledger.category → 7분류 매핑(아래)
  tier: string;      // ledger.tier (Primitive/Composite/…)
  desc: string;      // 한 줄 한국어
  tags: string[];    // 검색·필터용 (예: ["form","auth","숫자입력"])
  web: Support;      // 웹 바닐라 전환 상태 배지
  ios: Support;      // iOS 전환 상태 배지
  featured?: true;   // 카탈로그 상단 대형 카드 후보(수동 큐레이션, ledger의 docs 필드)
}
export const CATALOG: CatalogEntry[] = [ /* 460 entries */ ];
```

- **카테고리 7종 매핑**: ledger의 라이브러리 배럴 기준 카테고리를 화면 7분류로 접는다 — `core`+`layout`→`layout`, `primitives` 중 폼 컨트롤(Input·Checkbox·Slider·OTPInput 등 상호작용 입력)→`input`, 나머지 primitives→`primitive`, `composites`→`composite`, `patterns`→`pattern`, `finance`→`finance`, `hooks`→`hook`. 매핑 표는 생성기 안에 상수로 두고, 미매핑 항목은 생성기가 **빌드 실패**로 알린다(조용한 누락 금지).
- 지원 배지(web/ios)는 v3 전환 진행률의 실시간 대시보드다 — ledger가 갱신되면 문서가 따라온다.

### 2.2 USAGE_DATA 확장: 코드 탭 3종

현행 `JunUsage {tier, desc, imp, code}`(React 단일)를 플랫폼 스니펫 맵으로 확장한다:

```ts
export interface Snippet { imp: string; code: string; }  // imp = import/설치 줄
export interface JunUsageV3 {
  tier: string;
  desc: string;
  snippets: {
    web?: Snippet;      // 바닐라: <jd-button variant="primary">…</jd-button> + createXxx()
    swiftui?: Snippet;  // import JunDS → JDButton(variant: .primary) { … }
    uikit?: Snippet;    // let b = JDButton(); b.variant = .primary
    react?: Snippet;    // 기존 211키 자산 그대로 이관(v2 어댑터 문서용, 탭 미노출·이관기 보존)
  };
}
```

- 탭 순서 고정: **웹 바닐라 → SwiftUI → UIKit**. 스니펫이 없는 탭은 비활성 + "예정" 배지(숨기지 않는다 — 로드맵 가시화).
- 생성 경로: web 스니펫은 v3 패키지의 컴포넌트 스펙(01~05 스펙의 예제 블록)에서, swiftui/uikit은 iOS 소스 DocC 예제에서 추출. react는 기존 `junds-usage.data.ts` 211키를 키 매핑(`Name` → ledger `id`)으로 기계 이관.
- 하이라이터: 현행 `highlightTsx`(순수 함수, 결정적)를 유지하고 Swift용 `highlightSwift`를 같은 계약(순수·pre-token화 HTML·`jdc-*` 클래스)으로 추가. 외부 하이라이트 라이브러리 도입 금지.

### 2.3 상세 스펙 레지스트리 (지연 로드)

```ts
export interface ControlDef {
  prop: string;                       // "variant"
  kind: "segmented" | "select" | "boolean" | "number" | "text";
  options?: string[];                 // segmented/select
  min?: number; max?: number; step?: number; // number
  default: string | number | boolean;
}
export interface DetailSpec {
  id: string;
  controls: ControlDef[];                                  // 선언적 — 컨트롤 UI는 이 스키마로 자동 생성
  render: (props: Record<string, unknown>) => ReactNode;   // 대형 스테이지 (props 반영 라이브 데모)
  mini: () => ReactNode;                                   // 카드 미니 프리뷰 (props 없음, 자율 동작)
  tokens?: { token: string; usage: string }[];             // 토큰 표 (--jd-accent 등)
  a11y?: { item: string; note: string }[];                 // 접근성 표 (role, 키보드, 포커스)
}
// 카테고리별 코드 스플릿 — 카탈로그 번들에 상세 코드가 섞이지 않는다.
export const DETAIL_LOADERS: Record<Cat, () => Promise<Record<string, DetailSpec>>> = {
  layout:    () => import("./detail/layout"),
  primitive: () => import("./detail/primitive"),
  input:     () => import("./detail/input"),
  composite: () => import("./detail/composite"),
  pattern:   () => import("./detail/pattern"),
  finance:   () => import("./detail/finance"),
  hook:      () => import("./detail/hook"),
};
```

- 컨트롤 스키마는 스니펫과 연동: 컨트롤 변경 시 코드 탭의 해당 prop 값을 치환해 보여준다(스니펫 안 `variant="primary"` 류를 템플릿 토큰 `variant="{variant}"`로 저작 → 표시 시 현재 값 주입 + 복사도 주입값 기준).
- `DetailSpec`이 없는 항목(초기엔 다수): 상세 뷰는 메타·배지·코드 탭·표만 노출하고 스테이지 자리에 "라이브 데모 준비 중" 정적 카드. 카탈로그 카드 미니 프리뷰도 동일하게 플레이스홀더 유지.

---

## 3. 카탈로그 화면

### 3.1 구성 (위→아래)

1. **마스트헤드**: JunDS 로고타입 + 실측 카운터(ledger 파생: "460 components · web 313 · iOS 진행률") + 한 줄 소개. "219" 등 근거 없는 수치 금지(DEC-001).
2. **검색 바**: 항상 상단 고정(sticky, 공통 헤더 아래). `/` 키로 포커스.
3. **필터 행**: 카테고리 칩 7종(`layout · primitive · input · composite · pattern · finance · hook`) + 플랫폼 토글(웹 지원만 / iOS 지원만) + 태그 칩(상위 빈도 12개, "더 보기"로 전체).
4. **카드 그리드**: 카테고리 7종 섹션 순서 고정(위 나열 순). 각 섹션 = 헤더(이름·개수·설명 한 줄) + 카드들. 필터/검색 결과는 섹션 구조를 유지한 채 매칭 카드만 남긴다(0건 섹션은 헤더째 숨김).

### 3.2 검색 (클라이언트 인덱스)

- 인덱스: `CATALOG` 460건에서 마운트 후 1회 생성 — 엔트리당 `haystack = (name + id + tags.join(" ") + category + desc).toLowerCase()` 사전 연결 문자열. 460건 × ~120자 ≈ 55KB 메모리, 외부 검색 라이브러리 금지.
- 매칭: 공백 분리 다중 토큰 AND. 점수 = 이름 전방일치(3) > 이름 부분일치(2) > 태그 일치(1.5) > 나머지(1). 점수 동률은 카테고리 섹션 순서 유지.
- 입력 debounce 80ms. 결과 수는 `aria-live="polite"` 리전으로 고지("23개 컴포넌트").
- 별칭: 현행 `USAGE_ALIAS`(17건)를 ledger `aliases` 필드로 흡수해 haystack에 포함(예: "Modal"로 검색 → Dialog 히트).

### 3.3 카드

```
┌──────────────────────────┐
│ [미니 프리뷰 / 플레이스홀더]  │ ← 고정 높이 (레이아웃 시프트 0)
├──────────────────────────┤
│ Button          [웹][iOS] │ ← 이름 + 지원 배지
│ primitive · form · cta    │ ← 카테고리·태그 (mono, 소형)
└──────────────────────────┘
```

- 카드 루트는 **실제 `<a href="/docs/junds?c=button">`** — 새 탭·링크 복사·크롤러가 공짜. 클릭은 intercept 해 SPA 전환(§1.2).
- **미니 프리뷰 = IntersectionObserver 진입 시에만 마운트**. 프리렌더 단계에서는 항상 플레이스홀더(스켈레톤). IO 옵션: `rootMargin: "240px 0px"`, threshold 0. 마운트 후 뷰포트에서 `720px` 이상 벗어나면 **언마운트해 플레이스홀더로 원복**(상태 보존 안 함 — 미니 프리뷰는 무상태 자율 데모).
- 동시 마운트 상한 **24개**(초과 시 가장 먼 것부터 LRU 언마운트). 460개 전 마운트는 어떤 경로로도 불가능해야 한다.
- 미니 프리뷰 래퍼는 **`inert` + `aria-hidden="true"`** — 카드 = 링크 1탭이 계약이며, 데모 내부의 버튼·인풋이 탭 순서·스크린리더에 새어 나가면 안 된다. 마우스 호버 데모 동작은 허용.
- 지원 배지: `done`=채움, `wip`=반투명, `planned`=외곽선, `na`=미표시. 배지 문구는 "웹" / "iOS" 고정.

### 3.4 스타일 스코프

- 갤러리 루트 스코프는 현행 `.jd-live`를 계승(prose 침범 차단 규칙 자산 재사용). 카탈로그 루트 `.jd-live.jd-cat`, 상세 루트 `.jd-live.jd-doc`. 신규 클래스는 `jd-`(컴포넌트 재현)·`jdx-`(문서 UI 크롬) 접두 유지.
- `:where()` 특이도 0 함정 — 버튼 리셋은 반드시 클래스 셀렉터로(현행 규약 유지).
- 액센트는 상위 스코프 상속(`--pf-accent`/아트 모드 `--da-accent`) 그대로.

---

## 4. 상세 화면

### 4.1 레이아웃 (데스크톱 ≥1024px)

```
[← 카탈로그]  Button   primitive · Primitive   [웹 done][iOS wip]
┌───────────────────────────────┬──────────────┐
│                               │  Props 컨트롤   │
│        라이브 스테이지            │  variant ▾    │
│   (대형, 최소 높이 360px)         │  size ⎯⎯      │
│                               │  loading ◻    │
├───────────────────────────────┴──────────────┤
│ [웹 바닐라] [SwiftUI] [UIKit]          [복사]   │
│  코드 (컨트롤 현재값 반영)                        │
├───────────────────────────────────────────────┤
│  토큰 표                │  접근성 표              │
└───────────────────────────────────────────────┘
```

- 스테이지: 상세의 주인공. 도트 그리드 캔버스(현행 `--jd-dot`) + 라이트/다크 스테이지 토글 + 밀도 토글(현행 테마 바 자산 재사용, 스테이지 로컬로 적용).
- 컨트롤 패널: `DetailSpec.controls`에서 자동 생성. kind별 위젯 — segmented(≤4개 옵션), select(>4), boolean=스위치, number=슬라이더+수치, text=인풋. "초기화" 버튼 1개.
- 코드 탭: §2.2. 활성 탭은 `localStorage["junds.codeTab"]` 복원(없으면 web). 복사 버튼은 `imp + "\n\n" + code`(현행 계약 유지), 컨트롤 주입값 반영.
- 표 2종: 토큰 표(토큰명 · 용도), 접근성 표(항목 · 내용 — role, 키보드 맵, 포커스 링, aria). 데이터 없으면 표째 미노출.
- 하단: "같은 카테고리" 연관 카드 4개(미니 프리뷰 없이 텍스트 카드 — 상세에서 IO 예산 소비 금지).
- 모바일(<1024px): 컨트롤 패널이 스테이지 아래로 폴드. 그 외 순서 동일.

### 4.2 hook 카테고리의 상세

hook(61개)은 시각 스테이지가 없는 항목이 많다. `DetailSpec.render`가 있으면 동작 데모(예: useDebounce 입력 데모), 없으면 스테이지를 접고 코드 탭을 첫 화면으로 올린다. 코드 탭 매핑: 웹 바닐라 = Behavior(`createXxx(el, opts)`, D2), SwiftUI/UIKit = 대응 유틸 또는 "웹 전용" 표기(`ios: "na"`).

---

## 5. 기존 188 Specimen 자산 이관

현행 자산: `JunDSLive.tsx` + `extra/*.tsx`의 데모 함수 188개(내부 상태 포함 완결 데모), `data-names` 토큰(복합 이름 "Badge · Tag · StatusDot" → 분해 토큰), `junds-usage.data.ts` 211키, `junds-live.css`의 `jd-*` 컴포넌트 재현 스타일 전량.

| 단계 | 작업 | 산출 |
|---|---|---|
| M1 | ledger → `junds-catalog.data.ts` 생성기 + 카탈로그 뷰(전 카드 플레이스홀더) + `?c=` 라우팅/히스토리 | 460 카드 카탈로그 + 빈 상세 프레임 |
| M2 | Specimen 데모 함수 188개를 `DetailSpec.render`/`mini`로 기계적 추출. 복합 Specimen은 분해된 id마다 같은 데모를 공유 등록(예: `badge`·`tag`·`status-dot` 3개 id → BadgeTagDemo 1개) | 상세 스테이지 188개분 + 미니 프리뷰 가동 |
| M3 | `controls` 스키마 저작 — 우선순위: input > primitive > composite 상위 빈도순(전 항목 일괄 저작 금지, 카드 사용량 기준 점진) | props 컨트롤 |
| M4 | USAGE 211키 → `JunUsageV3.snippets.react`로 기계 이관 + v3 진행에 맞춰 web/swiftui/uikit 스니펫 충전 | 코드 탭 3종 |
| M5 | 현행 세로 나열 갤러리 본문 제거, `junds-live.css`에서 미사용 규칙 정리 | 구화면 폐기 |

- `jd-*` CSS 재현 스타일은 **그대로 이관**한다(미니 프리뷰·스테이지 모두 이 재현 데모를 렌더). v3 바닐라 패키지가 실제 배포되면, 스테이지를 재현 데모 → 실물 `<jd-*>` Custom Element 마운트로 교체하는 것이 최종형(문서가 곧 실물 증명) — 단 이는 v3 웹 패키지 릴리스 이후의 후속 게이트.
- 갤러리 부재 컴포넌트(00-inventory 기준 카탈로그에는 있으나 데모 없는 ~257개): M2 이후에도 플레이스홀더 카드로 존재한다. "전 항목이 카탈로그에 보이고, 데모는 점진 충전"이 원칙 — 목록 누락보다 빈 스테이지가 낫다.

---

## 6. 성능 전략·예산

단일 페이지에 메타 460 + 라이브 프리뷰라는 조건에서:

| 항목 | 예산 | 수단 |
|---|---|---|
| 프리렌더 HTML | ≤ 250KB | 카드 셸 최소 마크업(노드 ≤ 10/카드) |
| 카탈로그 JS(상세 제외) | ≤ 90KB gz | 상세는 `DETAIL_LOADERS` 카테고리별 dynamic import |
| 상세 청크 | 카테고리당 ≤ 60KB gz | composite는 필요시 2분할 |
| 동시 마운트 미니 프리뷰 | ≤ 24 | IO 마운트/언마운트 + LRU(§3.3) |
| 검색 응답 | < 16ms/입력 | 사전 연결 haystack 선형 스캔(460건이면 충분), debounce 80ms |
| 상세 전환 | < 200ms 체감 | 클릭 즉시 프레임 전환 + 스테이지 자리 스켈레톤, 청크 로드 후 채움. hover 시 해당 카테고리 청크 프리로드 |
| 레이아웃 시프트 | CLS 0 | 카드 프리뷰 영역 고정 높이, 배지·태그 줄바꿈 금지(ellipsis) |

- 애니메이션이 있는 미니 프리뷰(스피너·차트 틱)는 `IntersectionObserver` 이탈 즉시 정지(언마운트가 곧 정지). `document.hidden` 시 자율 타이머 일시정지.
- 460개 `<a>` 카드 + 섹션 헤더의 정적 DOM은 ~5k 노드 — 가상 스크롤 도입하지 않는다(프리렌더 SEO와 상충, 460건은 정적 DOM으로 충분).

## 7. 접근성·키보드

- **카탈로그**: 카드=링크이므로 Tab 순서는 자연. 섹션마다 `<h2>`(7개) — 헤딩 점프 탐색 보장. 검색 `role="searchbox"` + `/` 단축키 + `aria-live` 결과 수(§3.2). 미니 프리뷰 `inert`(§3.3). 그리드 방향키 로빙은 도입하지 않는다(링크 목록 표준 동작 우선, 과설계 금지).
- **상세**: 코드 탭 = `role="tablist"` + 방향키(←/→)·Home/End, `aria-selected`. `Esc` = 카탈로그 복귀(뒤로가기와 동일 경로). 컨트롤 패널은 `<fieldset><legend>Props</legend>` 구조, 각 위젯 label 연결. 복사 성공은 버튼 라벨 교체("복사됨") + `aria-live`.
- **뷰 전환 포커스**: 카탈로그→상세 시 상세 제목(h1)으로 포커스 이동, 뒤로가기 시 진입했던 카드로 포커스 복귀(카드 id 기억).
- `prefers-reduced-motion`: 전환 애니메이션 제거, 자율 동작 데모(회전·틱)는 정지 상태로 마운트.
- 대비: 현행 `--jd-text-3` AA ≥ 4.5:1 계약 유지. 배지 `wip` 반투명도 텍스트 대비는 AA 이상.

## 8. SSG·스코프 준수 체크리스트 (구현 게이트)

- [ ] render 단계 브라우저 API/난수/시각 0건 (grep + check-hydration.ts 통과)
- [ ] `?c=` 딥링크에서 하이드레이션 경고 0건, 전환 플래시 없음(useLayoutEffect 스위치)
- [ ] 프리렌더 HTML에 미니 프리뷰 마크업 미포함(플레이스홀더만)
- [ ] `.jd-live` 스코프 밖으로 새는 셀렉터 0건 / 산문 규칙의 갤러리 침범 0건
- [ ] 버튼 리셋에 `:where()` 단독 사용 없음(클래스 필수)
- [ ] `junds-catalog.data.ts`·`junds-usage.data.ts` 손편집 없음(생성기 재실행으로만 갱신)
- [ ] popstate 왕복 10회 스크롤 복원 오차 < 4px (puppeteer 검증)
- [ ] 동시 마운트 프리뷰 카운터 ≤ 24 (puppeteer로 고속 스크롤 검증)

## 9. 미결 → 후속 게이트

- 시각 컨셉 A/B/C(`mockups/concept-{a,b,c}.html`) 중 택1 — **사람 취향 게이트**. 본 스펙의 구조(§1~8)는 세 컨셉 공통.
- 실물 `<jd-*>` Custom Element 스테이지 교체 시점(§5) — v3 웹 패키지 첫 릴리스 게이트에 종속.
- finance 86개의 데이터 의존 데모(차트·시세)는 정적 픽스처 데이터로만 렌더(네트워크 0) — 픽스처 스키마는 05-finance 스펙에서.
