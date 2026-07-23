# 01-repo-structure — JunDS v3 모노레포 구조 (G0)

작성일: 2026-07-23 · 전제: 00-inventory.md, DECISIONS.md (DEC-001~007)
원칙: 기존 레포를 **제자리에서 진화**시킨다(DEC-002). 소스 이동은 최소화하고, v3는 신규 디렉토리로만 자란다.

---

## 1. 현행 레포 실태 (실측)

| 영역 | 내용 | v3에서의 운명 |
|---|---|---|
| `package.json` (루트) | `@junds/ui` v2.2.0, private, dist 13개 배럴 + finance/lib 36 서브패스 exports | workspaces 루트로 확장 (§4) |
| `ds/` | v2 라이브러리 소스 (core/layout/primitives/composites/patterns/hooks/finance/tokens/providers/runtime/utils/auth/styles/`__tests__`) | **동결** — v2 유지보수 전용 (§3.1) |
| `app/` | Next.js 16 문서앱 (`app/design-system` 쇼케이스) | 동결 — v2 쇼케이스로 존속 (§3.2) |
| `.storybook/` + `storybook-static/` | Storybook 10 (nextjs 프레임워크) | 동결 — v3 문서는 MySelf `/docs/junds` (D7) |
| `rollup.config.mjs` | rollup+esbuild 플러그인+terser+postcss+dts, ESM/CJS/d.ts 3중 산출, finance/lib은 preserveModules | v2 전용으로 존속, `packages/react` 빌드에 재활용 (§6) |
| `scripts/` (31개 mjs) | build-map, extract-props, bundle 예산, a11y 감사, scaffold, doctor 등 | 범용 스크립트는 승계, v2 전용은 동결 (§3.4) |
| `create-junds/` | 앱 스캐폴드 CLI (templates/default) | 동결 → v3 GA 후 바닐라 템플릿 추가 |
| `mcp/` | MCP 서버 (컴포넌트 조회) | 유지 — v3 인벤토리를 읽도록 후속 확장 |
| `requirements/` | 18개 요구사항 md + validate CI | 유지 (v2 계약 문서) |
| `e2e/` + `playwright.config.ts` | Playwright (design-system.spec) | 유지 — v3 web E2E도 여기에 합류 |
| `.changeset/` | config만 존재 (사용 이력 희박) | 재활용 — v3 락스텝 릴리스 (§5) |
| `.github/workflows/ci.yml` | 14개 잡 (lint/typecheck×3/test/build-lib/bundle-check/a11y/validate×2/scan×2/type-contracts/ai-artifacts-fresh) | v2 레인으로 유지 + v3 레인 추가 (§8) |
| `dist/`, `junds-ui-2.2.0.tgz` | 로컬 tarball 배포 산출물 | v2 소비자 유지용 |
| iOS 코드 | **0건** (DEC-001 확정) | `packages/ios` 신설 |

감사 노트 2건 (수정 대상 아님, 기록만):

- **버전 표기 드리프트**: `CHANGELOG.md`는 `[2.5.0] — 2026-05-06`까지 기록돼 있으나 `package.json`·tarball은 2.2.0. changesets가 실제 버전 부여에 쓰이지 않았다는 증거 — v3에서는 changesets를 실제 게이트로 쓴다(§5).
- **미커밋 변경 5건** (LICENSE, BottomSheet.tsx, finance 3건, package.json)은 DEC-007에 따라 보존. v3 작업 커밋은 반드시 별도 스테이징.

---

## 2. v3 목표 레이아웃

