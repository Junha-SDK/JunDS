# JunDS v3 — DECISIONS (append-only)

각 항목: 날짜 / 결정 / 근거 / 결정자(사람 승인 or 기본값 채택).

---

## 2026-07-24 — G2-B2 layout 배치 구현 중 발견 (layout 12행 + gen-exports)

### DEC-018. B2 layout 배치 판단 7건 + 검수 P1-1 해소
1. **gen-exports 생성기 도입 (검수 P1-1 해소)**: `packages/web/scripts/gen-exports.mjs`가
   src/components/ 스캔으로 package.json exports(57엔트리)와 components.generated.ts
   (클래스 재수출 + ALL_COMPONENTS 28종)를 생성 — define.ts ALL 수기 배열·index.ts 수기
   재수출·exports 수기 관리 3곳 전부 폐지(03 §6.2 정합). drift 게이트는 web `npm test`
   선두(`--check`)에 편승 — CI 별도 잡 없이 v3:test 경유로 강제된다.
2. **별칭 파생 확정 (R12)**: Grid·SimpleGrid = GridLayout 파생(auto-fit/auto-fill/
   min-child-width를 기반 클래스가 수용, 우선순위 autoFit>autoFill>minChildWidth>cols),
   Wrap = Group 파생(표면 동형). LayoutDivider는 **신규 태그 없음** — B1 jd-divider가
   표면 전량 커버, spacing 프롭은 react 어댑터 매핑. ledger 4행 notes에 alias-of 기록.
3. **Show/Hide는 CSS 전용으로 강등**: v2의 innerWidth 리스너+조건부 렌더 →
   display:contents(래퍼 없는 렌더 등가) + attr별 정적 미디어 규칙. JS 상태 0이라
   SSR/프리렌더 상시 안전, above+below 병용은 규칙 합성으로 v2 의미론(w>=above && w<below)
   재현(Hide 병용 시 상시 숨김이 되는 v2 거동도 동일).
4. **Stack divider 프롭은 react 어댑터 몫**: children 사이 노드 삽입은 동적 children
   관리(MutationObserver급)를 요구 — 바닐라에서는 children으로 <jd-divider>를 직접 쓴다.
5. **default-true boolean의 반전 계보 계승**: Container center·Overlay center → no-center
   (DEC-012-4 persistent 반전과 동형). Overlay blur는 프로퍼티명이 HTMLElement.blur()와
   충돌 — 프로퍼티 blurred + attribute "blur" 분리(PropDef attribute 재정의 첫 사용례).
6. **AppShell 번역**: v2 조건부 이중 aside → 단일 aside의 상태 속성 전환([data-mobile]·
   [mobile-open], 콘텐츠 이동 없음). Ctrl/⌘+B는 defaultPrevented 존중(⌘K 이중 토글 픽스
   선례). 데스크톱 토글은 uncontrolled 반영 + jd-sidebar-toggle 사후 통지(어댑터가 재제어).
   사이드바/헤더/푸터 bg `#fff` 리터럴은 v2 실태 승계 — 다크 대응은 G2 재심의 목록.
7. **grid-layout 사이즈 기준선 +39.7% 갱신**: R12 단일 구현 확장(auto 컬럼 3프롭)의 의도된
   증가(0.43→0.60KB gzip, 예산 12KB 대비 5%). 검수 P2-2(radius 16px 번역 불일치)는 G2
   radius 어휘 재심의 인풋으로 재확인 — B2는 신규 radius 리터럴을 만들지 않았다.
- 검증: vitest 165/165(gen-exports drift 게이트 포함) · size-gate PASS ·
  데모(demo/layout.html) puppeteer 실측 — 데스크톱 Ctrl+B 접기(230→64px)·모바일 드로어+
  스크롤락·Show/Hide 반전·auto-fit 컬럼 전부 재현, 콘솔 에러 0.
- 결정자: B2 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — finance-data 분리 슬라이스 (@junds/finance-data)

### DEC-018. finance-data 분리 — 판단 6건
(번호 주: 016은 MCP 게이트, 017은 시각 패리티 트랙이 선점 — 018로 부여.)
1. **이관 표면 확정**: yahoo·kis·ecos·fred·rss·tickers + newsSummary(rss 파이프라인의
   순수 후처리 — 01 §3.3 목록엔 없으나 데이터 계층으로 판정) + livePrices·liveIndices의
   **스토어 계층**(React 훅은 v2 잔류) + stream(신설 — SSE 와이어 계약 타입·파서 정본화,
   v2에선 livePrices/liveIndices/liveOrderBook에 산재). 공개 API는 v2 함수 시그니처
   보존 — `__tests__/signatures.test.ts`의 타입 대입 단언을 tsc(typecheck)가 게이트.
