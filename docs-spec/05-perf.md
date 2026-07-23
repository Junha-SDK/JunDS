# 05-perf — 성능 예산·벤치 하니스·CI 게이트·네이티브 가속 (G0)

작성일: 2026-07-23 · 전제: 00-inventory.md(난이도 분포·리스크 톱10), DECISIONS.md D6("측정 없는 네이티브 가속 금지").
모든 예산은 **게이트 값**이다 — 초과 시 CI가 실패하고, 조정은 DECISIONS 항목 추가로만 가능하다.

## 1. 성능 예산 확정표

기준 머신: 웹 = CI 러너 + 로컬 Apple Silicon(M1 이상), CPU 4x 스로틀 시나리오 병행. iOS = iPhone 12(iOS 16 최저 지원선의 대표 하드웨어) 시뮬레이터 게이트 + 실기 스팟체크.

| # | 항목 | 초기값 | 확정값 | 판정 |
|---|---|---|---|---|
| W1 | 웹 코어 런타임 | ≤8KB gzip | **≤8KB gzip 유지** | 유지 |
| W2 | 웹 컴포넌트 크기 | 평균 ≤4KB gzip | **평균 ≤4KB 유지 + 개별 p95 ≤12KB + L난이도 개별 상한 24KB** | 보강 |
| W3 | 상호작용 지연 | <50ms | **입력 핸들러 시작→다음 페인트 p95 <50ms 유지** (정의 구체화) | 유지 |
| W4 | 10k행 테이블 | 60fps 가상 스크롤 | **p95 프레임 ≤16.7ms · 드롭 프레임 <5% · 평균 ≥58fps** | 정의 구체화 |
| W5 | 롱태스크 | 50ms 초과 0건 | **상호작용 중 0건 유지 / 최초 마운트(대량 데이터 주입)만 1건 ≤100ms 허용** | 완화(마운트 한정) |
| I1 | iOS 컴포넌트 init | <1ms | **S·M <1ms / L <5ms** (데이터소스 준비 시간 제외, 뷰 계층 생성만 계측) | 완화(L 한정) |
| I2 | iOS 10k행 리스트 | 60fps | **60fps 유지 + hitch ratio <5ms/s** (Instruments/XCTOSSignpostMetric 기준) | 보강 |
| I3 | iOS 바이너리 증가 | <1MB | **<1MB 유지** (릴리스 빌드 코드 세그먼트, 리소스 제외 · 445개 전량 기준) | 유지 |

근거:
- **W1 유지**: 코어 = CE 베이스클래스 + 토큰 브리지 + Behavior 러너 + 포커스트랩/포털 유틸. 비교 좌표로 Preact 전체가 ~4KB, lit-html이 ~7KB — 프레임워크 없이 이 역할만 하는 코어가 8KB를 넘으면 설계 실패로 본다.
- **W2 보강**: 평균 단독 게이트는 아웃라이어를 은폐한다(300개 소형 컴포넌트가 DataGrid 60KB를 가려줌). 개별 p95와 L 상한을 병행한다. 차트 20+종의 공용 드로잉 유틸(스케일·경로 생성·리샘플)은 **공유 청크로 분리 계상**하며 각 차트의 개별 크기에 중복 산입하지 않는다.
- **W3 정의**: "상호작용"을 이벤트 타임스탬프→다음 페인트 완료로 정의(Event Timing API와 동일 모델). INP good 기준(200ms)의 1/4 — 라이브러리는 앱 오버헤드가 얹히기 전 단계이므로 앱 기준보다 엄격해야 한다.
- **W5 완화 근거**: 10k행 초기 주입은 사용자 개시 작업으로 RAIL 100ms 응답 기준을 적용. 단 이후의 스크롤·정렬·선택 경로에서는 50ms 초과 태스크 0건이 절대선이다. 벤치의 목데이터 생성은 계측 창 밖에서 수행한다(하니스 규약, §2.1).
- **I1 완화 근거**: DataGrid급(L 24종)의 뷰 계층 생성 1ms는 비현실적 상한 — 셀 재사용 풀 준비만으로 초과한다. S·M(277종)은 1ms를 유지해 회귀 감지선으로 쓴다.
- **I3 유지**: 서드파티 0 단일 SPM이므로 코드만 계상. 445개 전량 포함 후 초과가 실측되면 그때 모듈 분리(JunDSCharts 등)를 DECISIONS로 올린다 — 선제 분리는 하지 않는다.

