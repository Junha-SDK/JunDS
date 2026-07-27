# Web Components + React Adapter

- **Slug:** `web-react-components`
- **Status:** shipped
- **Owner:** Junha (goodjunha@gmail.com)
- **Last updated:** 2026-07-27

## Goal

`@junds/web`의 바닐라 Custom Elements와 `@junds/react` 어댑터를 같은 컴포넌트
계약으로 제공한다. 바닐라 사용자는 HTML·property·native method만으로 접근 가능해야
하고, React 사용자는 익숙한 props·event·ref 방식으로 같은 시각과 동작을 얻어야 한다.
공통 기반은 확장 작성자가 쉽게 타입을 선언하고 업데이트 완료를 기다릴 수 있어야 한다.

## Scope

- In scope:
  - `packages/web/src/core/JdElement`의 prop 선언, 업데이트 배칭과 완료 계약.
  - 바닐라 `JdButton`, `JdTextField`, `JdModal`과 전체 컴포넌트의 갱신 가능 prop 감사.
  - 소비자 소유 컨트롤·호스트에 자동 연결하는 ARIA IDREF/상태의 소유권 보존 규칙.
  - React `Button`, `TextField`/`Input`/`FormField`, `Modal`.
  - props, native event, ref, SSR/hydration, 접근성 연결과 컴포넌트 CSS.
  - Web 빌드 산출물의 오래된 해시 청크 제거와 결정적인 CSS 파일 끝 정규화.
  - 양 패키지의 README, 타입 선언과 회귀 테스트, MySelf의 JunDS 실물·API 문서 동기화.
  - 생성 React 어댑터의 property 제거/초기화, 표준 HTML 프롭, 구체 ref와
    데이터·이벤트 detail 타입 계약.
  - 소비자 제공 콘텐츠의 기본 text 처리와 명시적 trusted markup 경계.
  - Web/React 전용 coverage, Chromium·Firefox·WebKit 및 React 18·19 검증 게이트.
  - 전체 번들 대신 컴포넌트별 등록·CSS를 쉽게 선택하는 권장 사용 경로와 배포 메타데이터.
  - 패키지 tarball을 깨끗한 Vanilla Vite·React 18/19 Vite·Next App Router 소비 앱에
    설치해 build/SSR 경계를 확인하는 소비자 E2E.
  - 고위험 상호작용 컴포넌트의 접근성·키보드·연결/해제 회귀 확대.
  - 공개 exports·props·events·ref 타입의 의도치 않은 변경을 막는 API 기준선.
  - 라이트/다크·반응형 대표 상태의 실브라우저 시각 회귀와 런타임 성능 예산.
  - MySelf junDS 카탈로그에서 Patterns도 실물 미리보기를 제공하고, 너무 큰 패턴은
    의미 있는 축소/모형으로 표시해 태그 이름만 보이는 빈 무대를 없앤다.
  - MySelf junDS 카탈로그의 Finance도 실물 데이터 프리뷰를 우선하고, 오버레이·
    비시각·초대형 금융 컴포넌트는 역할별 금융 모형으로 표시한다.
- Out of scope:
  - JunDS 쇼케이스 사이트의 시각 개편과 MySelf의 JunDS 외 영역.
  - 정적 감사에서 갱신·소유권 결함이 확인되지 않은 컴포넌트의 임의 기능 변경.
  - iOS 구현과 디자인 토큰 의미 변경.

## User stories / acceptance criteria

- [x] As a Web Component 작성자, `defineProps()`로 잘못된 prop 정의를 컴파일
      시점에 발견하고 `updateComplete`로 최초 render/배칭 update 완료를 기다린다.
- [x] As a 바닐라 사용자, `jd-button.focus()`/`click()`과
      `jd-text-field.select()`/validity 메서드가 내부 네이티브 컨트롤로 위임된다.
- [x] As a 사용자, TextField는 메시지 없는 invalid 상태와 기존
      `aria-describedby`를 보존하면서 오류 메시지를 자동 연결한다.
- [x] As a React 사용자, `Input error`, `leftSlot`, `rightSlot`을 경고나 누락 없이
      사용하고 입력 ref·controlled/uncontrolled·SSR/hydration 계약을 유지한다.
- [x] As a React 사용자, `Button asChild`도 variant/size/loading/fullWidth 시각과
      disabled 의미를 유지하며 기본 버튼은 의도치 않게 폼을 제출하지 않는다.
- [x] As a Modal 사용자, 중첩 모달에서도 스크롤 락이 마지막 모달이 닫힐 때까지
      유지되고 Header/Body/Footer가 일관된 시각·ARIA 구조를 제공한다.
- [x] As a 컴포넌트 사용자, 기존 `aria-describedby`·`aria-labelledby`·상태 속성을
      직접 지정해도 JunDS가 자기 참조만 추가·회수하고 사용자 값을 지우지 않는다.