2. **발견 — consensus에는 "데이터 페치부"가 실재하지 않음**: 전부 mock 파생 스코어링
   (stocks/compareData/financials/investors 의존, fetch 0건). 01 §3.3의 "consensus
   데이터 페치부" 명명 가정을 실측으로 정정 — consensus는 이관 대상 아님(데모 계층 잔류).
3. **배럴 정책 (의도적 v2 차이)**: v2 lib 배럴은 server-only kis까지 export(클라 평가 시
   즉사 지뢰). v3 배럴은 클라 안전 모듈만 담고 kis/yahoo는 서브패스 전용
   (`@junds/finance-data/kis`) — 바닐라 웹/react 어댑터가 배럴을 안심 import 가능.
4. **결합 승격**: 하드코딩 엔드포인트(/api/kis/quotes·/api/quotes·/api/kis/stream)와
   데모 시드(findStock)는 `configureFinanceData` 주입으로 대체 — 기본값이 v2 경로라
   무설정 시 동작 동일. v2 livePrices의 무동작 시뮬레이터 잔해(step/tickAll/start/stop)는
   미이관(v2에서도 호출 효과 0 — 관측 동작 차이 없음).
5. **빌드 — 01 §6 보정**: "react rollup 설정 공유" 대신 tsc 듀얼 에밋(ESM+CJS+d.ts+
   dist/cjs package.json 마커). 이 패키지는 CSS·"use client" 배너·번들링 수요가 전부
   없어 rollup이 풀어주는 문제가 부재. 산출물 매트릭스(ESM+CJS+d.ts)는 01 §6 그대로.
6. **이월 2건**: ① ds/finance/lib 재-export 셤은 ds 동결 구역 소유권에서 후속
   (01 §3.3 전환기 정책 — 본 슬라이스는 ds 무수정). ② 루트 package-lock.json에
   yahoo-finance2 dep 반영 — 웹 트랙 미커밋 package.json과 얽혀 npm install 하우스키핑
   1회로 이연(root에 3.14.0이 이미 호이스트 설치돼 테스트/빌드 무영향, npm ci만 동기화 후 가능).
- 검증: nvm22 — vitest 77/77(네트워크·EventSource·node:fs 전면 모킹, 실 API 0회),
  typecheck 클린, dist 3종 빌드 + CJS/ESM 스모크 로드 통과.
- 결정자: 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — v2 시각 패리티 기준(baseline) 캡처 트랙

### DEC-017. 시각 패리티 기준 자산 — 재빌드 캡처 확정 + 커버리지 실측
1. **기존 storybook-static(2026-04-29 빌드)은 기준 사용 불가**: 루트 package.json의
   `"sideEffects": false` 가 스토리북 프로덕션(webpack) 빌드에서 preview.ts 의
   `import "../app/globals.css"` 를 트리셰이킹으로 제거 → 토큰·유틸리티 CSS 전무한
   무스타일 렌더(재빌드로 재현 확인). dev 모드는 CSS 가 살아 있어 그간 미발견.
   구 산출물은 규칙대로 불변 보존, 본 트랙은 읽기만 했다.
2. **캡처 소스 = v3 HEAD(58f57b5) 재빌드**: `storybook build` 를 스크래치패드로 출력
   (레포 불변, Node 22.12+ 필요 — nvm 22.23.1 설치). 앱 CSS 는 tools/build-css.mjs 가
   @tailwindcss/postcss(레포 의존성)로 별도 컴파일해 캡처 시 주입. 이후 f456624 까지
   ds/·app/globals.css·.storybook 무변경을 diff 로 확인 — 캡처는 현 HEAD 에 유효.
3. **캡처 조건(결정성)**: 1280×800 @2x, Date 고정(2026-04-29T12:00+09), Math.random
   LCG 시드, 애니메이션/트랜지션 강제 off + reduced-motion, ko-KR/Asia/Seoul,
   다크 = `documentElement[data-theme="dark"]` 토글(재로드 없음). 클립 = 렌더 노드
   유니온 +16px(뷰포트 85% 초과 시 전체 뷰포트). 파일 규칙
   `docs-spec/parity/baseline/<ledger-id>/<variant>-<theme>.png`.
4. **매핑 별칭(스토리 타이틀→ledger id)**: Progress→ProgressBar(단, Steps 스토리→
   ProgressSteps), Toast→DsToastProvider. **ledger 중복 id 발견**: AreaChart 가
   composites·finance 양쪽에 존재 — 캡처는 composites 귀속, 원장 중복 해소는
   레지스트리 소유 트랙 몫(본 트랙 소유 밖이라 미수정).
5. **placeholder 스토리 53종은 캡처하지 않음**: v2 스토리 자체가 빈 props
   (`items={[]}`, `trigger={null}`)로 시각 표면 0 — 임의 props 로 메꾸면 "v2 가 실제로
   그린 화면"이라는 정답지 원칙이 깨지므로 미확보로 분류하고, 스토리 없음 229종과
   함께 소스 추출 variant 표면만 manifest 에 기록. 42배치에서 스토리 저작과 함께
   기준을 추가한다.