## 2. 벤치 하니스 설계

### 2.1 웹 — 의존성 0 마이크로벤치 + Playwright 구동

위치(예정): `bench/web/` — 정적 HTML 페이지들 + 계측 스크립트 `bench/web/lib/probe.js`(의존성 0) + Playwright 드라이버 `bench/web/run.ts`(devDependency는 Playwright 하나, 하니스 페이지 자체는 0).

계측 방식 (`probe.js`):
- **FPS/프레임**: `requestAnimationFrame` 타임스탬프 수집 → 프레임 간격 배열에서 평균 fps · p95 간격 · 드롭 비율(>16.7ms 프레임/전체) 산출.
- **롱태스크**: `new PerformanceObserver(cb).observe({ type: "longtask", buffered: true })` — 계측 창(시나리오 시작 mark~종료 mark) 내 건수·최대 duration.
- **상호작용**: `performance.mark()` 쌍 + Event Timing(`{ type: "event", durationThreshold: 16 }`) 병행 — 핸들러 시작→다음 페인트를 `requestAnimationFrame`+`setTimeout(0)` 이중 콜백으로 페인트 경계 근사.
- **규약**: 목데이터 생성·DOM 초기 주입은 `probe.start()` 이전에 완료(W5 규약). 각 시나리오 5회 반복, 첫 1회 워밍업 폐기, 중앙값 채택. 결과는 `bench/web/results/*.json`으로 기록.

Playwright 드라이버 역할: 헤드리스 Chromium 기동 → 시나리오 페이지 로드 → 스크롤/입력을 CDP `Input.dispatchMouseEvent`로 실주입(합성 `dispatchEvent`는 스크롤 컴포지터 경로를 타지 않으므로 금지) → `page.evaluate`로 probe 결과 회수. `--cpu-throttle 4` 옵션으로 저사양 시나리오 병행.

주의(레포 운영 경험 승계): 헤드리스/숨은 탭에서 RAF가 정지할 수 있다 — 벤치 탭은 항상 포그라운드 단일 탭으로 실행하고, RAF 무발화가 감지되면(1초간 0프레임) 하니스가 즉시 실패를 보고한다.

### 2.2 iOS — XCTest measure

위치(예정): `Tests/JunDSBenchTests/` — `measure(metrics:)`에 `XCTClockMetric`, `XCTCPUMetric`, `XCTMemoryMetric`, `XCTOSSignpostMetric` 사용.
- init 예산(I1): `measure { _ = Component() ; view.layoutIfNeeded() }` — 100회 반복 평균.
- 스크롤(I2): XCUITest로 실스와이프 + `XCTOSSignpostMetric.scrollDecelerationMetric`으로 hitch 계측.
- 바이너리(I3): 벤치가 아닌 사이즈 스크립트(§3.1)에서 릴리스 아카이브 후 `size`/`otool` 계상.

### 2.3 벤치 시나리오 목록 (리스크 톱10 기반)

ledger의 `bench:"todo"` 71건(웹 L 42 + finance Live·차트 29)이 모집단이며, 아래는 대표 시나리오다. 각 시나리오는 웹·iOS 쌍으로 작성한다(웹 전용 표기 제외).

