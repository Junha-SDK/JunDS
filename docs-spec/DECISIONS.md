# JunDS v3 — DECISIONS (append-only)

각 항목: 날짜 / 결정 / 근거 / 결정자(사람 승인 or 기본값 채택).

---

## 2026-07-24 — web-a11y 게이트 실측 위반 수정 (critical/serious 7건 → 0)

### DEC-027. danger 토큰 승인 이탈(첫 사례) + 컴포넌트·데모 a11y 보정 7건
(번호 주: 025·026은 B4·MCP 트랙이 선점 — 027로 비켜 부여.)
web-a11y 게이트(.github/scripts/web-a11y-audit.mjs, axe-core·실브라우저)가 데모 5페이지에서
critical 1(label)·serious 6(color-contrast 5그룹 + scrollable-region-focusable)를 실측 —
전부 수정(display.html은 작업 중 B4 착륙으로 표면 합류). jsdom 기반이던 v2 audit은 색
대비를 계산하지 못해 v2 값이 그대로 통과해 왔다.
1. **danger 토큰 라이트 보정 — 시각 패리티 원칙의 첫 승인 이탈**: v2 `#dc3f3f`는 라이트에서
   흰 글자 4.35:1, `--jd-color-background` 위 텍스트 3.97:1, danger-light 위 3.96:1로 전부
   WCAG AA(4.5) 미달. `{ light: "#c93636", dark: "#dc3f3f" }` 모드 리프로 분리 — 라이트는
   흰 글자 5.17·bg 4.72·danger-light 4.70으로 통과, 다크는 v2 값 유지(다크 배경 위 텍스트
   4.51 통과 — 더 어둡히면 이쪽이 깨진다. 흰 글자 4.5↑와 다크 바탕 텍스트 4.5↑는 단일 값으로
   양립 불가: L≤0.183 vs L≥0.191). 동일 색상(H=0)·명도만 강하. dangerHover(#b92f2f, 여전히
   danger보다 어두움)·dangerLight·focus-ring-danger는 미변경.
   - **집행 경로**: 패리티 테스트에 `SANCTIONED_DEVIATIONS` 표 신설(02-tokens §6 개정) —
     v2 동결본 기대값 + 승인값 + DEC 번호를 함께 고정해, 제3의 값 드리프트와 동결본 변경
     양쪽 모두 여전히 실패한다. iOS `JdDynamicColor(light: 0xC93636FF, dark: 0xDC3F3FFF)`
     동반 갱신(생성기 산출). react 표면은 var() 참조라 무변경.
   - **귀결**: v2 시각 패리티 기준 캡처의 danger 계열(버튼 danger·에러 텍스트 등)은 의도된
     delta. 다크 모드의 danger 버튼(흰 글자 on #dc3f3f = 4.35)은 게이트 밖(감사는 라이트
     초기 상태)이며 값 상충상 토큰 단독으론 불가 — 표면 분리(danger-surface) 여부는 G2
     시각 재심의 목록으로 이월.
2. **jd-textarea 카운트 배지**: `muted-light`(유리 배경 위 2.8:1) → `muted`(5.2:1).
3. **jd-toggle/jd-switch disabled**: v2의 행 전체 `opacity: 50%`는 라벨 텍스트를 2.9:1로
   떨어뜨림 — axe는 `<label>` 연결 disabled 면제를 input/select/textarea에만 주고 내부
   `<button role="switch">`에는 주지 않는다(axe-core color-contrast-matches 실측). 반투명은
   트랙·썸에만 한정하고 라벨은 `muted` 실색으로 분리(양 컴포넌트 동형 적용).
4. **jd-app-shell 본문 스크롤러**: `<main class="__content">`(overflow:auto)가 포커서블
   자손 없는 페이지에서 키보드 스크롤 불가(serious) → `tabIndex=0` 상시 부여 + 안쪽
   `:focus-visible` 링. 사이드바는 관례상 포커서블 내용(nav)을 담아 비대상.
5. **jd-button danger 호버 글로우**: 리터럴 `rgba(220,63,63,.25)` →
   `color-mix(in srgb, var(--jd-color-danger) 25%, transparent)` — 토큰 보정 자동 추종.
6. **jd-badge success/warning/danger 텍스트 (B4 표면)**: 원색 텍스트가 10% 틴트 위에서
   3.0~4.1:1 미달(danger는 보정값으로도 4.09 — 틴트가 흰 배경보다 어두워 기준이 더 높다).
   틴트·점·링은 비텍스트라 원색 유지, **텍스트만** badge-local `color-mix(토큰 80/75/90%,
   #000)` 파생(각 4.79/4.85/4.83). 다크는 v2 원색 복원(어두운 틴트 위엔 원색이 우세) —
   컴포넌트 국소 파생으로 토큰 어휘 선점을 피했고, `-text` 토큰 승격 여부는 G2 어휘
   재심의 인풋(primary/info는 원색이 5.0+로 통과, 미변경).
