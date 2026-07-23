# JunDS v3 — DECISIONS (append-only)

각 항목: 날짜 / 결정 / 근거 / 결정자(사람 승인 or 기본값 채택).

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

### DEC-007. 기존 미커밋 변경 5건은 보존
- LICENSE, BottomSheet.tsx, finance 3건, package.json에 선행 미커밋 변경 존재.
- v3 작업은 이를 건드리지 않으며, 커밋 시 별도 스테이징으로 분리한다.
- 결정자: 기본값 채택(안전 원칙).