```
JunDS/
├─ Package.swift                  # SPM 매니페스트 — 반드시 레포 루트 (SPM 제약)
├─ package.json                   # npm workspaces 루트 (§4)
├─ packages/
│  ├─ web/                        # @junds/web — 의존성 0 바닐라 (Custom Elements v1)
│  │  ├─ src/
│  │  │  ├─ index.ts              # 전체 배럴 (등록 함수 export, 부수효과 없음)
│  │  │  ├─ cdn.ts                # IIFE 진입점 — import 시 전 컴포넌트 자동 define
│  │  │  ├─ components/           # jd-button/ jd-modal/ … (폴더당 1컴포넌트: .ts + .css)
│  │  │  ├─ behaviors/            # createFocusTrap, createScrollSpy … (00-inventory §4)
│  │  │  ├─ styles/
│  │  │  │  ├─ tokens.css         # ★생성물 — tokens/ 생성기가 씀 (02-tokens)
│  │  │  │  └─ base.css           # @layer junds.base (리셋·유틸)
│  │  │  └─ internal/             # dom.ts, cx.ts(구 cn 대체), announce.ts …
│  │  ├─ build.mjs                # esbuild 빌드 스크립트 (§6)
│  │  └─ package.json
│  ├─ ios/                        # 소스만 여기, 매니페스트는 루트 Package.swift가 참조
│  │  ├─ Sources/
│  │  │  ├─ JunDSCore/            # 토큰·모델·로직 (UIKit 미의존)
│  │  │  │  └─ Generated/JdToken.swift   # ★생성물 (02-tokens)
│  │  │  ├─ JunDSUIKit/           # UIKit 구현 (NSLayoutConstraint 래퍼 포함, D4)
│  │  │  └─ JunDSSwiftUI/         # SwiftUI 구현
│  │  └─ Tests/
│  │     ├─ JunDSCoreTests/
│  │     └─ JunDSUIKitTests/
│  ├─ react/                      # @junds/react — 바닐라 코어를 감싸는 얇은 어댑터
│  │  ├─ src/
│  │  │  ├─ createComponent.tsx   # CustomElement→React 래퍼 팩토리 (자체 구현, 의존성 0)
│  │  │  ├─ components/           # export const Button = createComponent("jd-button", …)
│  │  │  └─ tokens.generated.ts   # ★생성물 — 기존 ds/tokens API 호환 (02-tokens)
│  │  ├─ rollup.config.mjs        # 기존 루트 rollup 설정 축소판 재활용
│  │  └─ package.json
│  └─ finance-data/               # @junds/finance-data — yahoo-finance2/KIS/ECOS/FRED 연동
│     ├─ src/                     # ds/finance/lib 중 데이터 페치 계열 이관 (§3.3)
│     └─ package.json
├─ tokens/                        # 단일 소스 JSON + 생성기 (02-tokens에서 상세)
│  ├─ color.json  space.json  radius.json  type.json  motion.json  shadow.json …
│  ├─ build/generate.mjs          # 의존성 0 node 생성기
│  └─ __tests__/                  # node --test 스냅샷·패리티 테스트
├─ benchmarks/                    # 신설 — 렌더/스크롤/메모리 벤치 (D6: 측정 없는 최적화 금지)
│  ├─ web/                        # playwright 기반 (기존 playwright 설정 공유)
│  └─ results/                    # JSON 결과 커밋 (회귀 비교 기준선)
├─ docs-spec/                     # 본 스펙 (00~ 연번, DECISIONS.md append-only)
├─ ds/  app/  .storybook/  …      # v2 동결 구역 — 현 위치 그대로 (§3)
└─ .github/workflows/ci.yml       # v2 레인 + v3 레인 (§8)
```

핵심 결정과 근거:

- **`Package.swift`는 레포 루트, 소스는 `packages/ios/Sources`** — SPM은 매니페스트가 패키지 루트에 있어야 `.package(url:)`로 레포 자체를 지정할 수 있다. `target(path:)`로 소스 위치를 하위 디렉토리로 내리는 것은 공식 지원이므로, "iOS 소비자는 레포 URL 하나" + "웹 관점에서는 packages/ 아래 정돈" 둘 다 얻는다.
- **v2(`ds/`)를 `packages/`로 이동하지 않는다** — 이동은 git 히스토리 추적성·31개 스크립트의 경로 가정·미커밋 변경 5건(DEC-007)·로컬 tarball 소비자를 동시에 깨는 데 비해 얻는 것이 "디렉토리 미관"뿐이다. 동결 구역은 제자리 동결이 가장 싸다.
- **`packages/web/src/components`는 폴더당 1컴포넌트(.ts+.css 코로케이션)** — 컴포넌트별 분할 빌드(§6)의 엔트리 열거를 디렉토리 스캔만으로 끝내기 위한 물리 규약.