7. **jd-battery-indicator % 텍스트 (B4 표면)**: v2 `mix-blend-difference`는 axe가 평가
   불능(선언 흰색 vs 밝은 배경으로 실측 → serious). 흰 글자 + 다크 헤일로(text-shadow
   3겹)로 번역 — 임의 채움색·양 테마 위 판독성은 blend와 등가, axe는 text-shadow를 대비
   제공자로 인정.
8. **데모 셸**: `.demo-label`(core·layout)·`#log`(index·form)의 `muted-light`(2.7:1) →
   `muted`(4.9:1). form.html의 이름 없는 error 텍스트영역(critical)은 placeholder 부여 —
   첫 텍스트영역과 동일한 이름 폴백 메커니즘. (jd-label for → 호스트 id 연결이 네이티브로
   성립하지 않는 갭은 본 트랙 범위 밖 — B3 후속.)
- 검증: `npm run tokens:test` 15/15 · web vitest 209/209(+gen-exports drift 0) ·
  web e2e 24/24 · tsc 0err · `npm run build -w @junds/web` 후
  `node .github/scripts/web-a11y-audit.mjs` **5페이지 critical/serious 0** (advisory
  heading-order·landmark·region·page-has-heading-one은 게이트 밖 — 미수리).
- 결정자: 게이트 실측 근거로 기본값 채택 (2026-07-24).

---

## 2026-07-24 — MCP 구현 완료 (도구 5종 + 콘텐츠 정본 통일)

### DEC-026. MCP 구현 판단 4건 — 콘텐츠 정본은 콘텐츠 트랙 채택
(번호 주: 022~025는 react·B3·e2e·B4 트랙이 선점 — 026 부여. 본 트랙 게이트 승인분은 DEC-016.)
1. **docs-content 정본 통일**: DEC-016-2가 계획한 `docs-spec/registry/docs-content/`는
   구현 중 콘텐츠 트랙이 선착시킨 루트 `docs-content/` 445건(DEC-021, d88592b)으로
   대체 — 같은 목적의 저장소 이원화 금지. 초판 28건은 미커밋 상태에서 회수. Q2 승인의
   원칙(단일 저작점·ledger 정합)은 그대로, 위치·스키마만 정본 채택. 08-mcp §3.2 개정.
2. **CE 태그 파생**: 정본 파일에 태그 필드가 없어 web 스니펫의 첫 `<jd-*>`에서 파생
   (build-index가 실물 대조하는 값이라 근거 충분) — size-baseline(kebab 키) 매핑·응답
   tag 필드의 원천. 조인 키는 (ledgerId, category) — 원장 중복 id(AreaChart) 대응.
3. **게이트 역할 분담**: 스키마·전단사·실물 대조는 정본 검증기(build-index.mjs)에 위임
   (로직 중복 저작 금지). MCP 보완 게이트 1건만 신설 — 정본 게이트는 ¬done ⇒ null
   방향만 강제하므로 역방향 "web done* ⇒ web 스니펫 저작"을 content-gate.test가 강제
   (DEC-016-2 계승). 실효 확인: 도입 즉시 B3 폼 코어 9종의 미저작을 실검출, 실물
   (element.ts props·demo/form.html) 근거로 충전해 그린 (web 스니펫 28→37).
4. **get_usage 템플릿 토큰 치환**: web 스니펫의 `{prop}`(06 §2.3)은 controls 기본값을
   주입해 반환 — "복사해 바로 동작"이 MCP 계약. react 플랫폼은 정본의 v2 참고 스니펫
   (Example 169 이관분)을 "v2 참고" note와 함께 반환.
- 검증: nvm22 vitest 47/47(단위·정합 게이트·토큰 패리티 전수 대조·InMemory 왕복·
  스냅샷 동일성) + build-index 445건 통과 + stdio JSON-RPC 실왕복(initialize→tools/call).
- 결정자: 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B4 primitives 표시 구현 중 발견 (10행 — Divider 별칭 포함)

### DEC-025. B4 표시 프리미티브 판단 5건
1. **Tailwind 팔레트 리터럴 승계 확대**: v2 표시 컴포넌트들은 토큰 밖 Tailwind 팔레트
   (blue/emerald/amber/red/orange/purple/teal/violet/rose/cyan 50·100·500·700, gray 계)를
   직접 썼다 — 패리티 원칙대로 hex 리터럴 승계(Badge info·Tag 7색·Avatar 팔레트 8종·
   상태점·배터리). semantic 토큰이 존재하는 축(primary/success/warning/danger)만 토큰 참조.
   G2 색 어휘 재심의의 입력 목록에 등재.