| # | 시나리오 | 대상 | 게이트 |
|---|---|---|---|
| S1 | 10k행 그리드: 플링 스크롤 3초 + 열 정렬 + 행 선택 토글 | DataGrid·DataTable·Table·VirtualScroll·VirtualList·InfiniteList | W4/W5, I2 |
| S2 | 토스트 폭주: 100개/10초 발행+자동 소멸 | Notification·Snackbar(→토스트 싱글턴) | W5(0건), 메모리 누수 0 |
| S3 | 모달 개폐 100회 (포커스트랩+스크롤락 포함) | Modal·Drawer·BottomSheet·AlertDialog | W3, 리스너/노드 누수 0 |
| S4 | 차트 리샘플: 10k→1k 포인트 다운샘플 + 리사이즈 연속 20회 | Line/Area/Bar/캔들 등 차트군 | W3/W5 |
| S5 | 에디터 대량 입력: 5k자 연속 타이핑 시뮬 + 10k자 붙여넣기 | RichTextEditor·CodeEditor | W3(키입력당), W5 |
| S6 | 퍼지검색: 10k 항목 대상 연속 타이핑 8자 | CommandPalette·AutoComplete·Combobox | W3(키입력당 <50ms) |
| S7 | DnD: 500카드 칸반 드래그 1회 + 리스트 재정렬 | Kanban·SortableList·Transfer | W4(드래그 중 프레임) |
| S8 | 실시간 틱 폭주: 100 tick/s × 30초, 200행 구독 | finance Live* 계열 | W5(0건), 드롭 <5% |
| S9 | 캘린더 월 전환 24회 + 이벤트 500개 배치 | DsCalendar·CalendarMonth·DateRangePicker | W3 |
| S10 | 대용량 diff/마크다운: 5k라인 렌더 + 스크롤 | DiffViewer·MarkdownViewer | W5(마운트 예외 1건만) |
| S11 | 포인터 지오메트리: 크롭 드래그/서명 스트로크 3초 | ImageCropper·SignaturePad·ColorPicker | W4 |
| S12 | 코어 대조군: Button 1k개 마운트/언마운트 | 코어+primitives 회귀 카나리아 | W1 회귀 감지 |

## 3. CI 게이트

### 3.1 번들 사이즈 게이트 (자체 스크립트)

`scripts/size-gate.mjs`(의존성 0, node:zlib gzip): 빌드 산출물별 gzip 크기 실측 → `docs-spec/registry/budgets.json`(코어 8192B, 컴포넌트별 상한 — 기본 12288B, L 예외 목록 24576B)과 대조.
- 실패 조건: (a) 절대 상한 초과, (b) 직전 기준선 대비 +3% 초과 증가(상한 내라도 — 점진 비대화 차단).
- 평균 4KB(W2)는 전체 합산/개수로 매 실행 리포트에 출력하고, 초과 시 실패.
- iOS: 릴리스 빌드 후 코드 세그먼트 크기를 기준선 JSON과 대조, +1MB 초과 시 실패.

### 3.2 벤치 회귀 게이트

- 기준선: `bench/baselines/*.json`을 레포에 커밋(머신 프로파일 키 포함 — CI 러너와 로컬 M1 기준선 분리).
- PR 게이트: S12 + 해당 배치가 건드린 컴포넌트의 시나리오만 실행(스모크). 시간 지표 ±10% 허용 오차, 초과 시 1회 자동 재실행 후 재현되면 실패. 건수 지표(롱태스크·누수)는 오차 없음 — 즉시 실패.
- Nightly: 전체 시나리오 실행 + 기준선 자동 갱신 PR(사람 승인 머지).
- 벤치 게이트 판정과 수치는 ledger의 해당 행 `bench` 필드에 반영한다(`todo`→`pass(수치)` 형식).

## 4. 네이티브 가속 결정 트리

**원칙(D6 재확인): 측정 없는 도입 금지. 도입 시 같은 시나리오의 전/후 수치를 DECISIONS에 필수 기록. 수치 없는 가속 PR은 리뷰 없이 반려.**

