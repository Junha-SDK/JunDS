# JunDS v3 — DECISIONS (append-only)

각 항목: 날짜 / 결정 / 근거 / 결정자(사람 승인 or 기본값 채택).

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