6. **용량 기준**: 요소 클립 전략으로 총 3.0MB(한도 80MB 의 4%) — 무손실 PNG 유지,
   대표 variant 축소 불필요. Avatar/Image 스토리는 외부 URL(i.pravatar.cc) 의존이라
   해시 변동 가능(manifest 참조).
- 실측: 104컴포넌트 496장(라이트/다크), ledger 445행 대비 23.4%(시각 386행 기준
  26.9%) — 커버리지 상세·재현 절차는 docs-spec/parity/{COVERAGE.md,manifest.json}.
- 결정자: 실측 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G1 iOS 슬라이스 빌드 검증 완료 (Xcode 손상 우회)

### DEC-015. iOS 빌드·테스트 검증 완료 + 툴체인 손상 실측·우회 확정
1. **검증 결과**: DEC-013-1의 미검증 슬라이스 전수 통과 — 4타겟(Core/UIKit/SwiftUI/우산)
   iOS 16 시뮬레이터 타깃 빌드 성공(에러 0, 수정 필요 코드 0건), **XCTest 31/31 통과**
   (iPhone 17 / iOS 26.2 시뮬레이터에서 실행 — JdLayoutTests 12·Core 스펙/옵션/모션 9·
   UIKit 뷰 6·SwiftUI 스모크 4). 데모 소스 6파일 typecheck 통과 + 수동 .app 조립으로
   시뮬레이터 실기동 확인(카탈로그·Button 양 계통 동형 렌더·탭 카운트·Modal 시트
   open/close/onClose·다크모드 토큰 전환). ledger 3행(Button/Input/Modal) notes 갱신.
2. **툴체인 손상 실측**: Xcode 26.2(17C52)의 swift-frontend·clang은 arm64 슬라이스,
   libclang.dylib은 arm64·x86_64 양쪽 코드서명 invalid → AMFI가 SIGKILL(exit 137).
   xcodebuild 실행 파일 자체는 살아있으나 `-list`·빌드·xcrun의 SDK 조회
   (`--show-sdk-path`)가 전부 libclang 로드에서 사망. Rosetta 우회도 libclang에서 막힘.
   **복구는 Xcode 재설치뿐**(서명 자체가 깨져 -runFirstLaunch·GUI 실행으로 불가) — 사용자 몫.
3. **검증 우회 경로 확정** (Xcode 복구 전 표준 루프, demo/README.md에 명령 기록):
   CLT(Swift 6.2.3, 서명 정상) `swift build --triple arm64-apple-ios16.0-simulator
   --sdk <Xcode iPhoneSimulator.sdk 직접 경로>` (xcrun SDK 조회 우회, 최신 SDK는 stdlib
   swiftmodule 내장이라 CLT로 iOS 크로스 빌드 가능). 테스트는 `--build-tests` +
   플랫폼 XCTest 검색 경로(-F/-I/-L) 후 `simctl spawn <기기> …/Agents/xctest` +
   `SIMCTL_CHILD_DYLD_*`로 시뮬레이터 실행. 데모앱은 모듈 .o 직접 링크 + Info.plist
   수제 번들 + `simctl install/launch`.
4. **잔여 블로커 (Xcode 재설치 후에만)**: (a) demo/JunDSDemo.swiftpm의 Xcode Run·실기기
   배포(AppleProductTypes가 Xcode 전용), (b) 루트 package.json의 ios:build/ios:test
   (xcodebuild 경유 — 추가로 ios:test의 'iPhone 15' 기기명이 설치 런타임(iPhone 17 세대)에
   없어 복구 후 갱신 필요; package.json은 iOS 트랙 소유 경계 밖이라 미수정), (c) 스냅샷
   유틸(04 §8.3)은 어차피 M2 게이트라 영향 없음.
5. **StrictConcurrency 경고 현황 (에러 아님, Swift 6 모드 대비 과제)**: JdMotion.isReduced
   전역 가변 + UIAccessibility.isReduceMotionEnabled(MainActor 격리)의 nonisolated 참조,
   JdConstraintStore associated object 키 전역. 04 §7.3의 함수 포인터 주입 설계 유지하되
   Swift 6 이행 시 @MainActor 승격 재심의 — G2 이후.
- 결정자: 실측 검증, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — MCP 트랙 게이트 (사람 승인)

### DEC-016. v3 MCP 방향 3건 승인 + 저작 게이트 신설
(번호 주: 015는 iOS 검증 트랙이 선점 — 016으로 부여. 017 중복 2건은 해당 트랙들 몫.)
1. **도구 표면**: 소비자 조회 5종(search_components/get_component/get_usage/get_tokens/get_status)
   확정. v2 기여자 도구(scaffold·map_refresh·extract_props·locate 파일랭킹·requirements 계열)
   미계승 — v2 서버(mcp/)는 .mcp.json `junds` 항목으로 동결 병행 존치.