```
병목 실측(§2 하니스) → 예산 미달 확인
 ├─ 웹
 │   1차: 알고리즘/구조 — 가상화, 증분 렌더, 다운샘플(LTTB), 메모이즈, 배칭(RAF 병합)
 │   1.5차: Worker 오프로드 — 순수 연산(정렬/필터/지표계산/파싱)만.
 │          직렬화 비용이 연산 이득을 상회하면 기각 (postMessage 왕복 실측 필수)
 │   2차: WASM — 1차·1.5차 후에도 미달 && 연산이 DOM 비의존일 때만
 │       언어 선택: Rust — 복잡한 상태·파서·지표엔진 등 로직 규모가 클 때 (메모리 안전 + wasm-bindgen 성숙)
 │                 C   — 단일 핫루프(리샘플·인코딩)를 최소 바이너리로 넣을 때 (수 KB 산출 가능)
 │                 C++ — 검증된 기존 구현(예: diff, 이미지 처리 라이브러리)을 포팅할 때만
 └─ iOS
     1차: 알고리즘/구조 — 셀 재사용, diffable snapshot, CALayer 직접 드로잉, 백그라운드 연산(Task)
     2차: Accelerate(vDSP/vImage) — 대량 벡터 연산(리샘플·통계·이미지 필터)
     3차: Metal — 초당 수만 프리미티브 드로잉(대형 히트맵·Globe급)일 때만
     4차: C/Rust FFI — 웹 WASM과 동일 코어를 공유할 실익이 실측될 때 (단독 도입 금지)
```

주의: WASM/FFI는 DOM·UIKit 경계를 넘는 순간 이득이 사라진다 — 경계 왕복 횟수가 프레임당 1회를 넘는 설계는 도입 전 기각.

### 4.1 인벤토리 기준 가속 후보와 예상 판정

| 후보 | 병목 가설 | 예상 판정 |
|---|---|---|
| DataGrid/DataTable 정렬·필터 | 10k행 재계산 | **1.5차(Worker)로 종결 예상** — WASM 불필요. 렌더는 가상화(1차)로 해결 |
| 차트군 리샘플 | 10k+ 포인트 경로 생성 | **1차(LTTB JS)로 종결 예상**. 10만+ 포인트 요구가 실재할 때만 C-WASM 재검토 |
| finance 캔들+지표 계산 | 틱 스트림 집계 | **1.5차(Worker) 1순위**. 지표엔진이 커지면 Rust-WASM 후보 — 웹·iOS 코어 공유 실익 검토 대상 1호 |
| RichTextEditor | 셀렉션·재조판 | **1차만 유효** — DOM 바운드라 WASM 부적합. iOS는 TextKit2 활용 |
| DiffViewer | diff 알고리즘 | 1차(Myers 자체 구현). 5k라인 초과 미달 시 **C++ 포팅 후보** |
| QRCode 인코딩 | 순수 연산 | **JS/Swift 자체 구현으로 충분 예상** (소규모 행렬) — 가속 기각 예상 |
| Globe·MarketHeatmap 대형 | 드로잉 자체 | 웹 Canvas 2D→(미달 시) WebGL, iOS **3차(Metal) 유일한 선제 유력 후보** |
| CommandPalette 퍼지검색 | 10k 문자열 스코어링 | **JS 충분 예상** (S6 실측으로 판정) |
| ImageCropper/SignaturePad | 포인터 이벤트율 | 1차(RAF 배칭·포인터 coalescing). iOS는 PencilKit 대체 우선 |

## 5. ledger 연동

- `bench:"todo"` 행(71건)은 해당 시나리오 최초 통과 시 `pass(핵심수치)`로 갱신 — 예: `pass(58fps/p95 15.2ms)`.
- 가속 도입이 승인된 행은 `notes`에 `accel:` 접두로 결정과 전/후 수치 요지를 기록하고, 전문은 DECISIONS에 남긴다.