## 3. 기존 자산 처리 방침

### 3.1 `ds/` — v2 기능 동결

- 신규 기능·신규 컴포넌트 추가 금지. 허용 변경: 버그픽스, 보안픽스, v3 이관에 필요한 최소 리팩토링(예: finance-data 분리 시 re-export 셔밍).
- `@junds/ui` 이름과 tarball 배포 방식은 v2가 살아있는 동안 유지. 루트 package.json이 workspaces 루트를 겸한다(§4) — npm은 이름 있는 루트 패키지의 workspaces를 허용하므로 이중 역할에 문제가 없다.
- 동결 선언은 CHANGELOG `[Unreleased]`에 명시하고 DECISIONS.md에 항목 추가.

### 3.2 `app/`(Next 문서앱)·`.storybook/`

- v2 쇼케이스로 존속하되 CI에서 advisory로 강등(§8). v3 문서·데모는 D7에 따라 MySelf `/docs/junds` 단일 페이지가 정본 — 이 레포에 v3용 문서앱을 새로 만들지 않는다.
- `storybook-static/`, `test-results/`, `coverage/`는 산출물이므로 v3와 무관하게 유지(.gitignore 정비는 별도 하우스키핑).

### 3.3 finance 분리 경로

- `ds/finance/lib` 131 export 중 **네트워크/데이터 계열**(yahoo, kis, ecos, fred, rss, livePrices, consensus 데이터 페치부)을 `packages/finance-data`로 이관. **순수 계산 계열**(format, tax, backtest, marketHolidays 등)은 언어 중립 로직이므로 v3 코어(web `internal/`, iOS `JunDSCore`)에 이식.
- 전환기 동안 `ds/finance/lib/*`는 이관된 모듈을 re-export하는 셤(shim)으로 유지 — v2 소비자의 서브패스 import(`@junds/ui/finance/lib/yahoo`)를 깨지 않는다.
- `yahoo-finance2`는 `packages/finance-data`의 dependency로 내려가고, 코어 3패키지(web/ios/react)는 런타임 의존성 0을 달성한다(DEC-003).

### 3.4 `scripts/`

- 승계(경로 일반화): `check-bundle-budget.mjs`, `analyze-bundle.mjs`, `build-bundle-report.mjs`(사이즈 게이트), `locate.mjs`/`build-map.mjs`(v3 인벤토리 포함하도록 확장), `generate-components-md.mjs`.
- 동결(v2 전용): `ensure-use-client-banner.mjs`, `scan-ssr-rsc.mjs`, `generate-stories.mjs`, `migrate-*` 등 React/Next 결합 스크립트.
- 신설 스크립트는 `tokens/build/`(생성기)와 `benchmarks/`에 두고 루트 `scripts/`를 더 불리지 않는다.

## 4. npm workspaces 구성

루트 `package.json`에 다음을 **추가**한다 (기존 필드는 유지 — v2 tarball 빌드 연속성):

```jsonc
{
  "name": "@junds/ui",          // v2 이름 유지 (동결 기간)
  "version": "2.2.0",
  "private": true,
  "workspaces": [
    "packages/web",
    "packages/react",
    "packages/finance-data"
    // packages/ios는 npm 패키지가 아님 — SPM이 관리, workspaces 미등록
  ],
  "scripts": {
    // ─ 신규 v3 ─
    "tokens:gen": "node tokens/build/generate.mjs",
    "tokens:test": "node --test tokens/__tests__/",
    "v3:build": "npm run tokens:gen && npm run build -w @junds/web -w @junds/react -w @junds/finance-data",
    "v3:test": "npm run tokens:test && npm run test -w @junds/web -w @junds/react -w @junds/finance-data",
    "ios:build": "swift build",
    "ios:test": "swift test",
    "bench": "node benchmarks/run.mjs"
    // 기존 v2 스크립트(build:lib, test, …)는 그대로 존속
  }
}
```