2. **docs-content 정본화**: `docs-spec/registry/docs-content/<id>.json` 신설(스키마 08 §3.2).
   ledger web:done 전수 손저작으로 시작, 후속 게이트에서 06 문서 화면 코드 탭 3종이
   같은 파일을 소비하도록 06 개정 예정 — 문서와 MCP의 단일 저작점.
   **⚠ 저작 게이트**: packages/mcp 테스트가 "ledger `web:done*` 행 ⇒ docs-content 존재"를
   전수 검사한다. 이후 배치에서 web 상태를 done으로 갱신할 때 docs-content 저작이
   DoD에 포함된다(07 §3-4의 문서 항목 구체화) — 미저작 시 v3:test 실패.
3. **배포**: `packages/mcp` = `@junds/mcp` 무빌드 npx 패키지(의존성 SDK ^1.29 + zod 명시 2개).
   소유권 밖 공유 파일 2건 최소 수정 승인 — 루트 package.json workspaces에 packages/mcp
   추가, .mcp.json에 `junds-v3` 병기(v2 `junds` 무수정).
4. 스펙 오기 정정: 초기 저작 대상 실측 **16건**(core 13 = CE 12 + CoreProvider 내부화,
   + 파일럿 Button/Input/Modal) — 08 §3.2 초판의 "15건"은 CoreProvider 누락 오기.
- 결정자: 사람 승인 (2026-07-24 게이트, 3문 3답 — 전부 권장안 채택).

---

## 2026-07-23 — G2-B1 구현 중 발견 (core 12행 + style-props)

### DEC-014. B1 core 배치가 드러낸 판단 8건
1. **style-props 어휘는 v2 리터럴 패리티 우선**: v2 styleProps와 tokens/가 **이름-값
   충돌**하는 축(radius: v2 md=8px vs --jd-radius-md=6px, fontSize: v2 md=1rem vs
   --jd-text-md=0.875rem, shadow·zIndex 별개 어휘)은 v2 리터럴을 유지하고, 값 일치가
   확인된 축(spacing 대부분·color·lineHeight 등)만 --jd-* var 참조로 번역한다.
   패리티 원칙(값 임의 변경 금지) 준수 — 어휘 통합은 G2 재심의.
2. **반응형은 attribute 마이크로문법** `p="4 md:6"` (JSON-in-attribute 금지 WEB-03).
   v2는 base를 인라인으로 방출해 미디어 규칙이 항상 패배하는 실측 버그 —
   v3는 반응형 사용 시 전 구간을 콘텐츠 해시(djb2) 클래스 규칙(@layer junds.components)으로
   방출해 정상화. 해시는 내용 결정적(프리렌더 스냅샷 안정, §3.1-3). `mx="auto"`도
   v2의 조용한 무시 버그를 보정해 허용.
3. **v2 Box `as` 폴리모피즘은 CE 미지원** — 호스트가 곧 요소라 태그 교체 불가.
   React 어댑터 몫으로 이월. 단 Text/Heading은 내부 시맨틱 요소(p/span…·h1~h6)를
   렌더·교체하는 방식으로 지원(의미가 다름 — 문서 아웃라인용).
4. **Page는 컴파운드 3태그** jd-page/jd-page-header/jd-page-body = ledger 1행(Page).
   header의 light DOM 슬롯 규약: `slot="breadcrumb"` 마커 children은 브레드크럼 행,
   나머지는 actions 영역(shadow 없는 슬롯 관례). Page 기본 패딩은 v2 의도 스펙대로
   정적 @media(16px→md 24px)로 정상화 — v2 실측은 인라인 base에 눌려 16px 고정이었다.
5. **Divider 단일 정본 선점(R12)**: <jd-divider>가 v2 CoreDivider 표면(기본 my=4)을
   계승하고, B2 LayoutDivider·B4 primitives Divider는 이 클래스의 별칭으로 처리 예정
   (무여백 기본 등 표면 차는 react 어댑터 프롭 매핑으로 해소).
6. **CoreProvider는 토큰 시스템 흡수(내부화)** — B0 미결의 처분 확정. v2 JunDSProvider의
   theme/colorMode 노브는 CSS 토큰 오버라이드(:root { --jd-* }) + data-jd-theme 속성으로,
   radius/density 런타임 노브(--jds-radius-*)는 DEC-008-(4)에서 기폐기. CE 구현 없음,
   v2 호환 표면은 react 어댑터 몫. ledger web:done(내부화)·tests:n/a.
7. **size-gate W1 계측 엔트리 변경**: src/index.ts(공개 배럴) → src/core/index.ts(코어
   전용 배럴). 공개 배럴은 컴포넌트 클래스를 재수출해 배치가 늘수록 W1이 무한 비대 —
   05 §1의 코어 정의(베이스·define·styles·uid·style-props·behaviors)와 일치하는
   엔트리로 계측한다.