- [x] As a Web Component 사용자, 최초 렌더 뒤 prop을 바꿔도 렌더 전용 상태가 남지
      않으며 같은 결함이 정적 검사에서 다시 유입되지 않는다.
- [x] As a MySelf 사용자, 최신 JunDS 번들과 자동 추출된 사용법을 별도 수작업 없이
      같은 문서 화면에서 확인한다.
- [x] As a 배포 사용자, 현재 빌드에서 참조하지 않는 과거 해시 청크가 npm·MySelf
      산출물에 누적되지 않는다.
- [x] As a React 사용자, 배열·객체 프롭을 제거하면 이전 값이 호스트에 남지 않고
      effect 의존성 배열 크기 변경 경고도 발생하지 않는다.
- [x] As a React 사용자, 생성 어댑터에서도 표준 HTML/ARIA/네이티브 이벤트 프롭과
      구체적인 element ref·데이터 프롭·CustomEvent detail 타입을 사용할 수 있다.
- [x] As a Web 사용자, 일반 문자열은 항상 텍스트로 렌더되고 HTML 삽입은 이름에
      위험성이 드러나는 명시적 trusted-markup API를 선택한 경우에만 일어난다.
- [x] As a 유지보수자, Web/React coverage와 Chromium·Firefox·WebKit,
      React 18·19 조합의 회귀를 CI에서 확인한다.
- [x] As a 배포 사용자, React 패키지를 실제 설치할 수 있고 전체 번들 없이 필요한
      컴포넌트의 JS·CSS만 선택하는 경로를 문서와 MySelf에서 바로 복사해 쓸 수 있다.
- [x] As a 배포 사용자, 패키지 tarball을 설치한 Vanilla·React 18/19·Next 소비 앱이
      저장소 소스나 workspace 링크 없이 타입 검사와 프로덕션 빌드를 통과한다.
- [x] As a 유지보수자, 접근성·키보드·재연결 위험이 큰 컴포넌트의 실제 fixture와
      브라우저 동작이 기준선보다 줄거나 깨지면 CI에서 발견한다.
- [x] As a 유지보수자, 공개 API 기준선·대표 시각 스냅샷·런타임 성능 예산의
      비의도적 회귀를 CI에서 발견한다.
- [x] As a MySelf 사용자, Patterns 카드에서도 실제 구성과 데이터를 축소 미리보기로
      확인하며 로딩 실패 시에도 의미 있는 정적 모형을 본다.
- [x] As a MySelf 사용자, Finance 카드 86개도 빈 무대나 태그 자리표시자 없이
      실제 시세·차트·포트폴리오 구성 또는 역할별 금융 모형으로 확인한다.

## Design / behavior notes

- 바닐라가 시각·상태 반영의 단일 소스이며 React는 완성 골격을 렌더한 뒤 CE가
  입양한다(`docs-spec/03-web-arch.md` §3.3, §11).
- 기본 Button 타입은 안전한 `button`. 제출은 바닐라/React 모두 `type="submit"`을
  명시한다.
- TextField 슬롯은 light DOM의 `slot="start"`/`slot="end"`와 React
  `leftSlot`/`rightSlot`을 같은 골격으로 수렴시킨다.
- 오류 상태는 `invalid` boolean과 `error` 메시지를 분리한다. 메시지가 없어도
  시각·`aria-invalid`는 유지되고, 메시지가 있을 때만 error row와
  `aria-errormessage`를 연결한다.
- Modal 스크롤 락은 공용 `lockScroll()`의 참조 계수를 사용한다.
- ARIA IDREF는 공백 토큰 집합으로 병합하고, 컴포넌트가 직전에 소유한 토큰만 다음
  업데이트에서 회수한다. 단일 상태 속성도 기존 소비자 값을 임시로 덮은 뒤 복원한다.
- `default*`처럼 초기 seed 전용인 prop은 정적 감사 예외에 이유를 명시하고, 그 밖의
  render-only prop은 update 경로를 갖게 한다.

## Touched files