- **npm workspaces를 쓴다 (pnpm/turbo 도입 안 함)** — 근거: 패키지 4개·단일 소비자 규모에서 도구 추가는 순수 비용이다. 기존 CI·lockfile·캐시 키가 전부 npm 기준이고, 의존성 0 철학상 워크스페이스 간 참조도 거의 없다(react→web 하나뿐). 빌드 오케스트레이션은 npm `-w` 플래그와 `&&`로 충분하다.
- `packages/react`는 `"dependencies": { "@junds/web": "3.0.0" }`로 워크스페이스 내부 참조. 나머지 패키지 간 의존은 없다(토큰은 패키지가 아니라 생성물 주입).

## 5. 패키지 이름·버전 전략

| 패키지 | 이름 | 초기 버전 | 비고 |
|---|---|---|---|
| packages/web | `@junds/web` | 3.0.0-alpha.0 | 코어. CDN 파일명은 `junds.min.js` |
| packages/react | `@junds/react` | 3.0.0-alpha.0 | v2 `@junds/ui`의 후계 어댑터 |
| packages/finance-data | `@junds/finance-data` | 3.0.0-alpha.0 | 유일하게 런타임 의존성 보유 |
| (iOS) | 제품명 `JunDS` | git 태그 `v3.0.0-alpha.0` | SPM은 npm 버전과 무관 — 태그로 락스텝 |

- **v3.0.0 락스텝**: `.changeset/config.json`의 `fixed`에 3패키지를 묶는다.

```jsonc
{ "fixed": [["@junds/web", "@junds/react", "@junds/finance-data"]] }
```

- iOS는 npm 버전 부여 대상이 아니므로, **릴리스 태그 `vX.Y.Z` 하나**가 npm 3패키지+SPM의 공통 버전 앵커다. changesets `version` 실행 → 커밋 → 태그 순서를 릴리스 절차로 고정.
- v2 `@junds/ui`는 2.x에서 동결(패치만 2.x.y). `@junds/react`가 3.0.0 GA에 도달하면 v2 소비자 마이그레이션 가이드를 내고 `@junds/ui`는 deprecated 표기.

## 6. 빌드 도구 결정 — web은 esbuild 직접 구동, react는 rollup 재활용

**결정: `packages/web`은 rollup을 쓰지 않고 esbuild를 스크립트(`build.mjs`)로 직접 구동한다.**

근거:

1. 기존 rollup 설정의 가치는 React 생태 대응(peerDepsExternal, "use client" 배너, preserveModules+per-chunk 배너, rollup-plugin-dts)에 있는데, 바닐라 웹에는 그 문제가 전부 존재하지 않는다. 재활용할 것이 사실상 없다.
2. 필요 산출물 3종(ESM 번들, IIFE 단일 파일 + `globalName`, 엔트리별 code splitting)은 esbuild 네이티브 기능이다. 플러그인 0개로 CSS 번들까지 처리된다.
3. 실증된 리스크 회피: 현행 rollup-plugin-postcss(cssnano) 경로에서 중첩 CSS가 소실되는 버그를 이미 겪었다(ds/styles/tokens.css 상단 주석). 바닐라 v3의 CSS는 `@layer`·`:has` 등 신형 문법 비중이 높아, 변환 체인은 짧을수록 안전하다. esbuild의 CSS 처리는 무변환에 가깝다.
4. esbuild는 이미 devDependency 체인에 있다(rollup-plugin-esbuild 경유). 신규 도구 도입이 아니라 직접 호출로의 강등이다.