8. **vitest stale transform 캐시 함정 실측**: 편집 전 테스트 파일의 캐시가 풀런에서
   재사용돼 가짜 실패 5건(단독 실행은 통과). 검증 전 node_modules/.vite 삭제를
   세션 프로토콜에 포함할 것.
9. **호스트 box-sizing 자기 선언 규범**: v2는 Tailwind preflight의 전역
   `*{box-sizing:border-box}`에 암묵 의존했다. v3 단독 데모(의존성 0)에서 jd-page가
   width:100%+padding으로 부모를 넘치는 실측 — 호스트에 width/height와 padding·border를
   병용하는 컴포넌트는 자기 규칙에 `box-sizing: border-box`를 직접 선언한다
   (전역 리셋 주입 금지 — 소비자 CSS 불간섭 원칙).
- 결정자: G2-B1 구현·검증 중 발견, 근거 기록 후 기본값 채택 (2026-07-23).

---

## 2026-07-23 — G1 iOS 슬라이스 구현 중 발견 (Package.swift + 파일럿 3종 + 실기기 데모앱)

### DEC-013. iOS 슬라이스 판단·스펙 보정 7건
1. **iOS 슬라이스는 빌드 미검증 — Xcode 복구 후 최우선 컴파일·수정**: 작업 머신의
   swift 툴체인이 산출물 없이 즉사(DEC-011-6과 동일 증상, 사용자 Xcode 복구 대기).
   본 슬라이스의 모든 Swift 산출물(Package.swift·JunDSCore/UIKit/SwiftUI·테스트 3종·
   데모앱)은 컴파일 미검증 상태로 작성됐다. 보수 원칙: 매크로·과시적 제네릭·최신 문법
   회피, iOS 16 SDK 보장 표면의 Swift 5.9 코드만. ledger 해당 3행 notes에 unverified 기록.
2. **JdToken.swift(B0 생성물)가 JunDSCore에서 UIKit/SwiftUI를 import** — 04 A2
   (Core는 Foundation+CoreGraphics만)와 불일치. 생성물 수정 금지 원칙에 따라 유지하고
   내장 브리지(uiColor/color)를 그대로 소비한다. 귀결: Core가 현재 UIKit 의존이라
   04 §8.1의 "Core 테스트는 macOS 호스트 swift test" 전제가 성립하지 않음(시뮬레이터로
   실행). 토큰 생성기 개정 시 A2 정합 재심의. 토큰 표면은 생성물의 대문자 케이스
   (JdToken.Color/Space/FontSize…)가 정본 — 04 §6 소문자 스케치와 다름.
3. **레이아웃 DSL diff 범위 보정 (04 §5.3)**: layout{} 재호출의 stale 제약 deactivate는
   **동일 #fileID 발원 제약으로 한정**한다. 무제한 diff면 컴포넌트가 자기 자신에 건
   제약(JdButtonView의 minHeight 등)을 소비자의 button.jd.layout{} 호출이 삭제하는
   상호 파괴가 발생(스펙 §9 규범 예시 자체가 이 패턴). constant 매칭·update 의미론은
   스펙 그대로.
4. **파일럿 표면 번역 (04 §10 원칙 적용)**: 버튼 variant는 Core 정본 4종
   (primary/secondary/ghost/danger) — 웹 outline/link는 제외(link는 iOS 버튼 관용구
   아님, 후속 재심의). size는 sm/md/lg(웹 xs 제외), 컨트롤 minHeight 32/40/48
   (웹 28~48의 iOS 터치 타깃 보정, 버튼·텍스트필드 단일 램프). Modal은 시스템 시트
   번역: persistent = isModalInPresentation/interactiveDismissDisabled(웹 백드롭 무시와
   동일 의미론), 스와이프 다운 = backdrop 경로, size는 detent 번역(sm·md=medium+large,
   lg=large). escape reason은 enum 패리티로만 보존.
5. **데모앱은 Swift Playgrounds 앱 포맷(demo/JunDSDemo.swiftpm)**: iOSApplication 제품,
   로컬 의존은 `.package(name: "JunDS", path: "../..")` — deprecated 경고를 감수하고
   워크트리 디렉터리명(JunDS-v3 등)과 무관하게 패키지 identity를 고정한다.
6. **루트 스크립트 ios:build/ios:test 추가 (DEC-011-5 이월 해소)**: xcodebuild 경유
   (UIKit 타겟이라 host swift build 불가 — 위 2번의 귀결로 Core도 동일).
7. **파일럿에 필요한 Core 상태만 신설**: JdControlSize/JdModalSize/JdModalCloseReason +
   JdButtonSpec/JdTextFieldSpec(순수 resolve) + JdMotion. JdToastCenter급 상태머신은
   본 슬라이스 스코프 밖(04 §4 정본 패턴은 Toast 구현 시). 화이트/클리어/고스트 눌림색
   3건은 토큰 부재로 JdButtonSpec.swift 파일 내 상수로 보충(JdToken.swift 미수정) —
   토큰 승격 여부 G2 재심의.