2. **장식 점(dot)은 CSS ::before로 통일**: Badge·StatusDot·SeverityBadge의 상태 점은
   DOM 0(의사요소) — v2의 span 렌더 대비 골격이 얕아지고 aria 노이즈가 없다.
   라벨·카운트처럼 **텍스트를 갖는 표면만** 실제 노드.
3. **Badge count 모드**: attribute 존재(hasAttribute)가 모드 판정 — count=0도 표시(v2
   `count !== undefined` 동형). children과 병용 금지 문서화(v2는 children 무시 렌더였음).
4. **Avatar 이름 해시 팔레트는 결정적 허용**: Math.random이 아니라 이름 문자 해시
   (v2 알고리즘 이식) — 같은 이름=같은 색이라 §3.1-3(프리렌더 결정성)과 정합.
   KeyCap의 v2 bg-surface/surface-soft(Tailwind 커스텀 클래스)는 --jd-color-card/
   card-hover로 근사 번역 — 정확 대응 토큰 부재 기록.
5. **BatteryIndicator 다크 보더**: v2 dark: 클래스는 [data-jd-theme="dark"]/[data-theme=
   "dark"] 자손 셀렉터로 번역(gray-400→500). lg만 % 텍스트(mix-blend-difference) 유지.
- 검증: vitest 209/209 · size-gate PASS · demo/display.html puppeteer 실측 —
  count 99+·jd-remove 태그 제거·이니셜/팔레트 결정성·배터리 임계 자동색·kbd 결합
  전부 재현, 콘솔 에러 0.
- 결정자: B4 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — e2e B2 확장 + 실브라우저가 잡은 DEC-014-9 위반 2건 수정

### DEC-024. B2 표면 e2e 8케이스 + box-sizing 정합 수정
1. **e2e 확장(layout.spec.ts)**: show/hide 실 미디어쿼리(양방향), container 기하
   (max-width 상한·중앙 정렬·오버플로 가드), app-shell 상호작용(Ctrl+B 레일 접기+
   jd-sidebar-toggle, 모바일 드로어+백드롭+스크롤 락, matchMedia 데스크톱 복귀 자동 닫힘,
   defaultPrevented 존중) — 총 24케이스 그린.
2. **실브라우저가 실증한 DEC-014-9 위반 2건 수정**: (a) jd-container —
   width:100%+padding-inline에 box-sizing 미선언으로 총폭 1072px(v2 preflight
   border-box에선 1024px)·부모 +48px 오버플로. (b) .jd-app-shell__sidebar —
   width+border-right로 레일 총폭 261px(지정 260). 각 규칙에 `box-sizing: border-box`
   자기 선언 추가 — v2 시각 패리티(총폭=지정폭) 복원.
3. **container 사이즈 기준선 +5.9% 갱신**(559→592B gzip): 수정 선언의 의도된 증가.
   app-shell은 3% 내(+1.4%). 교훈: css 템플릿 내 주석은 배포 바이트 — 짧게.
- 결정자: e2e 실측 후 수정, 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B3 primitives 폼 코어 구현 중 발견 (신규 9행)

### DEC-023. B3 폼 코어 판단 6건
1. **Slider는 네이티브 range 위임으로 재작성**: v2는 마우스·키보드를 수제 구현했으나
   §1.6-1 원칙대로 input[type=range] 위임 — 키보드(화살표/Home/End)·aria·터치·폼 참여가
   브라우저 기본. 시각 패리티(채움 트랙)는 appearance:none + 그라디언트 %
   (--_jd-slider-pct, update() 공급) + ::-moz-range-progress로 재현. v2와 달리
   드래그 중 트랙 어디를 눌러도 네이티브 시킹이 동작(상위집합).
2. **RangeSlider는 수제 유지(위임 예외)**: 네이티브 range는 단일 값 — v2의 포인터 캡처
   구현을 이식(썸 2개 role=slider + 키보드 + step 간격 클램프). v2 value:[a,b] 튜플은
   복합 attribute 금지(WEB-03) → min-value/max-value 스칼라 2프롭으로 분해.
   드래그 중 jd-input · 확정 시 jd-change(§1.5 canonical 분리 — v2는 단일 onChange).
3. **RadioGroup 옵션 입력 2경로**: options 프로퍼티(Array) + 자식
   <script type="application/json"> 슬롯(§1.3 명시 허용 패턴 첫 사용례 — Slider marks도
   동일). 네이티브 radio 묶음이라 화살표 순회·단일 탭스톱·폼 참여가 공짜(roving Behavior
   불필요). name 미지정 시 jdUid 자동 발급(문서 유일 그룹 보장).
