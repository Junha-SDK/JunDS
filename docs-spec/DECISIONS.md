# JunDS v3 — DECISIONS (append-only)

각 항목: 날짜 / 결정 / 근거 / 결정자(사람 승인 or 기본값 채택).

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