- 결정자: G1 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-23).

---

## 2026-07-23 — G1 웹 파일럿 구현 중 발견 (jd-button/jd-text-field/jd-modal + focus-trap + 벤치)

### DEC-012. G1 컴포넌트 슬라이스가 드러낸 스펙 보정·판단 7건
1. **최초 render 지연 실행 (03 §1.2 스케치 보정)**: connectedCallback 동기 render는
   스트리밍 파서 업그레이드(번들 선로드 + 파서 생성 요소)에서 children 미도착 상태로
   실행돼, children을 골격으로 이동하는 컴포넌트가 빈 골격을 이중 구축한다
   (happy-dom innerHTML도 동일 시맨틱 — childCountAtConnect=0 실측). 보정:
   문서 파싱 중(readyState "loading" && 후행 형제 없음)이면 DOMContentLoaded,
   그 외에는 microtask로 최초 render를 지연. connected()는 항상 render 후 호출
   (순서 계약 유지). 한계: 로딩 중 동적 삽입 요소는 DCL까지 골격이 늦다 —
   `:not(:defined)` FOUC 가드 범위 밖이나 실害 미미로 수용.
2. **디폴트 값은 reflect되지 않음을 명문화 (03 §1.3·§4.3 정합)**: reflect는 property
   set 시점에만 동작하므로 기본값(variant=primary, size=md)은 attribute로 나타나지
   않는다. 따라서 컴포넌트 CSS는 **기본 variant/size 스타일을 base 클래스(.jd-button 등)에
   두고, 호스트 속성 셀렉터는 비기본값만 담당**한다 — §4.3 정본 스케치와 동형.
3. **jd-modal은 `<dialog>` 미채택**: (a) 03 §5.3·§8이 포커스 감금·닫기 경로를 공용
   Behavior로 강제 일원화(WEB-10)하는데 showModal()의 top layer·inert·ESC 내장 동작과
   이중화된다. (b) top layer는 --jd-z-* 토큰 체계(z-index)를 무시하고 ::backdrop은
   @layer 오버라이드 계약(§4.4) 밖이다. (c) happy-dom 단위층 검증 가능성.
   div 기반(.jd-modal__backdrop + .jd-modal__panel[role=dialog][aria-modal]) +
   createFocusTrap + 스크롤 락으로 구현, 메서드명 showModal()은 네이티브 표면과 호환 유지.
4. **v2 Modal `dismissible`(기본 true) → `persistent`(기본 false)로 반전**: Boolean
   attribute는 존재 여부가 값(§1.3)이라 기본 true 프로퍼티를 선언적으로 표현할 수 없다.
   ESC는 v2와 동일하게 persistent여도 항상 동작.
5. **jd-text-field = v2 Input + FormField 통합 표면**: label(라벨 행)·error(문자열
   메시지 — v2 Input의 boolean과 달리 메시지가 곧 상태)·aria-invalid/aria-describedby
   자동 연결. v2 Input의 leftSlot/rightSlot은 G1 범위 외(후속 배치에서 재심의).
   createFocusTrap은 §5.1 "지연 시작" 예외 — create 시 리스너를 붙이지 않고
   activate()가 시작점(닫힌 모달이 connect되는 것이 정상 상태이므로).
6. **벤치·사이즈 게이트 위치**: 05 §2.1 `bench/web/`·§3.1 `scripts/size-gate.mjs`는
   01 §3.4("신설 스크립트는 benchmarks/에, 루트 scripts/ 금지")와 충돌 —
   레포 구조는 01이 정본이므로 `benchmarks/web/`(probe.js·시나리오)·
   `benchmarks/run.mjs`·`benchmarks/size-gate.mjs`로 통일. 루트 스크립트
   `bench`/`size:web` 추가(DEC-011-5의 이월분 해소). budgets.json은 05대로
   docs-spec/registry/에 신설.
7. **컴포넌트별 사이즈 계상 방식**: W2 측정은 컴포넌트 엔트리를 개별 minify 번들하되
   core/behaviors import를 external로 분리(코어는 W1로 계상 — 05 §1의 코어 정의에
   포커스트랩 포함). ESM 배포는 splitting 단일 빌드로 클래스 identity를 보존
   ("."과 "./button" 혼용 시 중복 정의 경고 방지).
- 결정자: G1 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-23).

---

## 2026-07-23 — G1 B0 구현 중 발견 (파일럿 첫 슬라이스: 토큰 파이프라인 + packages/web 스캐폴드)