4. **Checkbox indeterminate는 네이티브 프로퍼티만**: v2의 수동 aria-checked="mixed"는
   불필요(브라우저가 mixed를 AT에 전달). 사용자 조작 시 mixed 해제(네이티브 정합).
   Textarea error는 v2 그대로 boolean(TextField의 메시지 문자열과 표면 상이 — v2 실태 승계).
5. **Switch = Toggle 파생(단일 구현)**: 로직 전량 공유, baseClass/시트/기본 aria 라벨만
   재정의(jd-switch__* 골격). v2 Switch의 i18n 기본 라벨 t("ariaSwitch")는 상수 "스위치"로
   — i18n Behavior 합류 시 재연결. Toggle/Switch/Checkbox의 라벨 클릭 토글은 label 래핑의
   네이티브 연결(첫 labelable 자손)로 공짜.
6. **gen-exports 첫 실전 배치**: B3 9종 추가에 수기 배선 0곳 — 생성기 재실행만으로
   exports 75엔트리·ALL_COMPONENTS 37종 갱신, drift 게이트가 npm test 선두에서 검증
   (DEC-018-1 설계 검증 완료). gray-300/200 리터럴(#d1d5db·#e5e7eb — 토글 트랙·슬라이더
   레일 미채움)은 v2 Tailwind gray 승계 — G2 gray 어휘 재심의 목록에 추가.
- 검증: vitest 194/194 · size-gate PASS(평균 0.97KB·p95 2.22KB) · demo/form.html
  puppeteer 실측 — 토글 aria 반전·autoResize 성장·카운터·라디오 선택 이벤트·슬라이더
  채움 %·듀얼 썸 aria 전부 재현, 콘솔 에러 0.
- 결정자: B3 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — 릴리스·CI 준비 트랙 (v3 레인 11게이트 + 드라이런 + 스코프 조사)

### DEC-22. 릴리스 체인 준비 — 판단·실측 7건
1. **CI 2파일 분리**: v2 강등은 ci.yml `on.paths` 추가만(14잡 무변경 존속), v3 레인은
   `.github/workflows/junds-v3.yml` 신설 — 11게이트 + install 캐시 워머. GitHub 네이티브
   paths 필터는 워크플로 단위가 유일해 파일 분리가 정공(잡별 필터는 서드파티 액션 의존이라
   기각). v3 레인은 node 22(tokens 생성기 명시 전제) — v2 레인 20과 캐시 키 분리.