타입 선언은 esbuild가 못 하므로 `tsc --emitDeclarationOnly`로 별도 산출 — d.ts 번들링(rollup-plugin-dts)은 바닐라 web에는 불필요하다(엔트리 구조가 소스 구조와 동일).

```js
// packages/web/build.mjs — 빌드타임 의존성: esbuild, typescript (런타임 0 유지)
import { build } from "esbuild";
import { readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const shared = { bundle: true, target: ["safari16.4", "chrome110", "firefox110"], logLevel: "info" };

// 1) npm 소비용 ESM 배럴 (부수효과 없음 — 소비자가 defineAll() 또는 개별 define 호출)
await build({ ...shared, entryPoints: ["src/index.ts"], format: "esm", outfile: "dist/index.js" });

// 2) CDN 단일 파일 — <script src="…/junds.min.js"> 한 줄로 전 컴포넌트 등록
await build({
  ...shared, entryPoints: ["src/cdn.ts"], format: "iife", globalName: "JunDS",
  minify: true, outfile: "dist/junds.min.js",
});

// 3) 컴포넌트별 분할 — dist/components/jd-button.js 단독 로드 가능 (공유 청크 자동 추출)
const entries = readdirSync("src/components", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => `src/components/${d.name}/index.ts`);
await build({ ...shared, entryPoints: entries, format: "esm", splitting: true, outdir: "dist/components" });

// 4) 타입 선언
execSync("tsc -p tsconfig.json --emitDeclarationOnly --outDir dist/types", { stdio: "inherit" });
```

- `packages/react`는 **기존 rollup 설정의 축소판을 재활용** — ESM/CJS/d.ts 3중 산출·"use client" 배너·peer external 등 이미 검증된 문제 풀이를 그대로 쓴다. `packages/finance-data`도 동일 설정 공유(react 산출물에서 CSS 단계만 제거).
- 산출물 매트릭스:

| 패키지 | 산출물 | 소비 시나리오 |
|---|---|---|
| web | `dist/index.js`(ESM) · `dist/junds.min.js`(IIFE) · `dist/components/*.js`(분할) · `dist/junds.css`(tokens+base) · `dist/types/` | 번들러 / CDN `<script>` / 부분 로드 |
| react | ESM+CJS+d.ts (v2와 동일 구조) | 기존 v2 소비자의 최소 이동 |
| finance-data | ESM+CJS+d.ts | 서버/클라 겸용 |
| ios | SPM 라이브러리 `JunDS` | `.package(url: 레포, from: "3.0.0")` |