### DEC-011. B0 구현이 드러낸 스펙 보정 6건
1. **v2 gradients.ts의 미정의 변수 참조 (실측 드리프트)**: `primarySoft`의 `var(--primary-soft)`,
   `surfaceTop/Bottom`의 `var(--surface)`는 v2 CSS(tokens.css·globals.css) 어디에도 정의된 적 없음
   — 해당 그라디언트는 v2에서 이미 깨져 있었다. 패리티 원칙(값 임의 변경 금지)에 따라
   gradient.json에 문자열 그대로 보존하고, 정의된 변수(--primary/--primary-hover/--primary-glow)만
   `{color.*}` 별칭 치환. 토큰 신설·삭제 여부는 G2에서 재심의.
2. **토큰 테스트 러너: node --test → vitest** (02 §6 이탈): v2 TS 리터럴(ds/tokens/*.ts)의
   동적 import 비교에 TS 변환이 필요한데 `node --test`는 로더 없이 .ts를 못 돌린다.
   vitest는 기존 devDependency — `tokens:test` = `vitest run --config tokens/vitest.config.mjs`
   (node 환경, 루트 vitest.config.ts와 분리). B0 지시서도 vitest를 명시.
3. **Swift Shadow 방출 형태 확장** (02 §4.2 스케치 보정): `[Layer]` 단일 배열로는
   DEC-008-(3)로 승격된 다크 그림자를 표현할 수 없어 `Shadow.Dynamic(light:dark:)` 쌍으로 방출.
4. **JdElement SSR 평가 버그**: `extends HTMLElement`는 Node 모듈 평가 시점에 throw —
   03 §3.1-1("import가 Node에서 그냥 평가") 위반. typeof 탐지(허용 규칙)로 스텁 베이스 대체,
   packages/web/__tests__/ssr.test.ts(환경 node)가 회귀 방지.
5. **루트 스크립트 부분 추가** (01 §4 이탈): ios:build/ios:test/bench는 대상
   (Package.swift·benchmarks/)이 아직 없어 미추가 — 해당 슬라이스에서 추가.
   v3:build/v3:test는 `--workspaces --if-present`로 자리표시자(react/finance-data) 무해 통과.
6. **swiftc 구문 검증 생략**: 작업 머신의 swift 툴체인이 즉사(exit 137, `swift --version`조차) —
   JdToken.swift 구문 검증은 CI `ios-build`(macos 러너) 몫으로 이월. 값 정합성은
   패리티 테스트의 0xRRGGBBAA 재파싱이 커버.
- 결정자: G1 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-23).

---

## 2026-07-23 — G0 승인 게이트 결과 (사람 승인)

### DEC-009. G0 전체 승인 + 게이트 결정 3건
- G0 스펙 세트(00~07) 승인, G1 파일럿 진입 확정. DEC-008 기본값 6건 일괄 승인.
- 문서 화면 시각 컨셉: **C 쇼룸/전시** 채택(A 에디토리얼·B 정밀 카탈로그 기각).
  좌측 인덱스 레일 + 다크 대형 스테이지. 최종 디자인은 GF에서 정교화.
- 브랜치 전략: **v3 전용 브랜치 신설**(main 기준) + docs-spec 커밋 2건 cherry-pick
  이관(690a39d, de483df). fix/finance-fifo-tax-precision은 ff60b15로 원복(WIP 5건 보존).
  v3 작업은 워크트리 `~/develop/jjunhaa/JunDS-v3`에서 수행(메인 워킹트리는 fix 유지).
- 결정자: 사람 승인 (2026-07-23 게이트).

### DEC-010. iOS 계층 의존 — 04 스펙의 "SwiftUI→UIKit 의존" 기각 (사람 결정)
- 04-ios-arch가 제안한 JunDSSwiftUI→JunDSUIKit 의존(L급 24종 UIViewRepresentable 랩)을
  사람이 명시 거부. **JunDSSwiftUI와 JunDSUIKit은 완전 독립(상호 미의존, JunDSCore만 공유).**
- 귀결: L급 24종은 로직·상태머신·계산·측정을 JunDSCore로 최대한 끌어내리고,
  렌더 표면만 양쪽 각각 관용적으로 구현(이중 구현 비용 감수 — 사람이 인지하고 선택).
- 라이브러리 내부 계층 의존만 금지: 소비자 앱이 스스로 UIViewRepresentable로 감싸는 것은 무관.
- 04-ios-arch.md 해당 절(Package.swift 타겟 의존, 결정 A3, §4.2 신설, §10 번역 전략) 개정 완료 (2026-07-23).
- 결정자: 사람 승인 (2026-07-23 게이트, 번복 마감 고지 후 결정).

---

## 2026-07-23 — 프로젝트 발족 (G0 진입)

### DEC-001. 전제 정정: JunDS는 이미 실제 제품 레포다
- 마스터 프롬프트의 전제("JunDS는 MySelf 문서 데모로만 존재")는 사실과 다름.
- 실체: 이 레포(Junha-SDK/JunDS) = `@junds/ui` v2.2.0, React 라이브러리.
  npm 미공개(private), 로컬 tarball 배포. iOS 코드는 0건(미존재 확정).
- "219개" 주장도 부정확 → 실측: 갤러리 Specimen 188, USAGE 문서 211,
  라이브러리 UI 컴포넌트 304 + hooks 55 + finance 86. 상세: 00-inventory.md
- 결정자: 실측(에이전트 감사) + 사람에게 보고 완료.

### DEC-002. 거점: 기존 JunDS 레포를 v3 모노레포로 진화
- packages/web(바닐라 코어) · packages/ios(SPM, Package.swift는 레포 루트) ·
  packages/react(기존 v2 → 어댑터) · packages/finance-data(데이터 연동 분리).
- 근거: 히스토리·CI·changesets·COMPONENTS.md 자산과 이름 연속성 유지.
- 결정자: 사람 승인 (2026-07-23).

### DEC-003. 전환 범위: UI 전량 + finance UI/데이터 분리
- UI 304개 + hooks 55개(→Behavior) 전부 바닐라+iOS 전환. 최종 목표는 전량.
- finance UI 컴포넌트(86)는 코어 포함, yahoo-finance2/KIS 데이터 연동은
  @junds/finance-data로 분리 → 코어 런타임 의존성 0 달성.
- 결정자: 사람 승인 (2026-07-23).

### DEC-004. 최소 지원: iOS 16 + 에버그린 브라우저(Safari 16.4+)
- 근거: SwiftUI NavigationStack·Layout 프로토콜 가용, 웹 @layer·:has 등
  신형 CSS 전제 가능. 2026년 기준 점유율 충분.
- 결정자: 사람 승인 (2026-07-23).

### DEC-005. 커밋 정책: 배치마다 로컬 커밋, 푸시·태그·배포는 요청 시에만
- 결정자: 사람 승인 (2026-07-23).

### DEC-006. 마스터 프롬프트 §4 기본값(D1~D8) 채택 현황
- D1 웹: Custom Elements v1, light DOM + @layer junds + jd- 접두 — 채택.
- D2 hooks → Behavior(createXxx(el, opts): {update?, destroy}) — 채택.
  전 매핑표는 00-inventory.md §4.
- D3 iOS: 단일 제품 JunDS, 내부 Core/UIKit/SwiftUI 3계층, 서드파티 0 — 채택.
- D4 레이아웃 DSL: 플렉스 엔진 자작 금지, NSLayoutConstraint 체이닝 래퍼 — 채택.
- D5 토큰: tokens/*.json 단일 소스 → CSS vars + Swift 동시 생성 — 채택.
  주의: 기존 ds/tokens(TS 소스)가 이미 존재 → 02-tokens 스펙에서 이관 경로 정의.
- D6 성능: 측정 없는 네이티브 가속 금지, Worker → WASM/FFI 순 — 채택.
- D7 문서: MySelf /docs/junds 단일 페이지 + ?c= 내부 라우팅, SSG 개별 페이지 금지 — 채택.
- D8 레포 구조: DEC-002로 갱신(신규 레포 → 기존 레포 진화). 나머지 구조 원칙 유지.

### DEC-008. G0 스펙 세부 쟁점 6건 — 권장안을 기본값으로 채택
- 게이트에서 사람이 거부하지 않는 한 아래 기본값으로 진행 (방향급 쟁점 2건은 별도 승인 대기: 문서 컨셉 택1, SwiftUI→UIKit 의존).
- (1) React 어댑터 골격 소유권: 어댑터가 내부 골격을 React로 렌더하고 CE가 입양(03 권장안). react 어댑터 스펙 착수 시점에 1회 재검토.
- (2) 이벤트 v2 호환: jd-open/jd-close 등 이벤트 2개를 어댑터가 onOpenChange 단일 콜백으로 합성 허용.
- (3) 다크 그림자: 문서앱 globals.css의 다크 그림자 값을 shadow.json dark로 승격(02 §7-1 권장안).
- (4) radius 정본: radius.ts(4/6/8/12px) 단일화, 브랜드 런타임 노브 --jds-radius-* 폐기(02 §7-2 권장안).
- (5) runtime PageDoc Renderer: 롤아웃 범위 외 별도 트랙 유지(ledger 미포함, 07 결정 유지).
- (6) finance 소형 배지(LivePctBadge·LiveStatusDot 등 표시 전용): bench를 n/a로 강등(ledger 상태 필드에서 개별 처리).
- 결정자: 기본값 채택(각 스펙의 권장안), 2026-07-23.

### DEC-007. 기존 미커밋 변경 5건은 보존
- LICENSE, BottomSheet.tsx, finance 3건, package.json에 선행 미커밋 변경 존재.
- v3 작업은 이를 건드리지 않으며, 커밋 시 별도 스테이징으로 분리한다.
- 결정자: 기본값 채택(안전 원칙).