- `packages/web/src/core/element.ts`
- `packages/web/src/core/aria.ts`
- `packages/web/src/core/content.ts`
- `packages/web/src/components/button/*`
- `packages/web/src/components/text-field/*`
- `packages/web/src/components/modal/*`
- `packages/web/src/components/form-field/element.ts`
- `packages/web/src/components/popover/element.ts`
- `packages/web/src/components/typewriter/element.ts`
- `packages/web/__tests__/element.test.ts`
- `packages/web/__tests__/button.test.ts`
- `packages/web/__tests__/text-field.test.ts`
- `packages/web/__tests__/modal.test.ts`
- `packages/web/e2e/form.spec.ts`
- `packages/web/e2e/modal.spec.ts`
- `packages/web/scripts/scan-render-only-props.mjs`
- `packages/web/build.mjs`
- `packages/web/scripts/gen-exports.mjs`
- `packages/web/vitest.config.ts`
- `packages/web/playwright.config.ts`
- `packages/web/e2e/stability.spec.ts`
- `packages/web/e2e/visual.spec.ts`
- `packages/web/e2e/__screenshots__/`
- `packages/web/__tests__/patterns-a11y.test.ts`
- `packages/web/demo/stability.html`
- `packages/web/src/styles/base.css`
- `packages/web/src/core/style-props.ts`
- `packages/web/src/components/*/*.css.ts`
- `packages/web/src/components/calendar/element.ts`
- `packages/web/src/components/virtual-scroll/element.ts`
- `packages/web/scripts/gen-manifest.mjs`
- `packages/web/scripts/lib/surface.mjs`
- `packages/web/src/elements.generated.ts`
- `packages/web/custom-elements.json`
- `packages/web/vscode.html-custom-data.json`
- `.github/scripts/web-a11y-audit.mjs`
- `.github/workflows/junds-v3.yml`
- `packages/react/src/components/Button.tsx`
- `packages/react/src/components/TextField.tsx`
- `packages/react/src/components/Modal.tsx`
- `packages/react/src/components/Button.types.ts`
- `packages/react/src/internal/Slot.tsx`
- `packages/react/src/jsx.ts`
- `packages/react/src/internal/createJdElement.tsx`
- `packages/react/scripts/gen-adapters.mjs`
- `packages/react/scripts/gen-exports.mjs`
- `packages/react/package.json`
- `packages/react/vitest.config.ts`
- `packages/react/__tests__/*`
- `scripts/consumer-smoke.mjs`
- `scripts/public-api-gate.mjs`
- `benchmarks/runtime-gate.mjs`
- `docs-spec/registry/public-api-baseline.json`
- `docs-spec/registry/runtime-budgets.json`
- `packages/web/README.md`
- `packages/react/README.md`

외부 소비 앱인 MySelf에서는 `scripts/extract-web-api.py`,
`scripts/sync-junds-v3.mjs`, JunDS 상세·카탈로그 문서, 해당 가드레일 테스트와
`public/junds-v3/` 생성물만 동기화한다.

## Open questions

- 없음. 2차 범위는 정적 감사와 명시적 소유권 위험이 확인된 표면에 한정한다.

## Changelog

- 2026-07-27 — shipped; MySelf JunDS Finance 86개를 데스크톱에서 라이브 63 +
  역할별 모형 23, 모바일에서 라이브 60 + 역할별 모형 26으로 전부 확인했다.
  정적 태그 자리표시자·남은 스켈레톤·브라우저 오류·390px 가로 넘침은 모두 0.
  기본값이 비던 AppIcon에는 대표 아이콘 데이터를, 0px로 접히던 PositionBar에는
  컨테이너 폭 계약을 추가했다. MySelf 125 tests·typecheck·production build 통과.
- 2026-07-27 — shipped; tarball 소비 앱 4종(Vanilla Vite·React 18/19 Vite·Next
  App Router), Web unit 381·실브라우저 174(Chromium/Firefox/WebKit, 시각 전용
  6건 제외), strict axe 10페이지×2테마·fixture 98종(위반 0), React 71 tests,
  공개 API(Web exports 789·React 391·생성 어댑터 387), 크기·런타임 예산을 모두
  통과. MySelf는 106 tests·typecheck·production build와 실제 브라우저에서
  Patterns 43개를 라이브 29 + 구조 모형 14로 확인(정적 자리표시자 0, 모바일
  390px 가로 넘침 0).
- 2026-07-27 — active; 깨끗한 소비 앱 E2E, 고위험 접근성/행동, 공개 API·시각·
  런타임 성능 게이트와 MySelf Patterns 실물 미리보기 범위 추가.
- 2026-07-27 — shipped; Web 376 unit·Chromium/Firefox/WebKit 159·strict axe 9페이지(위반 0),
  React 18/19 각각 71 tests, Web/React typecheck·build·coverage·npm dry-run과
  번들 예산·Web/React 병렬 빌드 3회 통과. 생성 React 어댑터 387종·subpath 391개,
  명시적 `unsafeHtml()` 경계, `core.css`+컴포넌트 CSS 부분 import,
  MySelf JunDS 1,600개 산출물 동기화.
- 2026-07-27 — active; 생성 React 타입/상태 초기화, trusted markup, 전용 coverage와
  크로스브라우저·React 버전 매트릭스, 부분 번들 사용성의 안정화 범위 추가.
- 2026-07-27 — shipped; Web prop 감사 0건, unit 370 + browser 53, React 59,
  MySelf 104 tests 통과. MySelf JunDS 반입 파일 2,322→1,589개로 정리.
- 2026-07-27 — active; 전체 prop 갱신 감사, ARIA 소유권 보존, MySelf 동기화 2차 범위 추가.
- 2026-07-27 — shipped; Web unit 362 + browser 53 tests, React 59 tests,
  양 패키지 typecheck/build 통과.
- 2026-07-27 — created; 공통 기반 + Button/TextField/Modal 1차 품질 개선 범위 확정.