2. **게이트 형태**: ios-build/-test는 xcodebuild 경유(DEC-013-6 승계)·macos-14. bench-smoke는
   05 §3.2대로 G2까지 advisory(continue-on-error). react는 자리표시자 동안 `--if-present`
   무해 통과(DEC-011-5 동형) + `::notice` 명시(침묵 금지) — finance-data는 본 트랙 검증 중
   실구현(DEC-019)이 합류해 실게이트로 자동 전환됨을 확인(계약 테스트 77/77). web-a11y는
   `.github/scripts/web-a11y-audit.mjs` 신설: 데모 디렉터리 스캔 + axe-core 주입,
   critical/serious 실패, 빈 감사·CE 미업그레이드 페이지도 실패(false pass 차단).
   web-test Playwright는 스펙 존재를 키로 자동 활성(1순위 packages/web/e2e/*.spec.ts
   + 자체 config, 2순위 루트 e2e/v3-*) — config만 있고 스펙 0건인 HEAD에서
   "No tests found" 오탐을 피하는 설계.
3. **로컬 성립 증명**: act 부재 → HEAD(38514fe) 분리 워크트리에서 iOS 제외 9게이트 명령
   전부 1회 실행: 8게이트 PASS, web-a11y만 실위반(serious contrast 4건/3페이지)으로 RED —
   게이트가 정상 동작한 결과. iOS 2게이트는 로컬 검증 불가(DEC-015-2 서명 파손 재확인:
   xcodebuild -list까지 libclang에서 사망) — 실체는 DEC-015-1로 기검증, CI 첫 실행 확인
   항목은 스킴명('JunDS' vs 'JunDS-Package')·destination('iPhone 15')뿐.
4. **changesets 확정**: fixed 락스텝 [[web, react, finance-data]] + access "public"
   (스코프 공개 배포 전제 — 무료 org에서 restricted publish는 402). 실측 함정 2건:
   @changesets/cli devDependency 부재(scripts만 존재), 현행 3.0.0-alpha.0에서 pre 모드
   미진입 시 `changeset version`이 prerelease를 벗김 → `changeset pre enter alpha` 선행
   필수(체크리스트 §3 절차화).
5. **패키징 드라이런 실측**: @junds/web pack → exports 57항 전수 실파일 확인, 신규 프로젝트
   설치 ESM/Node/CSS 스모크 통과. 블로커 3건 — exports types 조건 전무(신규 프로젝트
   tsc에서 TS7016 재현), prepack 부재(스테일 dist 무언 배포 경로), LICENSE/README 미동봉.
   수정처는 gen-exports 생성기(DEC-018)라 웹 트랙에 위임. react tarball 단독 설치는
   404(@junds/web 미공개 의존, 클린룸 재현) — 동시 제공/선공개로 해소. finance-data는
   esm/cjs/types+README 정상, 잔여는 LICENSE·files 필드.
6. **스코프 조사(읽기 전용, 예약 시도 없음)**: npm user·org 'junds' 모두 미존재
   ("Scope not found" 실측) — @junds 가용. 대상 7이름(@junds/web·react·finance-data·ui,
   junds, junds-web, create-junds) 전부 404 미공개. 예비 후보: @jjunhaa(가용 확인),
   무스코프 junds-*(junds-web 404 확인). org 생성은 사람 몫 — 선점 지연 리스크를
   체크리스트 §0에 명기.
7. **release/CHECKLIST.md 신설**: push→CI 그린→pre enter→version→publish(private 자동
   스킵)→SPM 태그 vX.Y.Z(01 §5 공통 앵커, prerelease는 exact: 소비 안내)→CDN 스모크까지
   사람 실행 정본. create-junds는 조사만(수정 없음) — 템플릿 의존 @junds/ui@^2.2.0이
   npm 미공개라 공개 사용 불가 실측, v3 대응 4건을 §7에 기입.
- 결정자: 릴리스 준비 트랙, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G1 React 어댑터 파일럿 (Button·TextField·Modal — v2 호환, DEC-008-(1)(2) 검증)

### DEC-022. React 어댑터 실측 판정 — DEC-008-(1) **채택 유지** + 저작 규약·보정 9건

(번호 주: 020 이중 선점·021 병행 선점(문서 콘텐츠 트랙)으로 022 부여.)
packages/react 파일럿(스캐폴드 + 어댑터 3종 + 테스트 55, react-dom 19.2.4 실측:
RTL/happy-dom 단위 + renderToString SSR + "SSR→CE 업그레이드→hydrateRoot" 순서 재현).

1. **DEC-008-(1) 판정: 채택 유지.** "어댑터가 골격을 React로 렌더하고 CE가 입양"은
   실측에서 성립: 내부 노드 identity가 CE 입양·리렌더·hydration을 관통해 유지, 이중
   구축 0, hydration 경고 0(아래 2·3 규약 적용 후), ref/클릭/폼 제출(네이티브 위임)
   정상. 단 아래 2~4의 **어댑터 저작 규약 3건이 성립 필요조건**으로 드러남 — 원리
   자체의 재심의 사유는 아니며, 후속 react-adapter 스펙에 규범으로 승격할 것.
2. **[규약 A] CE가 입양 자식의 children을 재구축하는 노드는 어댑터가
   dangerouslySetInnerHTML로 렌더한다.** jd-text-field update()가 label(textContent=)·
   error 행(innerHTML=)의 children을 통째로 갈아끼움 — React가 그 텍스트 노드를 소유하면
   이후 리컨실이 분리(detached) 노드를 만진다. dSIH는 React가 내부 children을 diff하지
   않아 안전하고 SSR 완성 골격(§11-4)도 유지된다. 역제안(웹 트랙 재심의감): 입양 계약에
   "입양 노드의 children 소유권" 명시 필요 — CE가 children을 재구축하는 노드 목록을
   컴포넌트 스펙에 고정할 것.
3. **[규약 B] CE update()가 정규화하는 속성은 어댑터가 같은 값으로 항상 명시 렌더한다.**
   실측: jd-text-field update()가 hydration 전에 input에 type="text"·placeholder=""를
   기본값 명시(정규화)로 추가 → React 19의 속성 hydration 검사가 서버 HTML과의 불일치
   경고 2건 발행. 어댑터가 type/placeholder를 기본값 포함 항상 렌더해 서버 HTML =
   CE 정규화 결과 = 클라이언트 프롭 3자 일치로 해소(경고 0 실측).
4. **[규약 C] value류(CE 자가 상태)는 3중 방어가 필요하다.** (a) host value attribute를
   SSR에 직렬화 — 없으면 CE 최초 update()가 host 기본 ""와의 diff로 **서버 값을
   hydration 전에 소거**(플래시, 실측·회귀 고정). (b) 커밋마다 layout effect로
   host.value 정렬 — defaultValue 소거·controlled 수용 담당. (c) onChange 디스패치 안에서
   host.value를 prop 값으로 동기 재고정 — CE #onInput의 자가 동기화가 React controlled
   "거부"(재렌더 없는 복원)를 이후 update()에서 되덮는 것을 차단(실측·회귀 고정).
5. **DEC-008-(2) 검증: 합성 성립, 단 2조건.** (a) 구독은 **layout effect 필수** —
   CE 최초 render가 microtask(DEC-012-1)라 passive effect는 마운트-열림의 jd-open을
   놓친다(실측: layout 구독으로 포착). (b) CE disconnect는 silent close(jd-close
   미발행)라 언마운트 경로의 false는 어댑터 cleanup이 합성. v2 Modal 표면에는
   onOpenChange가 없어 가산 프롭으로 제공하고, v2 호환의 본체는 **제어형 역번역**:
   jd-request-close(cancelable, §1.5)를 preventDefault하고 onClose만 호출 — 요청형
   이벤트의 취소 계약이 제어형 어댑터의 구현 지점을 정확히 수용함을 확인.
6. **§11-1 보정: 반영형 enum/boolean 호스트 프롭은 ref 이펙트 property 대입이 아니라
   JSX attribute로 직접 렌더한다.** 근거: SSR 완성 골격(§11-4)의 스타일 훅(variant/size/
   open 호스트 속성 셀렉터)이 서버 HTML에 있어야 한다. React 18은 attribute 경로
   (attributeChangedCallback→coerce), 19는 프로퍼티 대입 경로로 양쪽 다 §1.3과 합류.
   boolean은 반드시 `cond ? true : undefined`(React 18 SSR이 false를 문자열 "false"
   attribute로 직렬화해 존재=참 규칙을 깨는 함정 차단). 비반영 프롭(value)은 §11-1 그대로.
7. **v2 표면 판정(요지 — 전체 표는 packages/react/README.md).** Button: 전 프롭 O,
   type 기본값은 v2/네이티브 submit 유지(코어 단독 기본 button과 상이 — 어댑터가 호스트에
   명시 전파), **asChild ✗**(입양 쿼리 button 태그 고정 + variant 스타일의 호스트 속성
   셀렉터 의존 — Slot 폴백은 기본 시각만) → 후속 스펙에서 (a) 입양 쿼리 클래스 완화 +
   variant 클래스 이중 방출 or (b) asChild 미지원 문서화 중 택1 필요. Input: error
   boolean 단독 △(v3는 메시지=상태라 시각 훅 부재 — 경고), leftSlot/rightSlot ✗(G1 범위
   외, DEC-012-5). FormField: 자식 Input/TextField로 폴드(합성), required 폴드는 별표와
   함께 네이티브 required도 켜짐(v2는 별표만 — 의미 가산, 문서화). Modal: 전 프롭 O·
   dismissible→persistent 역번역 O, Header/Footer는 구조·a11y 동형이나
   jd-modal__header/footer css가 코어에 미존재(웹 트랙 후속).
8. **소유 밖 발견 3건(해당 트랙 이관 제안).** (a) 루트(v2 @junds/ui) package.json
   exports의 "types" 조건이 "import"/"require" 뒤라 사문(死文) — esbuild 경고 51건,
   어댑터 빌드는 logOverride로 억제. (b) packages/web exports에 types 조건 부재 —
   어댑터 d.ts가 참조하는 JdButton류 타입이 소비자 측에서 미해결(웹 package.json에
   types 조건 추가 필요). (c) 루트 eslint globalIgnores "dist/**"가 루트 상대라
   packages/*/dist 미제외(dist는 gitignore라 CI 무관, 로컬 노이즈만).
9. **검증 범위·빌드 판단.** react 19.2.4로 실측(peer는 >=18 — 18은 attribute 경로 설계
   대응이며 실행 매트릭스는 후속 제안). 어댑터 typecheck는 ../web/dist/types(.d.ts)를
   paths로 참조(소스 .ts 참조 시 웹 소스가 프로그램에 편입돼 dist/types 2단 재방출
   — 실측) → 웹 빌드 선행 전제(루트 v3:build 워크스페이스 순서가 보장). 테스트는 vite
   alias로 웹 소스 직결(빌드 신선도 무의존). devDeps는 루트 호이스팅 사용(자체 0) —
   peerDependencies 신설로 package-lock 재동기화 1회 필요(루트 파일이라 본 트랙 미커밋).
- 결정자: G1 어댑터 파일럿 실측, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — 문서 콘텐츠 1차 물결 (docs-content/ 신설 — 골격 445 + done 28 충전)

### DEC-021. 문서 콘텐츠 데이터 계약·판단 7건
(번호 주: 020은 병행 트랙 2건(웹 e2e·아이콘)이 이중 선점한 상태 — 본 트랙은 021로 비켜 부여.)
1. **파일 = 정본, 상태 비보존**: `docs-content/<id>.json` 445건(컴포넌트당 1파일)이 수기
   정본이다. 시딩은 1회(ledger + COMPONENTS.md + 실물 소스 파생)로 끝났고 재생성기는 두지
   않는다 — 이후 갱신은 파일 직접 편집. web/ios **상태는 파일에 저장하지 않는다**(ledger가
   유일 정본, `build-index.mjs`가 검증 후 조인해 index.json으로 방출, 실패 = 빌드 실패).
   ledger의 docs 필드 갱신은 레지스트리 소유 트랙 몫으로 미접촉.
2. **문서 id 규약(06 §1.1 `?c=` 값)**: ledger id의 kebab 기계 변환 + 예외 2건
   (HStack→`hstack`, VStack→`vstack` — 웹 태그 실물 정합), 동명이인은 후행 행에 카테고리
   접두(finance AreaChart→`finance-area-chart`). 조인 키는 (ledgerId, category) —
   category는 중복 저장이지만 검증기가 ledger 불일치를 빌드 실패로 잡아 드리프트를 차단.
3. **스니펫 게이트(검증 강제)**: 플랫폼 스니펫은 ledger가 done*일 때만 비-null(미구현
   스니펫 = 추측 = 실패). 실물 대조 — web `<jd-*>` 태그·`@junds/web/*` 서브패스는
   packages/web(element.ts tag 선언·package.json exports), iOS `Jd*`/`jd*` 식별자는
   packages/ios/Sources 선언, react import 명은 ds/ 배럴 export와 대조한다.
4. **컨트롤 연동 템플릿 토큰은 web 한정**: `{prop}` 토큰(06 §2.3 치환 계약)은 web 스니펫의
   비-boolean 컨트롤만 쓴다. iOS 스니펫은 정적 — 표면 축이 웹과 다른데(DEC-013-4: variant
   4종·size 3종) 공유 토큰을 주입하면 무효 Swift가 된다. boolean attribute는 존재=값이라
   문자열 치환 대상이 아니다.
5. **v2 자산 이관 범위**: react 참고 스니펫은 이 레포 COMPONENTS.md Example 169건 기계
   이관(전 Example). 문서명=모듈 파일명 드리프트 2건은 Import 줄만 실제 export 명으로 보정
   (Calendar→DsCalendar, Sidebar→DsSidebar — 복붙 동작 > 원문 보존). md "Sidebar"(patterns
   문서)가 동명 finance Sidebar 행에 오귀속되는 함정은 카테고리 대조로 차단. MySelf
   junds-usage.data.ts의 갭 저작 키(~42)는 본 트랙 접근 범위 밖 — 문서 트랙 sync 시
   react:null 골격에 병합할 것.
6. **CoreProvider(web done(내부화)) 문서**: CE가 없으므로 web 스니펫은 CSS 토큰 오버라이드
   + `data-jd-theme` 소비자 표면(DEC-014-6)으로 저작. LayoutDivider(별칭, 신규 태그 없음)도
   동형 — `<jd-divider>` 사용법으로 저작.
7. **검증 실측**: build-index 통과(445건) + 웹 스니펫 28종 전부를 dist 실빌드에 복붙한
   스모크 페이지 브라우저 실측 — 콘솔 에러 0, 28 태그 전원 업그레이드, 구조 단언
   (label↔input 연결·role=dialog·separator·랜드마크 4종·auto-fill 칼럼·jd-sidebar-toggle)
   통과. 검증기 자체도 변이 테스트 5종(미지 태그·미구현 스니펫·유령 파일·오탈자 식별자·
   가짜 import)으로 오검출이 아니라 실검출임을 확인.
- 결정자: 문서 콘텐츠 트랙, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — Playwright 실브라우저 상호작용 스위트 신설 (03 §9 의무 구간)

### DEC-020. 웹 e2e 스위트 판단 3건
1. **자체 config (03 §9.1 "루트 playwright.config.ts에 프로젝트 추가" 이탈)**:
   루트 config의 webServer는 v2 문서앱(next dev :6100)을 전역 부팅한다 — 프로젝트 선택과
   무관하게 기동되므로 CE 스위트(서버 불요, dist 주입 setContent)에 비용·포트 충돌만 낳는다.
   `packages/web/playwright.config.ts` 독립 config로 확정, 실행은
   `npx playwright test -c packages/web/playwright.config.ts` (전제: dist 빌드).
   루트 스크립트 합류는 package.json 경합 해소 후(웹 트랙 몫).
2. **브라우저는 시스템 Chrome 채널(channel:"chrome")**: ms-playwright 캐시의 브라우저
   빌드(1228)와 레포 @playwright/test 요구 빌드(1217)가 불일치 — 캐시 재다운로드 대신
   시스템 Chrome을 채널로 고정(레포 검증 관례와 일치). webkit(Safari 16.4 등가) 매트릭스는
   CI 과제로 이월.
3. **실브라우저에서만 드러난 판정 규약 2건**(테스트 저작 규범): (a) flex 아이템은
   blockification으로 지정 inline-flex가 computed "flex" — 내부 골격의 display 판정은
   호스트로 한다. (b) `.jd-button`의 `transition: all` 탓에 소비자 오버라이드 직후 계산값은
   전이 중간값 — 수렴 판정(toHaveCSS 자동 재시도)으로 단언한다.
- 커버리지 16케이스: focus-trap 실 Tab 순환·복귀, ESC/백드롭/persistent/jd-request-close
  취소, 스크롤 락, 네이티브 폼 참여(FormData·라벨·submit·disabled/aria-busy), :defined
  FOUC, adoptedStyleSheets 실적용·@layer 소비자 승리, style-props 반응형 실 미디어쿼리,
  jd-page box-sizing 회귀(DEC-014-9). 전부 커밋된 표면(G1+B1)만 검증.
- 결정자: 실측 후 기본값 채택 (2026-07-24).

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

### DEC-019. finance-data 분리 — 판단 6건
(번호 주: 016~018은 병행 트랙(MCP·시각 패리티·B2 layout)이 선점 — 019로 부여. 018 중복은 본 트랙 블록을 019로 갱신해 해소.)
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

## 2026-07-24 — 아이콘 파이프라인 구축 (icons/ 자체 셋 77종 + 생성기)

### DEC-020. 아이콘 트랙 구현 결정 7건
1. **위치는 신설 최상위 `icons/`**: 03 §7.2는 `packages/web/icons/`를 스케치했으나
   트랙 소유권 분리(웹 트랙과 병행 작업)로 원본 SVG+생성기+dist를 최상위에 둔다.
   웹 패키지 배선(`@junds/web/icons/*` exports 매핑·`<jd-icon>` 레지스트리)은 웹 트랙 몫이며,
   소비 계약은 icons/dist/의 ESM 모듈(`{ name, svg }` — 03 §7.2 형태 그대로)·sprite.svg·aliases.json이다.
2. **셋 범위 77종 = AppIcon lucide 전수 73 + DataTable 보강 4**(copy/filter/pin/minimize —
   DataTableIcons.tsx 인라인 SVG 중 본 셋 부재분). primitives/Icon은 children 래퍼일 뿐
   내장 셋이 없음을 확인(03 §7.2의 "기존 자체분"은 패턴 인라인 SVG를 뜻함).
3. **이름 규약은 의미 우선 kebab**: X→close, AlertTriangle→warning, MousePointer→cursor,
   차트류는 chart-bar/line/pie로 계열화, Grid2x2→grid·Columns2→columns 등 숫자 접미 제거.
   ChevronsUpDown→chevrons-up-down(03 예시 준수). lucide 표기 차이는 aliases.json이 전량 흡수.
4. **드로잉 문법**: 라이브 에어리어 3~21(원형 광학 보정 ±0.75) — lucide(2~22)와 구분되는
   자체 비례. stroke 1.5·round cap/join·fill 전면 금지(점도 소형 stroke 원). lucide 경로
   복사·트레이싱 없이 좌표 설계로 직접 작성(정밀 기하 — gear·star·glint — 는 수치 계산).
   check.mjs가 자식 요소·속성 화이트리스트와 좌표 대역까지 전부 강제.
5. **커버리지 게이트**: check.mjs의 REQUIRED_LUCIDE(73종 스냅샷)가 별칭·아이콘 누락 시
   빌드 실패. AppIcon(React 어댑터) 마이그레이션 완료 후 게이트 완화 재심의.
6. **dist는 커밋**하며 `dist/package.json {"type":"module"}` 마커 포함 — 레포 루트가
   CJS 스코프여도 어디서든 ESM 로드 가능(스모크: 77 export·딥 임포트·심볼 77 확인).
7. **검수 절차**: preview.html(검색·크기·그리드 오버레이·테마) + 헤드리스 스크린샷으로
   77종 전수 눈검수. hammer는 2회 재설계(말렛 T형 기각 → 45° 수직 헤드+사선 손잡이),
   maximize/minimize 저크기 착시는 128px 대조로 기하 정상 판정.
- 결정자: 트랙 지시(03 §7.2·자체 제작 원칙) 아래 세부 기본값 채택 (2026-07-24).

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