## 7. Package.swift (루트)

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "JunDS",
    platforms: [.iOS(.v16)],
    products: [
        // 단일 제품 — 소비자는 import JunDS… 3모듈을 상황에 맞게 사용 (D3)
        .library(name: "JunDS", targets: ["JunDSCore", "JunDSUIKit", "JunDSSwiftUI"]),
    ],
    targets: [
        .target(name: "JunDSCore", path: "packages/ios/Sources/JunDSCore"),
        .target(name: "JunDSUIKit", dependencies: ["JunDSCore"], path: "packages/ios/Sources/JunDSUIKit"),
        .target(name: "JunDSSwiftUI", dependencies: ["JunDSCore"], path: "packages/ios/Sources/JunDSSwiftUI"),
        .testTarget(name: "JunDSCoreTests", dependencies: ["JunDSCore"], path: "packages/ios/Tests/JunDSCoreTests"),
        .testTarget(name: "JunDSUIKitTests", dependencies: ["JunDSUIKit"], path: "packages/ios/Tests/JunDSUIKitTests"),
    ]
)
```

서드파티 의존성 0 (D3). `JunDSUIKit`↔`JunDSSwiftUI`는 서로 의존하지 않고 Core만 공유 — SwiftUI 전용 앱이 UIKit 계층을 링크하지 않아도 되게 한다(단일 제품이라 링크는 되지만 데드 스트리핑 대상).

## 8. v2→v3 전환기 정책

1. **v2 기능 동결** (§3.1). 신규 요구는 전부 v3 백로그로.
2. **packages/react = 바닐라 코어의 얇은 어댑터**로 재구현한다. 자체 `createComponent(tag, { events, props })` 팩토리(의존성 0)가 Custom Element를 React 컴포넌트로 감싼다 — props→어트리뷰트/프로퍼티 반영, 커스텀 이벤트→`onXxx` 콜백 매핑, ref 포워딩. React 19는 Custom Element 프로퍼티/이벤트를 1급 지원하므로 래퍼는 실제로 얇다.
3. **컴포넌트 단위 점진 이관**: 어떤 컴포넌트가 web에서 완성되고 react 어댑터+시각 패리티 검증을 통과하면, 해당 v2 구현은 "superseded" 표기(코드 삭제는 v2 EOL까지 하지 않음). 이관 순서는 00-inventory 난이도 기준 S→M→L, 단 토큰/Behavior 기반이 먼저다(모든 컴포넌트의 전제).
4. 마일스톤: **G0** 스펙(현재) → **G1** tokens 파이프라인+web 코어 프리미티브(core13+layout12+primitives51)+iOS Core/토큰 → **G2** composites+Behavior 55, react 어댑터 알파 → **G3** patterns+finance UI, 벤치 게이트 정식화 → **GA** 3.0.0 락스텝 릴리스 + v2 deprecated.
5. 커밋 정책은 DEC-005(배치 로컬 커밋, 푸시/태그는 요청 시)를 따른다.

## 9. CI 게이트

기존 14개 잡은 **v2 레인**으로 존속하되 `paths` 필터(`ds/**`, `app/**`)로 트리거를 좁힌다. v3 레인 신설:

| 게이트 | 내용 | 실패 기준 | 러너 |
|---|---|---|---|
| tokens-fresh | `tokens:gen` 재실행 후 `git diff --quiet` (생성물 3종 커밋 상태 검증) | diff 발생 | ubuntu |
| tokens-test | `node --test tokens/__tests__/` — 스냅샷+v2 패리티 (02-tokens §6) | 테스트 실패 | ubuntu |
| web-build | `tsc --noEmit` + `build.mjs` 4산출물 | 빌드 실패 | ubuntu |
| web-test | vitest(happy-dom, Custom Elements 유닛) + Playwright 스모크(e2e/ 합류) | 테스트 실패 | ubuntu |
| web-a11y | axe-core를 Playwright 페이지에 주입해 대표 컴포넌트 감사 (기존 audit:a11y 이식) | critical/serious | ubuntu |
| size-budget | `junds.min.js` gzip 전체 예산 + `dist/components/*` 개별 예산 — `check-bundle-budget.mjs` 개조 | 예산 초과 | ubuntu |
| react-build | rollup 빌드 + typecheck | 빌드 실패 | ubuntu |
| finance-data-test | vitest (모킹 기반 — 실 API 호출 금지) | 테스트 실패 | ubuntu |
| ios-build | `swift build` (루트 Package.swift) | 빌드 실패 | **macos-14** |
| ios-test | `swift test` (Core 로직 + 토큰 패리티 XCTest) | 테스트 실패 | **macos-14** |
| bench-smoke | `benchmarks/run.mjs` — 결과를 baseline JSON과 비교 | G2까지 advisory, G3부터 회귀 >10% 실패 | ubuntu |

초기 사이즈 예산(측정 전 가설 — 첫 실측 후 DECISIONS로 보정): `junds.min.js` gzip ≤ 300KB(304컴포넌트 전량 기준), 개별 컴포넌트 gzip ≤ 12KB(공유 청크 제외), 토큰 CSS ≤ 8KB. D6 원칙에 따라 예산 숫자는 벤치 결과로만 갱신한다.

---

## 10. 이 문서의 열린 쟁점

없음 — 구조 결정은 전부 확정으로 제안한다. (토큰 쪽 쟁점 2건은 02-tokens §7.)
