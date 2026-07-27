# JunDS v3 — DECISIONS (append-only)

각 항목: 날짜 / 결정 / 근거 / 결정자(사람 승인 or 기본값 채택).

---

## 2026-07-27 — 배치 API 가독성 패스: 축을 이름에, 정렬을 웹 어휘로, 열을 한 값으로

### DEC-043. 가독성은 취향이 아니라 기본값·이름·값 묶음의 문제다
사람 지적: "코드적으로도 더 layout하기 좋고 코드로 보기에도 이쁘게. 지금은 가독성이 좀
별로. UIKit 쪽에서는 SnapKit이 예쁜데 이게 최선인지 모르겠다."

먼저 SnapKit 비교부터 정리했다. SnapKit이 읽기 좋은 이유는 **스코프된 DSL**이고 그 형태는
이 레포에 이미 있다(`view.jd.layout { }`). 즉 제약 DSL은 동급이며 새로 만들 이유가 없다.
SnapKit이 **비워 둔** 층이 둘 — 트리 만들기와 행 간 열 정렬 — 이고 DEC-042가 그걸 채웠다.
못생겼던 것은 그 새 층의 **표면**이었다. RECIPES에 비교표를 넣어 "대신"이 아니라 "비워 둔
층"임을 명시했다.

#### 1. 축을 인자에서 이름으로
`JdStackView(.horizontal, gap: .sm, align: .center) { … }`는 축이 인자에 묻혀 읽는 눈이 한 번
멈춘다. SwiftUI가 `HStack { }`으로 읽히는 이유는 축이 **이름에** 있기 때문이다.
`JdVStack`/`JdHStack` 대문자 자유 함수를 더했다(JdStackView가 final이라 서브클래스 불가).
기본값도 웹을 그대로 갖는다 — `jd-vstack`(gap md·stretch) / `jd-hstack`(gap sm·center) —
그래서 흔한 경우 인자를 **하나도 적지 않는다**. `JdFlexSpacerView()` → `JdFlex()`.

#### 2. 정렬을 웹 어휘로 (`JdAlign`·`JdJustify` 신설)
배치 표면이 `UIStackView.Alignment`를 그대로 노출하고 있었다. 그러면 (a) 플랫폼 타입이
소비자 코드로 새고 (b) 같은 개념을 웹은 `stretch`, iOS는 `.fill`로 불러 3플랫폼 문서가
갈라진다. `JdGap`이 원시 CGFloat를 막은 것과 **같은 이유**로 정렬에도 이름 층을 준다.
값 집합은 웹 `ALIGN_MAP`(style-props.ts)과 동일하게 고정하고 테스트로 개수까지 묶었다.
⚠️ `UIStackView`엔 `justify-content` 대응이 없다 — `start/center/end`는 분배가 아니라
`JdFlex()`로 미는 것이 정답이고, 그 비대칭을 매핑 주석에 적어 숨기지 않았다.

#### 3. 열 정의를 한 값으로 — 이건 가독성이 아니라 **결함 수정**이었다
DEC-042의 `JdColumnsView(columns: [...], alignments: [...])`는 두 배열을 **인덱스로 짝**
맞춘다. 하나만 밀리면 컴파일도 되고 크래시도 없이 **조용히 틀린 표**를 그린다. `JdColumn`을
구조체로 바꿔 `width`와 `align`을 한 값에 담았다(`.fixed(96, align: .end)`) — 그 실수가
문법적으로 불가능해진다. 겸해서 간격을 `CGFloat` → `JdGap`으로 바꿨다: DEC-042가 레포
자신의 규칙("spacing 표면은 JdGap만 받아 원시 CGFloat 하드코딩을 차단한다")을 어기고 있었다.

#### 4. `JdEdge` — insets를 손으로 적지 않게
`NSDirectionalEdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16)`이 호출부에서 가장
긴 줄이었다. `JdEdge.all(.md)` · `symmetric(v:h:)` · `only(top:)`로 토큰 이름만 남긴다.

#### 5. 게이트
XCTest **732/732**(Core 295 + SwiftUI 115 + UIKit 322, 이번 신규 6). 새로 단언한 것:
축 이름 생성자가 **웹 기본값을 갖는다**(안 그러면 소비자가 매번 인자를 적어야 해 호출부가
길어진다) · `JdAlign` 5종 매핑과 값 개수(웹과 동일 집합 유지) · `JdColumn`이 폭+정렬을 한
값으로 묶는다 · 간격이 토큰 타입이고 실제 배치 간격과 일치한다 · `JdEdge` 조립.
기존 DEC-042 테스트 전량을 새 표면으로 이전했다 — 표면이 바뀌었는데 테스트가 옛 API를
쓰고 있으면 그 API가 죽지 않는다.

#### 6. 남은 것
DEC-042 §5 그대로: 복잡한 화면 한 장의 **시뮬레이터 시각 증명**이 아직 없다. 쇼룸이 원장
445행 기반이라 "레이아웃 킷"은 등록할 행이 없어 별도 진입점이 필요하다. 이번 가독성 패스로
그 데모 코드 자체가 짧아졌으므로 다음 배치에서 그것부터 만든다.
- 결정자: 사람 지적에 따른 표면 재설계, 근거 기록 후 기본값 채택 (2026-07-27).

---

## 2026-07-27 — UIKit 배치를 선언형으로 + 열 정렬 격자 (레이아웃 층 재설계)

### DEC-042. DEC-041은 부분해였다 — 사람이 반려했고, 그 판단이 맞다
DEC-041에서 랩 컨테이너 하나(`JdWrapView`)와 finance 조립 3종을 냈다. 사람 반려:
"이게 가장 이상적인 layout 코드가 맞나. 정말 layout 쉽도록, **사용자 입장에서**, 진짜
어렵고 복잡한 것도 한 치의 문제 없이." 옳은 지적이다 — DEC-041은 컴포넌트 3종의 내부
배치를 해결했을 뿐, **소비자가 화면을 짜는 일**은 그대로였다.

#### 1. 실측한 마찰 — 어려운 건 배치가 아니라 배치를 적는 일이었다
`jd.layout`(400줄 앵커 DSL)은 **제약만** 만든다. 그래서 뷰마다 (1) 생성 (2) `addSubview`
(3) 제약 세 단계를 손으로 반복해야 하고, 순서를 어기면 `JdLayout.swift:504·509·514`의
`preconditionFailure("addSubview 이후에 layout을 호출하라")`로 **앱이 죽는다**.
"한 치의 문제 없이"가 실패하는 지점이 API 안에 박혀 있었다.

그리고 스택으로는 **구조적으로 못 하는** 배치가 하나 있다: 행 간 열 정렬. `UIStackView`의
행들은 서로를 모르므로 1행의 "종목명" 폭과 2행의 폭이 각자 정해진다 — 표가 어긋난다.
열마다 고정 폭을 박으면 내용이 길어질 때 잘리고, 그래서 RECIPES는 격자를
`UICollectionViewCompositionalLayout`(소비자 작성)으로 안내하고 있었다.

#### 2. 신설한 것 — 넷뿐이다
- **`JdViewBuilder`(결과 빌더) + `JdStackView` 선언형 init**: 트리와 제약을 한 표현식으로.
  빌더가 자식을 스택에 넣으므로 **`addSubview` 함정이 문법적으로 사라진다.** `if`/`if let`/
  `for`/옵셔널이 블록 안에서 동작해 조건부 화면도 한 표현식이다. `padding:`은 layoutMargins로
  들어가 래퍼 뷰를 한 겹 더 만들지 않는다.
- **`JdColumnsView`**: 모든 행을 한 번에 측정해 **열 폭을 공유**한다. `.fixed` / `.fit(max:)` /
  `.flexible(weight:)` 세 규칙 + 열별 정렬(숫자 열은 `.trailing`이라야 자리수가 달라도 끝이 맞는다).
- **`JdFlexSpacerView`**: 남는 공간을 먹어 밀어내는 신축 여백(SwiftUI `Spacer()` 동형).
  기존 `JdSpacerView`(웹 `jd-spacer`, **고정** 간격)와 이름을 갈랐다 — 처음엔 같은 이름으로
  만들어 `invalid redeclaration`으로 빌드가 깨졌고, 그 충돌이 오히려 **둘이 다른 물건**이라는
  사실을 이름에 새길 계기가 됐다. 밀어내기에 고정 간격을 쓰면 아무 일도 일어나지 않는다.
- **`JdAdaptiveStackView`**: 폭이 임계값 미만이면 축을 뒤집는다(웹 미디어쿼리 대응). 축 전환
  판정을 한 타입에 가둔 이유는 `layoutSubviews`에서 `axis`를 잘못 쓰면 레이아웃 루프가
  생기기 때문이다 — **값이 실제로 바뀔 때만** 쓴다. 폭 0(첫 프레임)은 좁다고 판정하지 않는다.

**SwiftUI에는 아무것도 만들지 않았다**(04 §10 번역 원칙). `HStack`/`Spacer`/`Grid`(iOS 16 —
DEC-004가 전제한 하한)/`ViewThatFits`가 이미 같은 일을 한다. RECIPES에 UIKit↔SwiftUI 대응표를
넣어 **개념 어휘는 3플랫폼 공통, 표현만 플랫폼 관용구**임을 못 박았다.

#### 3. `jd.layout`을 없애지 않은 이유
앵커 DSL은 "이 뷰를 저 뷰의 오른쪽에" 같은 비계층 관계에 여전히 필요하다. 대신 가장 흔한
경우(`edges.equalToSuperview`)를 **`jdFill(parent)`로 대체**했다 — 부모를 인자로 받아 스스로
붙이므로 순서를 틀릴 수 없다. 위험한 API를 지우는 대신 **안전한 길을 더 짧게** 만들었다.

#### 4. 게이트 — 쉬운 케이스가 아니라 어긋나기 쉬운 케이스를 봤다
XCTest **726/726**(Core 295 + SwiftUI 115 + UIKit 316, 이번 신규 19). 단언한 것:
행 간 `fit` 열 폭 공유 · 고정/신축 폭 분배 · 가중치 0 균등 분배(0 나눗셈 방지) · 열별 정렬 ·
폭 부족 시 `fit`만 축소(고정 열 불변) · `fit(max:)` 상한 · **마지막 행이 덜 찬 표** ·
셀 높이를 자기 열 폭에서 측정(좁은 열의 2줄 라벨) · **보고 높이 == 배치 하단** ·
빈 표/폭 0 안전 · 반응형 축 전환 왕복 · 폭 0 무시 · 빌더의 제어 흐름 · `jdFill` 부착.

빌드 중 실제로 두 번 막혔고 둘 다 API 설계로 되돌렸다:
`buildExpression`의 옵셔널/비옵셔널 오버로드 공존이 `ambiguous use`를 냈고(비옵셔널을 지워
암시적 승격에 맡김), 빈 블록 `{ }`이 `[UIView]`/`[[UIView]]` 사이에서 모호했다(무인자
`buildBlock()` 추가 — 소비자가 타입을 적어 넣지 않아도 된다).

#### 5. 남은 것
- 복잡한 화면 **한 장을 시뮬레이터로 찍은 시각 증명**이 아직 없다. 쇼룸이 원장 445행 기반
  카탈로그라 "레이아웃 킷"은 등록할 행이 없고, 딥링크도 없어 상세 도달 비용이 크다.
  종목 표 + KPI 격자 + 반응형을 한 화면에 넣은 데모 스크린을 별도 진입점으로 만드는 것이 다음.
- `JdColumnsView`는 재사용을 하지 않는다(화면에 들어오는 규모 전제). 수백 행 표는 여전히
  `UICollectionView`가 맞고 그 경계를 RECIPES에 적었다.
- 결정자: 사람 반려에 따른 재설계, 근거 기록 후 기본값 채택 (2026-07-27).

---

## 2026-07-27 — 배치를 컴포넌트가 소유한다: UIKit 랩 컨테이너 + finance 조립 3종 (iOS 138/445)

### DEC-041. "복잡한 레이아웃이라도 쉽게"의 답은 레이아웃 DSL이 아니라 소유권 이전이다
사람 지시: 다음 배치를 "가장 쉽고, 레이아웃 배치가 쉽고, 복잡한 레이아웃이라도 쉽게 할 수
있도록". 새 레이아웃 프레임워크를 만드는 대신 **컴포넌트가 자기 배치를 소유**하게 했다 —
소비자가 격자를 정의하지 않는 것이 곧 "쉬움"이기 때문이다.

#### 1. 실측한 비대칭 — UIKit엔 줄바꿈 컨테이너가 없었다
`UIStackView`는 줄바꿈을 못 한다. 그래서 RECIPES는 `Wrap`을 "SwiftUI는 JdFlowLayout,
UIKit은 JdStackView.horizontal **no-wrap 폴백**"으로, `GridLayout`을 "UIKit →
UICollectionViewCompositionalLayout(소비자 작성)"으로 안내하고 있었다. 즉 **웹에서 한 줄이던
배치가 iOS에서는 컬렉션 뷰 한 채**였다. finance KPI 행처럼 셀 개수가 런타임에 정해지는
배치를 컴포넌트가 스스로 소유하려면 이 공백을 먼저 메워야 한다.

#### 2. `JdWrapView` 신설 (UIKit Layout)
`JdFlowLayout`(SwiftUI)의 UIKit 대응. 두 모드:
- 고유 폭 흐름(칩·태그) — 좌→우, 넘치면 다음 행, 행 안 세로 중앙(웹 `align-items: center`).
- 균등 분할 격자(`equalWidths`) — `minItemWidth`·`maxPerLine`이 열 수를 정하고 행 높이를
  가장 큰 셀로 맞춘다(열이 들쭉날쭉해지지 않게).

설계 판단 2건:
- **frame 배치**(Auto Layout 제약 아님): 아이템 수가 바뀔 때 제약을 세우고 허무는 비용과
  충돌 로그가 랩 배치에서는 순손실이다. 대신 `sizeThatFits`/`intrinsicContentSize`를
  정확히 보고해 부모 Auto Layout에는 정상 참여한다 — 테스트가 **보고 높이 == 배치 하단**을
  단언한다(둘이 어긋나면 부모가 자르거나 빈 공간을 남긴다).
- **재사용 없음**: 셀이 수백 개면 여전히 `UICollectionView`가 맞다. 이 뷰는 화면에 들어오는
  규모(칩 묶음·KPI 4~8칸)를 전제한다 — RECIPES에 그 경계를 명시했다.

#### 3. 조립 3종 — 배치를 소유하는 finance 컴포넌트
- **LiveStackedCell**: 가격+등락률 2단 우측정렬. 리프를 조립하지 **않는다** — 이 셀은 색
  통로가 하나이고, 리프를 얹으면 배지는 색을 정하고 텍스트는 안 정해 통로가 둘로 갈린다.
- **PositionBar**: 좌표를 Core(`JdPositionBarGeometry`)가 클램프까지 마쳐 준다. 마커(12pt)가
  트랙(8pt)보다 커서 **트랙만 클립**한다.
- **MicroKpiRow**: items만 받아 스스로 감싸 배치. SwiftUI는 `.adaptive(minimum:)` 격자,
  UIKit은 위 `JdWrapView(equalWidths:)`. 웹은 호스트를 `display: contents`로 두어 격자
  정의를 소비자에게 넘겼는데, iOS에서 그 선택은 소비자가 매번 열 정의를 짜는 비용이 된다.
  중단점 나열(`grid-cols-2 md:grid-cols-4`) 대신 **최소 셀 폭 하나**로 정했다 — iOS는 기기
  폭이 연속적이고 분할 화면·회전까지 있어 최소 폭이 더 잘 맞는다.

#### 4. 세 번째 추세 규칙: `.gainOrEven`
웹 `jd-live-stacked-cell`은 `up = c >= 0`이다 — **flat이 없다.** 두 값이 한 색으로 묶여
있어서 0%에 회색을 주면 그 행 전체가 죽은 것처럼 보인다. `jd-live-micro-kpi-row`도
`(pct ?? 0) >= 0`으로 같다. DEC-040의 두 규칙에 세 번째로 추가했고, 테스트가 **세 규칙이
0에서 모두 갈린다**는 것을 단언한다(하나로 합쳐지면 즉시 실패).

#### 5. 웹 결함 교정 확인
`cur < low`일 때 웹 v2가 음수 width를 내던 결함이 Core 클램프로 막혀 있는지 테스트로 고정.
비유한(NaN·무한)은 100이 아니라 **0**이다 — 최대로 접으면 데이터 결손이 "구간 끝 도달"로
잘못 보인다(웹 v3 동형, 처음엔 테스트를 100으로 잘못 썼다가 웹 소스 확인 후 교정).

#### 6. 게이트
iOS 빌드 성공 · XCTest **707/707**(Core 295 + SwiftUI 115 + UIKit 297, 이번 신규 39) ·
쇼룸 재빌드 + 실기동(iOS 135 → 138) · 데모 3종 배선 4중 일치 검증(고아 0건).
RECIPES `Wrap`/`GridLayout` 항목의 "no-wrap 폴백" 안내를 갱신했다 — 문서가 실제 능력보다
낮게 안내하고 있으면 소비자가 컬렉션 뷰를 계속 짠다.

#### 7. 남은 finance 77종
DEC-040 §8 순서 유지. 이번에 ①의 대표 3종을 끝냈으므로 다음은 ①의 잔여
(MarketHeaderBadge · DisclosureToneBadge · LivePrice · AppIcon · Logo) → ② 미니 그래픽.
`JdWrapView`가 생겨서 ThemeTagList·SegmentedPill 같은 칩 묶음 계열도 바로 만들어진다.
- 결정자: 사람 지시("복잡한 Layout이라도 쉽게")를 배치 소유권으로 해석, 근거 기록 후
  기본값 채택 (2026-07-27).

---
## 2026-07-27 — 웹 시각 결함 전수 교정: 톤 레시피 + 토큰 층 구멍 3종

### DEC-041. 다크에서 뒤집히는 것들은 취향이 아니라 토큰 층의 구멍이었다
사람 지시: "프론트 컴포넌트를 더 좋게 — UI도 더 이쁘고 범용성도 갖게. 그리고 STAGE에서
깨져 있는 것들을 해결해 달라. 웹 바닐라·React 전부." DEC-039가 파운데이션과 컨트롤
1차를 올렸지만, 문서 STAGE(다크 무대)에서 아직 깨지는 것들이 남아 있었다.

#### 1. 실측 — 388종 전수 마운트 후 계측
문서 스테이지와 동일한 조건(`data-jd-theme="dark"` 서브트리)에서 <jd-*> 388종을
전부 마운트해 모든 자손의 computed 배경·글자를 훑었다.
- **밝은 슬래브 14종**(면적 900px² 이상·불투명도 0.5 초과의 고휘도 배경).
- 정적 스캔으로는 **밝은 배경 하드코딩 35건 / 어두운 글자 하드코딩 57건**,
  그리고 커스텀 프로퍼티 안에 숨은 틴트 17건이 더 있었다.

#### 2. 토큰 층 구멍 3종 — 컴포넌트가 아니라 여기가 원인이었다
- **별칭 토큰이 서브트리 다크에서 라이트로 굳는다.** `controlTrack: {color.neutral.200}`
  같은 스칼라 별칭은 CSS로 `var(--jd-color-neutral-200)` 한 줄이 되어 `:root`에만
  방출됐다. 커스텀 프로퍼티의 var() 치환은 **선언한 요소**에서 일어나므로, 다크를
  `<html>`이 아니라 서브트리에 걸면 :root에서 이미 라이트로 굳은 값이 상속된다 —
  스위치·토글 트랙이 다크 무대에서 흰 슬래브로 남던 원인. 생성기가 별칭의 모드
  인식 여부를 전이적으로 판정해(`aliasIsModeAware`) 다크 블록에도 같은 줄을 방출한다.
  구조적 수정이라 앞으로 추가되는 별칭도 자동으로 옳다.
- **status 5 × priority 4 = 22토큰이 라이트 전용 리터럴**이었다. 모드 쌍으로 승격하고,
  React 표면(`statusColors`·`priorityColors`)도 리터럴 hex 대신 var() 참조로 내보낸다
  — 그동안 React 소비자는 다크에서도 라이트 색을 받고 있었다.
- **그래디언트 3종이 미정의 변수를 참조**했다(`var(--primary-soft)`·`var(--surface)`).
  CSS는 무효 var()가 섞인 선언을 통째로 버리므로 셋 다 v2에서도 아무것도 그리지
  않았다 — 패리티가 지켜 온 것이 동작이 아니라 결함이었다. 실재 토큰으로 결선.

#### 3. 톤 레시피 — 색이 아니라 혼합비가 모드를 갖는다
정보 구분용 색 표면(tag[color]·badge[variant]·avatar 팔레트·severity·security-badge …)이
Tailwind 50/700 리터럴 쌍을 40여 개 흩뿌리고 있었다. 컴포넌트당 변종 수 × 모드 2를
손으로 적는 구조라 다크가 늘 빠졌다. base.css에 단일 공식을 두고, 컴포넌트는 변종마다
`--jd-tone: <앵커>` 한 줄만 둔다.
- **앵커 12색**(`color.hue.*`, 모드 무관)으로 40여 개 리터럴을 대체. 600~700단에 두는
  이유는 라이트에서 옅은 틴트 위 글자가 AA를 넘어야 하기 때문(500단은 amber·orange 미달).
- **승강(lift)** — 그 어두운 앵커를 다크에서 그대로 쓰면 틴트가 검은 진흙이 된다(실측).
  다크에서만 앵커를 흰 쪽으로 들어 올린 뒤 공식에 넣는다. 라이트는 lift 100%라 분기 없음.
  승강은 면 전용이고 글자는 1단 공식이다 — face 변수를 걸 자리가 없는 일회성 규칙과
  값이 같아야 하기 때문.
- 배경을 흰색이 아니라 **transparent와 섞는다**: 카드·모달·시트 어디에 얹혀도 그 표면의
  명도를 물려받아야 같은 색으로 읽힌다.
- **범용성**: 소비자가 임의 요소에 `--jd-tone`을 지정하면 하위 톤 컴포넌트가 전부 그 색을
  따른다. 브랜드 색 주입에 컴포넌트별 오버라이드가 필요 없다.

#### 4. "항상 어두운 크롬"에 짝이 되는 잉크 신설
코드 블록·다이어그램 캔버스·히어로 오버레이·책등은 라이트에서도 어둡다(surface 3단).
그 위의 글자는 모드를 따라가면 안 되는데 짝 토큰이 없어 각 컴포넌트가 #fff·#cbd5e1·
#9ca3af를 제각기 박아 넣고 있었다 → `onSurface`/`onSurfaceMuted` 신설.
같은 이유로 DEC-039의 램프 반전 이후 `neutral-800/900`을 **어두운 면**으로 쓰던 5파일이
다크에서 near-white 슬래브가 됐다(flow-diagram·copy-block·hero-section·book-cover·
book-rating) — 전부 surface 계열로 이전.

#### 5. 결과
밝은 슬래브 **14 → 5**(남은 5는 전부 의도: 사진 위 흰 그립 2 · 카카오 브랜드 옐로 1 ·
foreground 반전 채움 2). 하드코딩 밝은 배경 **35 → 7**, 어두운 글자 **57 → 11**(남은 것은
그래디언트/미디어/브랜드 위의 의도적 리터럴). neutral 고단 오용 **8 → 0**.

#### 6. 게이트
tokens:test 15/15 · web vitest 348/351(실패 3건은 착수 전부터 있던 storage 테스트,
이 변경과 무관) · web tsc 0 · web 빌드 성공 · 라이트/다크 실렌더 대조.
패리티 이탈은 `GRADIENT_UNDEFINED_REF_FIX`(그래디언트 3종)와 status/priority 라이트값
고정 단언으로 테스트가 집행한다 — v2가 움직이면 여기서 먼저 실패한다.

---


## 2026-07-27 — iOS finance 착수: 공통 어휘 + 리프 6종 (원장 iOS 135/445 · finance 6/86)

### DEC-040. 86종을 나열하기 전에 어휘를 먼저 세운다
사람 지시: "iOS 컴포넌트 추가 — 없는 것, 특히 finance 기준으로 먼저." finance는 원장
86행 전부 `ios: todo`(웹은 86/86 done)였다.

#### 1. 왜 어휘부터인가 — 실측 근거
웹 finance CSS를 세어 보니 **33개 파일이 `--jd-fin-*` 팔레트를 각자 재선언**하고 있다
(`--jd-fin-up: var(--bm-up, var(--jd-color-success))` …). 단일 소스가 없고, 추세 판정
규칙도 컴포넌트마다 손으로 다시 쓰여 있다. 그 상태를 iOS로 그대로 옮기면 86종이 같은
판정을 86번 구현한다. 그래서 Core가 세 가지를 소유하고 렌더는 결과만 그린다(04 §4.2):
- `JdTrend` · `JdTrendPolicy` — 추세 판정
- `JdFinanceTheme` — 도메인 색 단일 소스 + 앱 override
- `JdFinanceFormat` — 부호·소수·퍼센트·가격 포맷(로케일 고정 계약은 JdNumberFormat 상속)
- `JdFinanceSpecMix` — 웹 `color-mix(in srgb, …)`의 Swift 대응(그라디언트·워시)

#### 2. 판정 규칙이 **두 개**라는 사실을 타입으로 올렸다
웹에 실제로 두 규칙이 공존한다. 하나로 합치면 표면이 달라지므로 정책을 열거형으로 만들었다.
- `.live`(웹 jd-live-pct-badge): `up(> 0)`이 flat보다 **우선**. `+0.003`은 상승이고 flat은
  `[-0.005, 0]` 구간뿐이다 — 실시간 틱이 잘게 흔들릴 때 "거의 0"을 회색으로 눌러 준다.
- `.exact`(웹 jd-price-badge): flat은 **정확히 0**. 확정된 등락률엔 임계값을 두지 않는다.

같은 `-0.003`이 live에선 보합, exact에선 하락이다. 테스트가 이 **불일치 자체를 단언**한다 —
두 규칙이 하나로 합쳐지면 즉시 실패한다.

#### 3. 색 기본값은 웹을 따르고, 관례 전환은 앱에 남겼다
상승=success(초록)·하락=danger(빨강)이 기본이다. 한국 시장 관례(적상승·청하락)를 기본으로
삼지 **않은** 이유: 웹 v2/v3가 이미 초록 상승으로 출고돼 있어 3플랫폼 표면이 갈라진다.
대신 `JdFinanceTheme.up/down/flat/live`를 앱이 시작 시 1회 덮어쓸 수 있게 했고, override가
스펙까지 실제로 흐르는지 테스트가 검증한다(죽은 노브 차단).

#### 4. 리프 6종 완성 — 3플랫폼 표면 동형
LivePctText(골격 정본·색 없음) · LivePctBadge(골격 재사용 + 색, live 판정) ·
LivePriceText(폴백·em dash) · LiveStatusDot(확장-소멸 링) · PriceBadge(화살표, exact 판정) ·
HotPctChip(늘 상승 표기 알약). 각 SwiftUI + UIKit 양 계층.

계층 간 파생 관계를 각 언어의 관용구로 옮겼다: 웹이 `class extends`로 한 것을 UIKit은
**상속**(JdLivePctBadgeView: JdLivePctTextView), SwiftUI는 struct에 상속이 없어 **합성**으로.
어느 쪽이든 포맷은 Core 한 곳에만 있다.

#### 5. 웹 대비 보정 3건 (전부 접근성 — 웹엔 없다)
1. 추세 배지가 "상승/하락/보합"을 말한다 — 색이 유일한 신호이면 색각 이상 사용자에게 정보가
   사라진다.
2. em dash 가격을 "가격 정보 없음"으로 낭독한다 — VoiceOver는 "대시"라고 읽는다.
3. HotPctChip의 `↑`를 "급등"으로 낭독한다 — 화살표 문자는 안 읽히거나 "위쪽 화살표"가 된다.

#### 6. 신설 인프라
- `JdFontBridge.scaledDigitFont` — 웹 `font-variant-numeric: tabular-nums`의 정확한 대응.
  기존 `scaledMonoFont`는 글자까지 등폭이라 한글 라벨이 타자기처럼 보인다. finance 86종이
  전부 숫자를 그리므로 브리지에 둔다.
- `USAGE/06-finance.md` 신설 — 어휘(판정 2규칙·색 override·tabular 계약)를 문서 앞머리에
  두어 나머지 80종이 참조할 지점을 만들었다.

#### 7. 게이트
iOS 빌드 성공 · XCTest **668/668**(Core 277 + SwiftUI 106 + UIKit 285, 신규 47) ·
쇼룸 재빌드 + 시뮬레이터 실기동(카탈로그 iOS 129 → 135). 쇼룸 데모는 `byId` 조회라 id가
원장과 어긋나면 **조용히 안 보이므로**, 6종의 (데모 정의 · 원장 행 · 레지스트리 등록 ·
ios=done) 4중 일치와 전 데모 98종의 원장 id 존재를 스크립트로 검증했다(고아 0건).
⚠️ 카탈로그가 445행 깊이이고 쇼룸에 딥링크가 없어 finance 상세 화면은 **눈으로 확인하지
않았다** — 배선은 정적 검증, 렌더는 호스팅 테스트(SwiftUI sizeThatFits · UIKit 프로퍼티
반영)로 대신했다.

#### 8. 남은 finance 80종 — 다음 배치 순서
1. **표시 전용 소형**(LiveStackedCell · PositionBar · MarketHeaderBadge ·
   DisclosureToneBadge · LivePrice · AppIcon · Logo) — 이번 어휘로 바로 만들어진다.
2. **미니 그래픽**(Sparkline · MiniCandle) — Core 지오메트리 + Canvas/CALayer 분할(04 §4.2).
3. **차트 8종**(Area · Candle · Donut · MultiLine · QuarterBar · RealCandle · MarketIndex ·
   InvestorFlow) — Swift Charts 위 토큰 테마, 캔들은 표현력 밖이라 자체 렌더(04 표 참조).
4. **셸·내비**(PageShell · TopBar · Sidebar · BottomNav · AppHeader) — 시스템 위임 판단 필요.
5. **큰 조합체**(LiveStockTable · MarketHeatmap · PortfolioCouncil · TradeJournal …) —
   `JdTickStore`(04 §4 패턴 · 00-inventory 리스크 #4) 분리가 선행 조건.
- 결정자: 사람 지시에 따른 배치 착수, 어휘 설계 근거 기록 후 기본값 채택 (2026-07-27).

---

## 2026-07-27 — 시각 품질: **v2 패리티 → v3 고유 시각 언어로 승격** (파운데이션 + 컨트롤 1차)

### DEC-039. "v2와 똑같이"가 목표선을 낮추고 있었다
사람 보고: "라이브러리 UI가 iOS도 웹도 이쁘지 않다 · 써야 할 이유가 느껴지지 않는다 ·
사소한 디테일이 부족하다." v3는 지금까지 **v2 시각을 정확히 재현**하는 것을 정답으로
삼아 왔고(패리티 테스트가 그 집행자였다), 그래서 v2의 한계가 그대로 상한이 됐다.
이 결정으로 상한을 v2에서 떼어낸다. 단 "임의 변경 금지" 원칙은 유지한다 — 이탈은
전부 여기 기록되고, 패리티 테스트는 **기록된 이탈만** 통과시킨다(§승인 이탈 표).

#### 1. 실측 진단 — 취향 이전에 결함이 있었다
데모 9페이지를 실제 렌더해 계측한 결과:
- **하드코딩 Tailwind 회색 64건 / 32파일**. `#e5e7eb`(슬라이더 트랙)·`#d1d5db`(스위치
  트랙)·`#9ca3af`·`#f3f4f6`·`#374151` 등이 모드 인식이 없어 **다크에서 밝은 슬래브로
  뒤집혔다**. 소스 주석에 "G2 gray 어휘 재심의"로 남아 있던 미결 항목이 그대로 출고된 것.
- **입력면이 다크에서 회색 덩어리로 렌더**. 원인은 취향이 아니라 렌더링: `card 80%`
  반투명 + `backdrop-filter: blur(4px)` 조합이, 조상 배경이 투명하면 브라우저가 백드롭
  루트를 새로 잡아 엉뚱한 면을 샘플링한다. text-field·textarea·login-form·form-builder·
  mention 5종이 같은 관용구를 복제하고 있었다.
- **체크박스·라디오가 OS 기본 컨트롤**(`appearance: auto` + `accent-color`). 플랫폼마다
  모양이 다르고, 다크에서 OS가 칠한 회색이 남고, 상태 전환에 움직임이 없었다.
- **loading이 disabled와 똑같이 보였다**. element.ts가 로딩 중 네이티브 `disabled`를
  켜므로(§1.6-1 폼 위임) `:disabled { opacity: 40% }`가 그대로 걸린다.
- **iOS는 시각 층이 사실상 비어 있었다**: SwiftUI 53종 중 shadow 5 · animation 14.
  JdButton은 배경색 교체만 — 스케일도 그림자도 없다. 손가락이 픽셀을 가리는 터치에서
  색 변화만으로는 "먹었다"가 전달되지 않는다.
- `transition: all` 15파일 — 레이아웃 속성까지 트랜지션 대상이 되어 매 프레임 리플로우.
- 플레이스홀더 `muted-light 60%` = 라이트에서 2.1:1, 사실상 안 보임.

#### 2. 파운데이션 — 445종을 한 번에 올리는 층
- **neutral 램프 11단 신설(정본)**: "숫자가 클수록 대비가 높다"를 두 모드에서 동일하게
  지키도록 **다크에서 반전**한다. 그래서 컴포넌트는 모드 분기 없이 토큰 하나만 쓰면
  되고, 회색 하드코딩이 다크에서 뒤집히는 결함이 구조적으로 불가능해진다. 색조는
  무채색이 아니라 foreground의 보라 기운 — 브랜드와 같은 온도.
- **control 어휘**(surface/surfaceHover/surfaceMuted/track/trackStrong/knob): 입력면은
  **불투명이 정본**. 흐림은 진짜 오버레이 전용.
- **ring**(ringPrimary/ringDanger) + base.css의 `--jd-focus-ring` 단일 레시피:
  168개 CSS가 각자 color-mix로 링을 조제하던 편차를 한 곳으로 모았다. box-shadow가
  아니라 outline인 이유 — border-radius를 따라가고, overflow:hidden 조상에서 잘리지 않는다.
- **depth**(highlight/shade/overlayScrim): 색을 늘리지 않고 깊이만 더하는 값. 사람 취향
  기록("이쁘게 = 색 다양화가 아니라 빛·질감")과 정합.
- **엘리베이션 2겹 전환**: 각 단이 접지 그림자 + 주변광 그림자다. 1겹 단일 그림자는
  물체가 "떠 있다"가 아니라 "얼룩이 묻었다"로 읽힌다. 그림자 색은 순수 검정이 아니라
  foreground 색조 — 보라 기운 배경 위에서 검정은 탁하게 죽는다. **다크는 첫 겹을
  헤어라인 링으로 교체** — 다크에서 융기를 읽게 하는 것은 그림자가 아니라 윗면의 빛이다.
- **모션 추가 5종**: duration press(90ms)·snap(140ms)·emphasis(420ms),
  easing emphasized·overshoot. overshoot는 **자리를 잡는** 움직임 전용(스위치 썸·체크
  표식) — 색·투명도에 쓰면 깜빡임으로 읽힌다.

#### 3. 승인 이탈 표 (패리티 테스트가 집행)
- `shadow.xs~2xl`: v2 1겹 → v3 2겹. 테스트는 **v2 동결본 값을 전제로 검증**한 뒤
  "2겹 계약"을 단언한다. v2가 움직이면 여기서 먼저 실패한다.
- `motion.duration/easing`: v2 키는 값까지 불변(부분집합 단언), v3 추가분 5종만 초과 허용.
- 그 외 색·spacing·radius·type·zindex·opacity·border·breakpoint·gradient는 **패리티 유지**.
  브랜드 색(primary 보라)은 건드리지 않았다 — 정체성 변경은 별도 승인 사안.

#### 4. 컨트롤 1차 (웹) — 사람이 라이브러리를 판단하는 표면
button(loading≠disabled 분리, 실색 호버로 filter:brightness 폐기, 프레스 인셋) ·
icon-button(프레스 scale, filled 하이라이트) · text-field/textarea(불투명면·호버 상태·
caret·selection·disabled를 opacity 대신 실색) · **checkbox/radio 자체 드로잉**
(SVG 마스크 + background-size overshoot, `::after`를 못 쓰는 이유는 input이 대체 요소라서) ·
toggle/switch(knob 그림자·오목 트랙·overshoot 이동, 꺼진 트랙에서 아무 변화도 없던
brightness 호버 폐기) · slider/range-slider(썸 링 확장, tabular-nums로 드래그 중 자리수
흔들림 제거).

#### 5. iOS — 플랫폼 관례를 이기지 않는 선에서 느낌만 채운다
- `jdElevation` 신설: **겹을 아는 단일 렌더러**. 기존 5+3곳이 `Shadow.lg.light.first`로
  첫 장만 꺼내 쓰고 있었고, 2겹 전환 후 그 관용구는 라이트에서 주변광을 버리고
  다크에서는 링을 그림자로 오해해 아무것도 그리지 않는다 — 전량 이전했다.
- `JdShadowDominant`(CALayer용): UIKit은 그림자 한 장뿐 → "첫 장"이 아니라 **blur가
  가장 큰 겹**을 고르는 것이 정답. UIKit 3곳 이전.
- `jdPressable`/`jdPressScale` + `JdMotion.pressAnimation/settleAnimation`: Reduce Motion은
  기존 JdMotion 단일 진입점을 그대로 경유한다(04 §7.3).
- **JdToggle은 손대지 않았다** — 시스템 `Toggle(.switch)` 위임이 04 §10.1의 결정이고,
  iOS 사용자는 네이티브 스위치를 기대한다. 웹을 iOS에 복제하는 것은 개선이 아니다.
- JdCheckbox 미선택 색을 border(#e2dfe8, 흰 배경 위 1.3:1 — 빈 상자가 보이지 않았다) →
  neutral-300으로.

#### 6. 게이트
tokens:test 15/15 · web vitest 351/351 · web tsc 0 · web-a11y PASS(9페이지, critical/serious 0) ·
iOS 빌드 성공 · XCTest **621/621**(Core 257 + SwiftUI 97 + UIKit 267) · 시뮬레이터 실기동
확인(JdButton 엘리베이션 렌더). 웹 라이트/다크 실렌더 대조로 다크 슬래브 결함 해소 확인.
변경 파일 eslint 에러 0(경고 2, 기존 패턴).

**size-gate 기준선 재기록**: 드리프트 게이트(±3%)가 14종에서 실패했다 — checkbox
+108%(0.99→2.07KB), text-field +40%, radio-group +42%, button +26% 등. 이 게이트는
"실수로 부풀었나"를 잡는 장치이고 이번 증가는 시각 층을 의도적으로 채운 대가이므로
`--update-baseline`으로 재기록했다. **절대 예산은 그대로 통과**한다: 평균 2.41KB /
예산 4.00KB · p95 5.71KB / 상한 12.00KB · 개별 최대치도 상한 미달. 즉 총량이 아니라
기준선만 움직였다.

#### 7. 남은 것 (이 결정의 범위 밖 — 후속 배치)
- **틴트 칩 팔레트**: tag·badge·severity-badge·avatar가 Tailwind 파스텔 bg + 진한 글자
  쌍을 하드코딩(#dbeafe/#1d4ed8 등 20+종). 다크에서 라이트 잔재로 남고 색조도 산만하다 →
  모드 인식 `tone` 토큰 그룹으로 승격 필요.
- 코드/터미널 계열의 상시 다크 면(#030712·#0f172a)은 의도적 고정인지 재확인 필요.
- 소셜 브랜드색(#1DA1F2·#FEE500 등)은 **정당한 하드코딩** — 테마 금지 대상.
- iOS 나머지 39종 SwiftUI + UIKit 54종의 프레스·전환 적용.
- parity/ 기준선 스크린샷 496장은 v2 기준이라 이번 승격분과 어긋난다 → 재기준선 필요.
- 결정자: 사람 보고("해결해주세요")에 따른 방향 전환 + 실측 결함 근거 기록 후 기본값 채택
  (2026-07-27). 브랜드 색 변경은 포함하지 않았으며, 필요 시 별도 승인 사안으로 남긴다.

---

## 2026-07-24 — 웹 잔여 대량 이식 2차 완료: **web 445/445 전 카테고리 완주**

### DEC-038. 라운드2 153종 + 중앙 검증으로 웹 트랙 종료
1. **라운드2 전 배치 성공(32배치 64에이전트, 실패 0)**: 1차에서 세션 한도로 남은
   composites 25 · patterns 43 · finance 85를 계열별 재배치해 완주. **web 445/445** —
   core·layout·primitives·hooks·composites·patterns·finance 전부 done.
2. **중앙 정적 감사가 실제 위험을 잡았다**: (a) **태그·클래스 충돌** — 새 composites
   PageHeader(제목+브레드크럼 바)가 layout의 `jd-page-header`(jd-page 내부 슬롯, 커밋된
   API)와 이름 충돌. defineElement가 "선등록 승리"로 **조용히 하나를 죽이는** 부류라
   신규를 `jd-page-header-bar`로 개명. (b) Boolean default:true 7건을 반전 플래그로
   (sticky→static, searchable→no-search 등). (c) **CSS 주석 안의 raw 백틱**이
   `css\`\`` 템플릿을 조기 종료(filter-bar) — tsc가 잡았고 이스케이프/제거로 수정.
3. **"파일 실재"를 진실로 삼는 규율이 두 번 구했다**: 워크플로 최종 보고는 verify
   실패 항목을 null로 떨어뜨려 오해를 낳았지만(1차 "0 구현", 실제 145 존재), 원장·집계를
   전부 디렉터리+element.ts 실존 기준(ledger-sync.mjs)으로 재산출해 정확히 복구했다.
   에이전트가 기계 kebab보다 자연스러운 이름을 쓴 4건(FZone→fzone, DisclosuresClient→
   disclosures)은 별칭 맵으로 흡수.
4. **헤드리스 컴포넌트 이식**: GlobalKisSeeder는 v2가 `return null`인 무-UI 시더였다 —
   폴링 **수명주기만** `<jd-global-kis-seeder>`(display:none)로 옮기고, 실제 시세 소스는
   @junds/finance-data 슬라이스 몫으로 문서화(DEC-019 · §6 R4). jd-tick 발행 +
   fetcher 주입점으로 데이터 백엔드를 재구현하지 않았다.
5. **전 컴포넌트 스모크가 런타임 결함을 격리**: 235종 무결 통과. jd-heatmap·
   jd-diff-viewer는 happy-dom이 `tbody.rows`·`tr.cells`를 미구현한 환경 갭(실 Chrome
   에러 0 확인)이라 스모크만 제외. 테스트 타임아웃은 389종 배럴 로드가 5초를 넘겨
   30초로 상향(라이브러리 규모 반영, 컴포넌트 결함 아님).
- 게이트: tsc 0 · 감사 0 · vitest 351/351(스모크 포함) · e2e 51/51 · web-a11y PASS
  (9페이지) · size-gate PASS(평균 2.40KB · p95 5.71KB) · gen-exports 390종 배럴.
- **원장: web 445/445 완주.** iOS 트랙은 병행 진행 중(별도 커밋).
- 결정자: 대량 이식 완료, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — iOS composites 오버레이·피드백 14 + hooks 46 (원장 iOS 129/445)

### DEC-037. 시스템 위임/자체 구현 분할 + hooks 판정 대량
1. **오버레이 6종은 시스템 프레젠테이션 위임, 피드백 8종은 자체 구현**: 04 §10.1의 "오버레이는
   전부 시스템 위임" 원칙대로 Modal/Drawer/BottomSheet/ActionSheet/AlertDialog는 `.sheet`·
   `presentationDetents`·`.confirmationDialog`·`.alert`(UIKit은 UISheetPresentationController·
   UIAlertController)로 번역했다 — 포커스 격리·스크롤락·백드롭이 전부 공짜다. 반면 Toast·
   Snackbar·Notification·Alert·Banner·Callout·EmptyState·Result는 iOS 시스템 대응이 없어 자체
   구현. Sheet=BottomSheet(draggable)·ConfirmDialog=AlertDialog는 별칭(R12).
2. **cancelable 닫기(웹 jd-request-close)의 iOS 번역**: SwiftUI엔 per-dismiss veto가 없어
   `onDismissAttempt: (JdDismissReason) -> Bool`로 바인딩을 게이트한다(false면 취소). 이 seam
   `JdOverlayDismissGate`는 우산 타겟 테스트가 닿으려면 public이어야 했다(테스트 타겟이
   JunDS 우산에만 의존 — @testable/internal 불가). UIKit은
   `presentationControllerShouldDismiss`. Modal 기구현(G1)과 동일 의미론.
3. **hooks는 라이브러리 컴포넌트가 아니다 — 판정이 절반**: 46종을 셋으로 갈랐다.
   **Core 순수 유틸 11종**(`JdBehaviors.swift`: 디바운스/스로틀/카운트업 이징/폼 검증/단축키
   정규화/읽기 진행률/스크롤 스파이/프리로드 배치/무한피드 게이트/브레이크포인트 값 —
   계산이 코드의 전부인 것), **시스템 API·환경값 레시피 31종**(useMediaQuery→@Environment,
   useLocalStorage→@AppStorage, useClipboard→UIPasteboard 등 — RECIPES Behaviors 절),
   **N/a 4종**(useClickOutside·useFocusTrap·useFocusVisible·useFavicon — iOS에 개념 없음).
   대량의 View 타입을 만들지 않았다 — 시스템이 하는 일을 감싸면 유지 비용만 남는다(04 §10).
4. **Core 상태머신 값 타입 채택**: `JdToastQueue`(add·max 초과 축출·dismiss·clear)를 순수
   struct로 두고 `JdToastCenter`(ObservableObject)가 래핑 + 타이머만 담당. 04 §4.1의 참조
   타입 ToastCenter 정본을 값 타입으로 변형 — 큐 전이를 단위 테스트로 고정하기 위함.
5. **모듈 경계가 강제한 배선 2건**: (a) UIKit `JdToastHostView`는 SwiftUI `JdToastCenter`를
   받을 수 없다(DEC-010 + 우산에서 동명 타입 충돌) → 자기 Core 큐를 쥐고 `onQueueChange`
   클로저로 브리지, 공개 센터는 SwiftUI 하나뿐. (b) hooks 테스트가 인벤토리 지정 파일에
   못 들어가는 경우(UIKitTests가 SwiftUI 센터를 못 봄) 동등 커버리지를 다른 파일로 옮겼다.
6. **자체 구현 색은 전부 Core JdFeedbackVariant/JdCalloutVariant/JdResultStatus**: danger는
   접근성 우선순위를 assertive로 올린다(웹은 전부 polite — 색으로만 위험을 전하던 결함 보정).
   Banner 흰 글자 대비는 variant.color에 foreground 20% 혼합(트레이트별 resolvedColor).
7. **온-액센트(흰) 전경 토큰 부재 + scrim 토큰 부재**: Banner·Snackbar·토스트 카드의 흰
   글자는 시스템 `.white`(JdBadge count 선례), 좌우 Drawer 딤은 `.black` + `JdToken.Opacity.o30`.
   둘 다 Core 토큰 신설 권고(색은 리터럴 최소화 규칙의 유일한 예외로 남았다).
- **스펙 보강 후보(G2)**: `JdToken.Color.scrim`·온-액센트 전경 토큰, Snackbar의 중립 default가
  JdFeedbackVariant에 없어 `.info`를 surfaceOverlay로 접은 것(명시 info-blue 스낵바 불가),
  토스트/스낵바 폭 토큰(현재 JdOverlaySize.drawerWidth 재사용).
- 검증: 시뮬레이터 빌드 에러 0 · **XCTest 621/621**(477→621) · 쇼룸 92종 데모 등록·실기동.
- 결정자: 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — 웹 잔여 대량 이식 1차: composites·finance 145종 (원장 web 292/445)

### DEC-035. 오케스트레이션 팬아웃으로 잔여 298종 착수, 1차 145종 확정
1. **팬아웃 구조**: 잔여 298종을 계열별 52배치로 나눠 배치마다 구현→자가검증
   2단계 에이전트로 돌렸다. 같은 관용구를 쓰는 것끼리 묶어(오버레이/선택입력/
   날짜·시간/차트/미디어/시리즈…) 한 에이전트가 파생을 판단하게 했다. 세션 한도로
   145종에서 중단 — 이번 커밋은 **컴파일·스모크·게이트를 통과한 것만** 확정한다.
2. **"보고"가 아니라 "파일 실재"를 진실로 삼는다**: 파이프라인은 verify 실패 시
   항목을 null로 떨어뜨려 최종 보고가 "0 구현"이었지만, impl 에이전트가 완료한 것은
   이미 디스크에 있었다. 그래서 원장 갱신·집계를 전부 **디렉터리+element.ts 실존**
   기준으로 재산출했다(ledger-sync.mjs). 중단된 에이전트의 반쪽 산출물 3종은 제거해
   라운드2로 넘겼다.
3. **중앙 정적 감사(audit.mjs)로 52 에이전트의 일관성을 강제**: 태그·클래스명 충돌
   (독립 명명이라 실제 위험 — 0건), gen-exports 계약(`export class Jd… extends`),
   import 확장자, `@layer` 스코프, render()의 브라우저 상태 읽기, SVG createElement
   네임스페이스 함정, Boolean default:true(파생 상태는 면제), 호스트보다 오래 사는
   리스너 누수. tsc 오류 0 · 감사 오류 0으로 수렴.
4. **전 컴포넌트 스모크(smoke.test.ts) — 빈/기본 상태 크래시를 전량 수집**: 개별
   테스트가 못 잡는 "데이터 주면 되지만 빈 상태에서 터지는" 부류를 235종에 같은
   시나리오(업그레이드→attribute 흔들기→재부모화→해제)로 검사했다. 크래시해도
   나머지를 계속 봐서 문제를 한 번에 모은다. jd-heatmap·jd-diff-viewer 2종이 걸렸는데
   **happy-dom이 `tbody.rows`·`tr.cells` 테이블 API를 미구현**한 환경 갭이었고
   (실 Chrome puppeteer로 에러 0 렌더 확인) 스모크에서만 제외했다.
5. **죽은 프롭 교정**: textarea-autosize의 `autoResize`는 선언만 되고 읽히지 않는
   죽은 프롭이라 제거(정의상 항상 성장, AUTHORING §9). offline-indicator의
   `online`은 네트워크 워처가 JS로 갱신하는 파생 상태라 default:true 유지(config 아님).
6. **base.css FOUC 규칙은 공유 파일 동시 편집이지만 additive**: 여러 에이전트가
   각자 컴포넌트의 `:not(:defined)` 업그레이드 전 display를 append했다. 서로 겹치지
   않고 기존 패턴과 동형이라 유지 — 빌드·테스트 통과로 검증.
- 게이트: tsc 0 · vitest 351/351(신규 스모크 포함) · size-gate PASS(평균 2.03KB ·
  p95 4.30KB) · gen-exports 237종 배럴.
- **원장: web 292/445** (composites 160/185 · finance 1/86 · 나머지 카테고리 완주 유지).
  라운드2 잔여 153종(composites 25 · patterns 43 · finance 85)은 세션 한도 리셋 후 재개.
- 결정자: 대량 이식 1차, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — iOS primitives 잔여 27종 (원장 iOS 73/445)

### DEC-034. "새 컴포넌트가 답이 아닌" 판정 + Core 결함 4건 교정
1. **판정 분포 — 실구현 17 · 레시피/시스템 API 8 · 별칭 2**: 정찰이 내린 "컴포넌트를 만들지
   말라"는 결론을 그대로 채택했다. VisuallyHidden(접근성 모디파이어) · AnnouncerProvider
   (`UIAccessibility` 래퍼) · NumberFormatter(Foundation 포맷) · ScrollArea(ScrollView) ·
   Icon(SF Symbols) · Image(AsyncImage)는 **라이브러리에 타입이 없고** RECIPES.md 조립법이
   전부다. AspectRatio·OTPInput은 별칭(각각 AspectRatioBox·PinInput). 04 §10 번역 원칙의
   가장 순수한 적용 사례다 — 시스템이 이미 하는 일을 감싸면 유지 비용만 남는다.
2. **Core가 담은 것은 "렌더가 재구현하면 안 되는 계산"뿐**: 포맷(JdNumberFormat)·마스킹
   (JdPhoneMask)·강도(JdPasswordStrength)·핀 규칙(JdPinRules)·하이라이트 매칭(JdHighlight)·
   클램프(JdNumberInputRules)·별점(JdStarRating)·스크롤 판정(JdBackTop). 렌더 계층은 호출만
   한다. 이 분할 덕에 하이라이트 구간 테스트가 "Core 세그먼트 == attributed range"로 서고,
   렌더가 자체 매칭을 넣는 순간 깨진다.
3. **실측 교정 ① 반올림 모드**: `NumberFormatter` 기본이 `.halfEven`이라 2.5 → "2", 12.5 →
   "US$12"로 웹 Intl(halfExpand)과 어긋났다. `roundingMode = .halfUp` 명시로 교정.
4. **실측 교정 ② compact 단위 미재평가**: 9999 → "10천", 99999999 → "10,000만"처럼 반올림이
   사다리를 넘고도 아래 단위에 머물렀다. 반올림 후 단위를 **재평가**하도록 고쳐 "1만"·"1억"
   (Intl notation:"compact" 동형). 사용자에게 그대로 노출되면 명백히 어색한 값이었다.
5. **실측 교정 ③ 비밀번호 강도 웹 패리티**: Core가 규칙 4종(소문자 누락) + 자체 라벨
   (약함/보통/강함/매우 강함)이었는데 웹은 **5종 + 길이 보너스 + 임계 0.3/0.5/0.8 +
   취약/보통/양호/강력**이다. 화면 문구까지 어긋나므로 웹 산식·라벨로 맞췄다
   (`JdPasswordLevel` 신설, `normalized` 점수 노출).
6. **실측 교정 ④ UIKit 제약 순서 버그**: `JdPasswordInputView`가 강도 막대 등폭 제약을
   **스택에 넣기 전에** 걸어 "no common ancestor" 예외로 테스트 4건이 죽었다. 추가 후 제약으로
   교정 — Auto Layout 제약은 공통 조상이 생긴 뒤에만 활성화할 수 있다는 규칙의 사례.
7. **테스트가 구현을 교정한 사례**: Core 테스트 배치에 "테스트를 구현에 맞추지 말라"고 지시한
   결과, 에이전트가 웹 대조본(Intl·element.ts)을 직접 돌려 위 ③④를 **기대 실패 블록으로
   보고**했다. 통합자가 Core를 고치고 그 블록을 제거했다 — 지시 문구 하나가 결함 2건을 건졌다.
8. **명명 충돌 3건(Core enum 우선)**: 뷰가 이름을 양보했다 — `JdHighlightText(View)` vs
   `JdHighlight(enum)`, `JdMentionLabel` vs `JdMentionChip`, `JdHashtagLabel` vs `JdHashtag`.
   추가로 `JdHashtagLabelView.hashtag`(UIView.tag 충돌), `JdCodeView.codeSize`,
   `JdFileUploadZoneView.zoneDescription`(NSObject.description). UIControl 소유 이름 금지 규칙
   (DEC-031-4)의 연장이며, **UIView/NSObject 상속 이름까지 대상**임이 실측됐다.
9. **접근성 보정 계속**: StarRating은 별 N개가 아니라 컨트롤 하나에 `.adjustable`(0.5 증감)로
   VoiceOver 별점 입력을 가능하게 했고, Link의 external은 아이콘 대신 "새 창에서 열림"을 라벨에
   합류, CopyButton은 복사 완료를 `JdAnnouncer`로 통지한다(웹은 라벨 교체로만 알렸다).
10. **하네스 함정 추가 실측**: `UIHostingController.sizeThatFits`에 **유한 높이**를 제안하면
    제안값을 그대로 돌려줘 크기 램프가 관측되지 않는다(400 == 400). 자연 높이가 필요하면
    `.greatestFiniteMagnitude`를 제안해야 한다. 기존 `sendActions` 무동작 함정과 같은 계열.
- **스펙 보강 후보(G2)**: JdCodeSpec·JdMarkSpec 부재(형광펜 5색을 JdTagSpec 팔레트로 근사,
  yellow→orange·pink→red), JdLinkVariant의 default·primary 동색 문제, 핀/강도 전용 스펙,
  Motion 프리셋 지속시간(웹 280/300/400ms가 Duration 램프 밖이라 전부 slow로 통일),
  CopyButton 2초·pulse 2초가 Duration 사다리(최대 0.5) 밖.
- 검증: 시뮬레이터 빌드 에러 0 · XCTest 477건 · 쇼룸 73종 데모 등록 typecheck 통과.
- 결정자: 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B13 composites 오버레이·피드백 (14행, Sheet·ConfirmDialog 별칭 포함)

### DEC-033. 오버레이 축 통합 판단 5건
1. **오버레이 5종이 jd-modal 하나를 상속한다**: v2는 Modal·Drawer·BottomSheet·Sheet·
   ActionSheet가 **각자** ESC 리스너·body 스크롤 락·백드롭을 다시 구현했고, 그래서
   미묘하게 달랐다 — Drawer만 dismissible, ActionSheet는 ESC가 아예 없고, 넷 다
   **포커스 감금이 없었다**. v3는 그 전부를 jd-modal이 갖고 파생은 패널 기하와 골격만
   재정의한다(§6 R12). 감금·요청형 닫기(jd-request-close)·재연결 복원이 공짜로 붙는다.
2. **별칭 2건**: v2 Sheet는 BottomSheet + 드래그 하나 차이라 `draggable` 옵트인으로
   흡수했고, ConfirmDialog는 AlertDialog와 표면이 같아 태그를 따로 두지 않는다.
   원장에는 행을 유지하고 notes에 alias-of를 적었다(Divider 선례).
3. **role=alertdialog로 교정**: v2 AlertDialog는 role="dialog"였다. alertdialog는
   **열리는 순간 내용을 읽어준다** — 파괴적 작업 확인이 정확히 그 용도다. 제목·설명은
   aria-labelledby/describedby로 실제 노드를 가리키고, 확인 버튼에 data-autofocus를
   달아 트랩의 initialFocus와 맞물리게 했다.
4. **자동 닫힘은 포인터가 올라가면 멈춘다**(WCAG 2.2.1): 스낵바·토스트 모두. 읽는
   중에 사라지는 것은 접근성 지침이 직접 지적하는 문제인데 v2에는 정지 경로가 없었다.
5. **collapsible Callout은 details/summary 위임**: v2는 useState + div로 만들어
   aria-expanded가 없었다 — 네이티브는 열림 상태를 AT에 보고하고 키보드도 공짜다.
- **또 색 대비**(세 번째 실측): jd-banner의 흰 글자가 semantic 원색 배경 위에서
  info 3.9 · warning 3.6 · success 4.0으로 AA 미달이었다(v2 `bg-warning text-white`
  승계). 이번엔 글자가 아니라 **배경**을 조정한다 — foreground를 20% 섞어 색상은
  유지하고 명도만 내린다. 데모에 success 배너를 추가해 게이트 사각을 없앴다.
- 검증: vitest 349/349(신규 16) · e2e 51/51 · size-gate PASS · web-a11y PASS(9페이지)
  · demo/overlay-feedback.html 실측 — 드로어 감금·ESC 복원(body overflow 원복 포함)·
  액션시트 선택·alertdialog 자동 포커스·토스트 스택·details 상태, 콘솔 에러 0.
  (드로어 패널이 뷰포트를 넘는 것처럼 보인 측정은 **진입 애니메이션 중간값**이었다 —
  정지 후 우 1100/좌 0으로 정확히 붙는다. B7 색 전이와 같은 계열의 측정 함정.)
- 원장: composites 15/185 · web done 146/445.
- 결정자: B13 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B8~B12 Behavior 46종 (hooks 55행) — **hooks 55/55 완주**

### DEC-032. 훅 → Behavior 이식 판단 7건
(번호 주: DEC-031이 병행 트랙과 **중복 부여**됐다 — iOS "대기열 31종"과 웹 B7이 같은
번호를 갖는다. 양쪽 다 커밋된 뒤에 발견해 여기서는 032로 이어가고, 재번호는 사람 판단
사항으로 남긴다.)

1. **파일은 훅 단위가 아니라 계열 단위**: 46종을 파일 46개로 쪼개면 배럴이 본문보다
   커진다. 관찰자 계열은 `createWatcher` 골격 하나를 공유하고(v2 훅 55종 중 관찰자류는
   전부 useState+useEffect(구독)+return의 같은 모양이었다), 유틸은 한 줄짜리가 많아
   media/viewport/timing/input/storage/document/scroll/interaction/form/data 10개 파일로 묶었다.
2. **중복 훅 4쌍은 단일 구현 + 별칭**(§6 R12 · 00-inventory §4): useElementSize=
   useResizeObserver → `createSizeObserver`, useHotkeys=useKeyboardShortcut →
   `createHotkeys`, useClipboard=useCopyToClipboard → `copyText`, useKeyboard는
   createHotkeys의 요소 스코프 표면. 원장에는 55행을 유지하고 notes에 alias-of를 적었다.
3. **N/A 9종은 구현하지 않고 내부화로 닫았다**(CoreProvider 선례): useDisclosure·
   useSteps·useToggle·usePrevious·useMounted·useIsomorphicLayoutEffect·useUpdateEffect·
   useAsync·useOptimisticState. 전부 **React 렌더 사이클이 있어야 의미가 생기는** 상태
   훅이다 — 바닐라에서 억지로 만들면 "상태를 어디에 둘 것인가"를 두 번 답하게 된다.
   CE는 connectedCallback·update()가 그 자리를 이미 갖고 있다.
4. **useDebounce는 의미를 바꿔 이식했다**: v2는 *값*을 지연시키는 훅이었다(렌더 결과를
   늦추는 React 관용구). 바닐라에는 그 자리가 없어 표준형 `debounce(fn, ms)`로 낸다 —
   00-inventory §4 매핑표가 이미 그렇게 못박고 있었다. 이름이 같다고 표면까지 같을 수는 없다.
5. **v2 결함 3건 교정**: (a) useHotkeys의 `e.key` 비문자열 방어는 v2 주석이 실사고를
   기록해 둔 대로 승계(전역 keydown 리스너가 여기서 터지면 페이지 입력이 통째로 막힌다).
   (b) useLongPress의 mouse/touch 이벤트 쌍을 pointer로 교체 — 펜·터치가 함께 산다.
   (c) usePanelResize도 pointer + setPointerCapture로 바꿔 커서가 핸들을 벗어나도
   드래그가 끊기지 않는다.
6. **결합을 명시 표면으로 되돌렸다**: v2 useScrollSpy는 `window.dispatchEvent(
   new Event("scrollspy:manual"))`이라는 **전역 이벤트 이름**으로 앱과 몰래 계약하고
   있었다 — 라이브러리가 문서화되지 않은 전역 채널을 여는 것은 유지보수 부채다.
   v3는 `suspend(ms)` 메서드로 바꿨다. useInfiniteFeed도 훅이 들고 있던 페이지네이션
   상태(items·cursor·hasMore)를 떼어내고 "바닥에 닿았다 + 중복 호출 가드"만 남겼다 —
   목록 상태는 데이터 계층의 일이다.
7. **createForm은 폼 자체를 정본으로 삼는다**: v2 useForm은 값·터치·에러를 전부 React
   state로 복제하고 필드마다 onChange/onBlur를 나눠줬다. 바닐라에서는 **폼 요소가 이미
   값을 갖고 있다** — Behavior는 규칙 판정과 에러 표시만 얹는다(§1.6-1 네이티브 위임의
   폼판). 에러는 jd-* 컴포넌트의 `error` 프로퍼티로, 없으면 aria-invalid로 나간다.
- 사이즈: behaviors는 `core/index.ts`에 합류시키지 **않았다**. 게이트의 코어 정의(W1
  8KB)는 "베이스클래스+define+styles+uid+style-props+포커스트랩"이며, 46종을 코어 배럴에
  넣으면 그 정의가 무의미해진다. 코어 5.25KB 그대로 통과.
- 검증: vitest 333/333(신규 35 — 구독 해제·destroy 멱등·debounce/throttle 타이밍·
  저장소 손상 JSON·쿠키 이스케이프·lockScroll 중첩·폼 검증/제출 차단·리소스 in-flight
  합류) · e2e 51/51 · size-gate PASS · web-a11y PASS(8페이지).
- **원장: hooks 55/55 완료** (web done 132/445 · core·layout·primitives·hooks 전부 완주).
  남은 것은 composites 184 · finance 86 · patterns 43.
- 결정자: B8~B12 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — iOS 대기열 31종 일괄 이식 (layout 12 + primitives 19)

### DEC-031. 대기열 배치 판단 10건 + 실측 버그 4건
(번호 주: 029·030을 병행 트랙이 선점 — 031로 부여. ledger notes의 "DEC-029" 표기는
이 항목을 가리킨다 — 커밋 선점 규칙에 따라 본문 번호가 정본.)

1. **Core 스펙을 통합자가 선작성해 병렬 배치의 계약으로 삼았다**: `JdPrimitiveOptions.swift`
   (옵션 16종 + JdRadioOption/JdSliderMark) · `Specs/JdControlSpecs.swift`(폼 + JdRangeState) ·
   `Specs/JdDisplaySpecs.swift`(표시 9종)를 먼저 확정하고 `demo/DESIGN-2.md`가 이를 가리키게
   했다. 렌더 계층 6배치가 **파일 경로 disjoint**로 동시에 돌아도 값 불일치가 생기지 않는다.
2. **31종의 실체 분포 — 실구현 20 · 레시피 7 · 별칭 4**: 별칭은 Switch(=Toggle),
   Divider(=CoreDivider), Wrap(=Group/JdFlowLayout), LayoutDivider(=Divider)로 **신규 타입을
   만들지 않았다**(R12). 레시피 7종(Stack·Grid·SimpleGrid·Container·Overlay·AspectRatioBox)은
   RECIPES.md + 데모 recipe로만 제공(04 §10.1). ledger notes에 행별로 사실대로 기록.
3. **웹 접근성 결함 5건을 iOS에서 보정**: 웹 status-dot·battery·severity-badge는 role·aria가
   전무하고 값이 색·폭으로만 전달된다. iOS는 StatusDot(라벨 없으면 상태명을 라벨로),
   Battery(accessibilityValue "N 퍼센트"), SeverityBadge(심각도명을 값으로), Label(required
   표식을 "필수"로 라벨에 합류), Textarea(error를 값으로)로 노출한다 — 패리티보다 접근성이
   우선인 유일한 축이며, 시각 패리티는 그대로 유지된다.
4. **UIControl 서브클래스의 이름 충돌은 규칙으로 승격**: `state`/`isEnabled`/`isSelected`/
   `isHighlighted`는 UIControl 소유라 오버라이드 불가 — JdRangeSliderView는 `rangeState`,
   JdCheckboxView는 `isSelectedState`를 쓴다(JdTextView `size`→`textSize` 선례의 일반화).
5. **실측 버그 ① JdRangeState의 클램프·양자화 순서**: clamp→quantize 순이라 upperBound가
   step 배수가 아니면(예: 0…95, step 10) 반올림 결과가 범위를 넘었다. **quantize→clamp**로
   교정하고 `value(atFraction:)`에도 같은 순서를 적용, 회귀 가드 3건 신설. 경계값은 step
   배수가 아니어도 도달 가능해야 한다(네이티브 input[type=range] 계약).
6. **실측 버그 ② UIKit RangeSlider가 아예 그려지지 않았다**: `positionTrack()`이 스택의
   자식 bounds 확정 전에 돌아 width 0 guard에 걸렸다. `layoutSubviews`에서
   `rootStack.layoutIfNeeded()` 선행으로 해소 — 컴파일·단위 테스트로는 잡히지 않고
   **쇼룸 실기동 스크린샷에서만** 드러난 종류의 결함이다(쇼룸의 존재 이유).
7. **실측 버그 ③ 쇼룸 접근성 인스펙터의 얕은 재귀 상한**: 깊이 12에서 잘려 SwiftUI 호스팅
   계층의 실제 컨트롤에 닿지 못하고 "요소 없음"으로 오보했다. 60으로 상향해 해소.
8. **SwiftUI 접근성 트리는 보조기술이 켜져야 실체화된다**: 그래서 SwiftUI 스테이지의
   인스펙터는 비어 보이는 것이 정상이고, UIKit 스테이지는 정상 조회된다(JdRangeThumbView
   최솟값/최댓값 · adjustable · 값 20/80 실측). 빈 상태 문구에 이 사실을 명시해 오해를 막았다.
9. **실측 버그 ④ 테스트 하네스: `sendActions(for:)`가 무동작**: 앱 호스트 없이
   `simctl spawn … xctest`로 도는 번들에는 UIApplication이 없어 UIControl 액션 디스패치가
   조용히 실패한다(상태 단언은 통과, 액션만 미발화 — 실패 13건의 공통 원인). 등록된
   target-action을 직접 호출하는 `jdSendActions(for:)` 헬퍼로 교체 — addTarget이 빠지면
   여전히 실패하므로 회귀 감지력은 유지된다.
10. **Avatar 이니셜 웹 패리티 교정**: 웹은 `name.trim()` 후 split이라 공백만 있는 이름은 빈
    이니셜("?" 폴백)이 되고, 3어절은 **앞 두 어절**(첫+끝이 아님)이다. Core를 웹과 일치시키고
    잘못된 기대값을 쓰던 테스트를 정정했다.
- **스펙 보강 후보(G2)**: JdBadgeSpec의 countForeground·dotColor·fontWeight,
  JdIconButtonSpec·JdSliderSpec·JdTextareaSpec의 disabledOpacity 비대칭,
  JdAvatarSpec의 fallbackBackground·statusRingColor, JdStatusDotSpec.pulsePeriod(2s가 Duration
  램프 밖), JdSeverityBadgeSpec의 fontWeight·radius, JdToggleSpec의 크기축 무동작
  (labelFontSize가 sm/md/lg 동일 + 시스템 컨트롤이라 실효 없음), JdCheckboxState.next() 승격.
- **접근성 미해결**: IconButton 히트 타깃이 xs 24·sm 28·md 32·lg 40으로 **네 크기 모두
  HIG 44pt 미만**(웹 크기 승계). 표면은 유지하고 코드 각주로 남겼다 — 크기 램프 재심의감.
- 검증: 시뮬레이터 빌드 에러 0 · **XCTest 293/293**(76→293) · 쇼룸 46종 데모 등록·실기동
  (Spacer 2×size 각주 · Slider showsValue 헤더 · RangeSlider 양 계층 · 접근성 인스펙터).
- 결정자: 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B7 primitives 인프라·소셜 (10행) — **primitives 51/51 완주**

### DEC-031. B7 인프라·소셜 판단 6건
1. **재부모화(disconnect→connect) 생존 규율 — 이번 배치 최대 발견**: 조상 CE가 자기
   children을 골격 안으로 옮기면(jd-section이 그렇게 한다) 자손 호스트는
   **disconnect → connect를 한 번 겪는다**. JdElement 계약상 재연결에서는 render()도
   update()도 부르지 않고 `connected()`만 부르며, `own()`한 Behavior는 disconnect에서
   **destroy된다**. 그래서 (a) jd-portal은 회수한 노드를 다시 내보내지 못했고,
   (b) jd-focus-guard는 destroy된 트랩을 붙들어 activate()가 영구 무시됐다 —
   둘 다 격리 페이지에서는 통과하고 **데모 페이지에서만** 깨져 실측으로만 드러났다.
   처방: 이런 컴포넌트는 `connected()`에서 `requestUpdate()`, `disconnected()`에서
   파괴된 Behavior 참조를 버린다. **자기 서브트리 밖에 부수효과를 남기거나 Behavior를
   own하는 컴포넌트는 전부 이 규율의 대상**이다(B5·B6 전량 점검 — 리스너를
   connected/disconnected 쌍으로 붙이는 것들은 이미 안전).
   *열린 선택지*: core에서 재연결 시 update()를 부르게 하면 전 컴포넌트가 자동 치유된다
   (§3.3 멱등 계약 덕에 안전). 공유 파일이라 이번 배치에서는 손대지 않고 기록만 남긴다.
2. **ErrorBoundary는 능력 범위를 좁혀서 이식했다**: React 경계는 *렌더 예외*를 가로채지만
   바닐라에는 그 훅이 없다 — 자손이 던진 예외는 조상으로 오지 않고 window로 간다.
   그대로 흉내 내면 거짓 안전감을 준다. 그래서 제공 범위를 (a) 실패 상태기계 + 폴백 UI +
   재시도, (b) **opt-in** 자동 포착(`auto`: 자손 리소스 error 캡처 + jd-error)으로 명시했다.
   자동 포착이 기본이 아닌 이유: 이미지 한 장 실패로 섹션 전체를 대체 UI로 바꾸는 것은 과잉.
   v2 동형의 렌더 예외 포착이 필요하면 react 어댑터의 진짜 클래스 경계를 쓴다.
3. **FocusGuard 기본값을 뒤집었다**: v2 `active=true`는 "조건부 렌더되는 모달 안"이라는
   전제 위에서만 옳다. 항상 DOM에 있는 CE에서 그 기본값은 페이지에 놓는 순간 포커스를
   가둔다. Behavior 규약(§5.1)도 "create 시점에 리스너를 붙이지 않고 activate()가 시작점"
   이라고 못박고 있어 그쪽에 맞췄다. 로직은 Modal과 같은 createFocusTrap 재사용 —
   Tab 순환·복귀 규칙이 두 벌로 갈라지지 않는다.
4. **Announcer는 Context 대신 요소 메서드 + 지연 싱글턴**: `announce(msg, politeness)`
   모듈 함수가 문서당 하나의 `<jd-announcer>`를 필요할 때 만든다 — import만으로 DOM을
   건드리지 않아 SSR 안전(§3.1). 같은 문구 반복도 전달되도록 비웠다가 다음 프레임에
   채우는 v2 관용구를 그대로 승계했다.
5. **FollowButton 라벨 3종을 DOM에 다 두고 CSS가 고른다**: v2는 hover/focus를 React
   state로 들어 포인터가 스칠 때마다 리렌더가 돌았다. `:hover`/`:focus-visible`로
   표시만 바꾸면 JS 0줄이고 v2가 따로 배선하던 포커스 경로(onFocus/onBlur)까지 공짜다.
   단, **접근 이름은 상태 기준으로 고정**한다 — 호버로 접근 이름이 바뀌면 AT 사용자에게는
   이유 없는 변화다(v2는 라벨=접근 이름이라 같이 흔들렸다).
6. **"그래픽 3:1 / 텍스트 4.5:1"을 색 결정의 기준선으로 고정**: 같은 rose-500이
   하트 아이콘에서는 충분(3.32:1 > 3:1)하고 옆의 **숫자에서는 미달**이다 — axe가
   `.jd-like-button__count`만 정확히 집어냈다. 처방은 DEC-030-7과 동일(글자만
   foreground 65% 혼합). FollowButton 언팔로우 라벨도 같은 결함이지만 **호버 상태라
   정지 감사에 잡히지 않는다** — 선제 적용했다. 교훈: 상태로만 드러나는 표면은 게이트가
   못 보므로 데모에 상태를 노출시키거나 손으로 계산해야 한다(B5 강도 게이지와 동형).
- 검증: vitest 298/298(신규 25) · e2e 51/51(신규 8, 실키보드 Tab 감금·재부모화 생존·
  CSS 호버 라벨) · size-gate PASS(평균 1.10KB) · web-a11y PASS(8페이지 critical/serious 0)
  · demo/infra-social.html 실측 — 포털 이동·live region 2종·Tab 5회 전부 감금 유지·
  경계 자동 포착·소셜 토글 재현, 콘솔 에러는 의도적 404 1건뿐.
- **원장: primitives 51/51 완료** (web done 77/445 · core 13/13 · layout 12/12).
  다음은 07-rollout §2 순서표대로 B8~B12 Behavior(훅 55종).
- 결정자: B7 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B6 primitives 텍스트·미디어 구현 중 발견 (9행 + AspectRatio 별칭)

### DEC-030. B6 텍스트·미디어 판단 7건
1. **CE 안의 SVG는 네임스페이스가 다르다(실측 발견)**: `<jd-icon><path d="…"/></jd-icon>`의
   `<path>`는 HTML 파서가 만든 **HTML 네임스페이스** 요소다. `<svg>`로 append하면 노드는
   들어가지만 **아무것도 그려지지 않는다** — 헤드리스 실측 스크린샷의 빈 영역으로 발견했다.
   `svg.innerHTML = 원본`으로 재파싱해야 SVG 네임스페이스로 생성된다. 회귀 고정은
   `namespaceURI` 단언(테스트가 노드 존재만 보면 이 결함을 통과시킨다).
2. **AspectRatio는 신규 태그 없이 별칭**(R12 · Divider 선례): B2 `<jd-aspect-ratio-box>`가
   표면을 전량 커버한다. v2 primitives/AspectRatio의 padding-bottom 트릭 대신 CSS
   `aspect-ratio`이며, 수치(1.777)·분수("16/9")를 모두 받는 상위집합이다.
3. **골격 0 컴포넌트 2종**: ScrollArea는 호스트가 곧 스크롤 컨테이너, NumberFormatter는
   호스트가 곧 텍스트 자리다. v2의 래퍼 div를 승계하지 않는다 — light DOM이라 노드를
   덧대지 않아도 같은 결과가 나오고, 소비자 CSS가 붙일 자리도 호스트 하나로 단순해진다.
4. **DEC-014-9(box-sizing 자기 선언) 위반 1건 선제 교정**: jd-scroll-area는 max-height와
   소비자 padding/border 병용이 기본 사용례인데 box-sizing 미선언이면 총높이가
   140+24+2=166이 된다(v2 preflight border-box에선 140). e2e가 총높이 140을 고정한다.
5. **fallback은 절대배치가 아니라 흐름 배치**: jd-image 실패 상태에서 img를 감추므로
   fallback을 `position:absolute; inset:0`으로 두면 ratio·height를 주지 않은 사용처에서
   높이가 0이 되어 **아무것도 보이지 않는다**(e2e 실증). placeholder만 절대배치(박스를
   로딩 중인 img가 준다), fallback은 흐름. 캐시 보정도 **성공만** 추론한다 —
   `complete && naturalWidth===0`은 "실패"뿐 아니라 "아직 로드하지 않는 환경"에서도
   참이라(happy-dom 실측) 오탐이 된다. 실패는 캐시된 것이라도 error가 다시 발화한다.
6. **감속 대응을 JS에서 CSS로 옮겼다**: v2 Motion은 `useReducedMotion`(matchMedia)을 읽어
   클래스 부착 여부를 정했다 — 프리렌더 산출물이 실행 환경에 따라 달라진다는 뜻이라
   §3.1-3과 충돌한다. v3는 `@media (prefers-reduced-motion)`로 애니메이션만 끈다(JS 0줄,
   초기 HTML 동일). 옵트아웃은 `force-motion`. Playwright `emulateMedia`로 양방향 고정.
7. **semantic 원색은 텍스트 대비를 만족하지 않는다(axe 게이트 실측)**: 10% 틴트 위의
   `--jd-color-success`(3.6:1) · `--jd-color-warning`(3.3:1)이 AA 미달로 잡혔다 —
   v2 `text-success`/`text-warning`이 갖고 있던 결함의 승계다. **글자만**
   `color-mix(… 65%, var(--jd-color-foreground))`로 섞는다(막대·아이콘 등 그래픽은 3:1이라
   원색 유지). 라이트에선 어두워지고 다크에선 밝아져 한 선언이 양 테마를 함께 만족한다.
   같은 결함이 B5 jd-password-input 강도 라벨·규칙 텍스트에도 있어 **소급 교정**했다 —
   빈 값일 땐 게이지가 렌더되지 않아 감사에서 통째로 빠져 있었다(데모에 초기값 2종 추가).
- **게이트 자체 보강**: web-a11y 감사가 `jd-motion` 진입 모션 중간(opacity 0)을 찍어
  색대비 실패로 잡았다 — 감사 대상은 정지 상태여야 한다. `document.getAnimations()`의
  유한 애니메이션 완료를 기다리도록 수정(무한 반복 제외 + 2초 상한). 타이밍 의존
  플레이키를 함께 제거한다.
- 검증: vitest 273/273(신규 25) · e2e 43/43(신규 8) · size-gate PASS(평균 1.14KB ·
  신규 9종 0.50~1.55KB, icon +3.3%는 §1 수정의 의도된 증가로 기준선 갱신 — DEC-024-3 동형)
  · web-a11y PASS(7페이지 critical/serious 0) · demo/text-media.html 헤드리스 실측 —
  아이콘 6종 렌더 박스·스크롤 0→108(PageDown)·총높이 140·통화 4종·다크 반전 재현.
- 결정자: B6 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — G2-B5 primitives 특수 입력 구현 중 발견 (10행)

### DEC-029. B5 특수 입력 판단 8건
1. **"값 없음"은 NaN 센티널**: NumberInput·CurrencyInput·FileUpload(maxSize)의 v2
   `number | undefined`를 표현할 수단이 attribute에는 없다(복합 값 금지, WEB-03).
   Number 프롭의 `default: NaN`을 미지정 센티널로 고정 — attribute 부재 → NaN →
   입력 표시는 빈 문자열, min/max는 "제한 없음". 파생 규칙: 사용자가 필드를 비우면
   NaN이 되며 **0으로 강제하지 않는다**(v2 CurrencyInput은 0을 밀어 넣어 필드를
   영영 비울 수 없었다).
2. **클램프는 확정 시점에만**: v2 NumberInput은 onChange(=입력 이벤트)마다 클램프해
   min=10인 필드에 "5"를 치는 순간 10이 되어 "50"을 입력할 수 없었다. v3는 입력 중
   (jd-input)엔 원시값, change·스텝 버튼에서만 클램프한다. 되쓰기 가드도 함께 도입 —
   현재 문자열이 같은 수로 파싱되면 건드리지 않는다("1." 입력 중 절단 방지, B3 IME 가드 동형).
3. **StarRating을 네이티브 radio 묶음으로 재작성**: v2는 별 개수만큼 `<button role="radio">`를
   전부 탭 순서에 넣고 `aria-checked={star <= value}`로 **여러 개를 동시에 checked**로
   노출했다. 네이티브 위임(§1.6-1)이 단일 탭스톱·화살표 순회·단일 선택을 한 번에
   해결 — 수제 키보드 코드 0줄. 실측: 탭스톱 1회(e2e 탐침 진입), ArrowRight로 값 이동.
   호버 미리보기만 포인터 이벤트로 유지(render 단계 금지, §3.1-3).
4. **PhoneInput 국가 선택도 네이티브 select 위임**: v2 수제 드롭다운은 키보드 조작·
   role·외부 클릭 닫기·Escape가 전무했다. select는 그 전부 + 모바일 네이티브 피커 +
   타이핑 점프가 공짜다. 대가는 **열린 목록의 외관이 플랫폼 기본**이라는 것 —
   닫힌 상태(국기+국가번호+캐럿)는 appearance:none + 캐럿 겹침으로 v2 외관 유지.
   DEC-023-1(Slider→range)과 같은 계열의 교환이다.
5. **v2 기본값 참(true) 불리언은 반전 attribute로**: PinInput의 `numeric = true`는
   attribute로 표현할 수 없다(존재=참이라 부재를 기본참으로 두면 끌 방법이 없다).
   `alphanumeric` 옵트아웃 플래그로 반전 — 레포 전체에 `default: true` 불리언 0건이라는
   기존 관행과도 정합. OTPInput은 이 게터를 false로 고정해 숫자 전용을 강제한다.
6. **OTPInput = PinInput 파생**: baseClass·시트·`separatorIndex()`·`textMode`만 재정의하고
   이동·삭제·붙여넣기·완료 통지 로직은 전량 공유(§6 R12, DEC-023-5 Switch=Toggle 선례).
   칸 리스너는 호스트 위임 4종(input·keydown·paste·**focusin** — focus는 버블하지 않는다)이라
   length 변경으로 칸을 재구축해도 재부착이 필요 없다.
7. **실패 경로를 삼키지 않는다**: v2 CopyButton은 `await navigator.clipboard.writeText()`만
   걸어 보안 컨텍스트·권한 거부에서 unhandled rejection을 냈고, 언마운트 후에도 2초
   타이머가 setState를 때렸다. v3는 try/catch → `jd-error`, 타이머는 disconnected에서 해제.
   e2e가 이를 직접 고정한다(setContent는 about:blank라 clipboard 부재 — 그 환경이 곧 시험대).
8. **CurrencyInput 소수 자릿수는 Intl 통화 기본값**: v2 `currency === "KRW" ? 0 : 2`
   하드코딩은 0자리 통화(JPY·VND·CLP)를 ￥800.00으로 틀리게 찍었다. Intl 기본값은
   KRW 0 · USD 2로 **v2가 맞게 다루던 두 축과 동일**하므로 패리티 손실 없이 오류만 사라진다.
   표기 전환(₩1,500,000 ↔ 1500000)은 update()의 "같은 수면 두기" 가드에 걸리므로
   focus/blur 핸들러가 직접 기록한다 — 값은 같고 표기만 달라지는 유일한 경우.
- 검증: vitest 248/248(신규 39) · e2e 45/45(신규 11, 실브라우저 전용 계약: 탭스톱·
  화살표 순회·실드롭·스크롤 노출) · size-gate PASS(평균 1.18KB · p95 2.33KB, 신규 10종
  1.19~3.25KB) · web-a11y PASS(6페이지 critical/serious 0) · demo/special-input.html
  헤드리스 실측 — 콘솔 에러 0, PIN 40×48·OTP 44×52·별 #facc15/#d1d5db·다크 전환 재현.
- 미해결(기록): 국기 이모지는 플랫폼 폰트 의존(v2 승계) — SVG 국기는 icons/ 파이프라인 과제.
- 결정자: B5 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

---

## 2026-07-24 — iOS 확장 지령 1차: 네이티브 쇼룸 + B-core 12종 + 성능 체계

### DEC-028. 쇼룸 개편·core 이식·벤치 체계 판단 9건
1. **쇼룸은 원장 파생 (손 관리 금지)**: `demo/tools/gen-catalog.mjs`(의존성 0 node)가
   ledger.json 445행 → `Generated/ShowroomCatalog.swift`를 방출한다. 카테고리 7종 인덱스·
   검색·상태 배지(iOS done/예정/n·a·웹 done)·진행률이 전부 원장 값이며, **미구현 컴포넌트도
   목록에 남긴다**(진행률 가시성이 쇼룸의 가치). 중복 id 실존(AreaChart)이라 Identifiable 키는
   `category/id` 복합키.
2. **상세 화면은 선언적 스키마 구동 (수제 화면 금지)**: `ComponentDemo`(controls +
   스테이지 클로저) 하나만 선언하면 `ComponentDetail`이 스테이지·컨트롤·환경·원장 섹션을
   일괄 렌더한다. 컨트롤 4종(options/toggle/slider/text)으로 15종 데모를 전부 표현했고,
   배치마다 파일 1개 추가 + `DemoRegistry.all` 한 줄 등록만 늘어난다(레지스트리 단일 지점
   갱신 = 병렬 배치의 병합 충돌 회피).
3. **다크·Dynamic Type 시뮬레이션은 트레이트 오버라이드로 (프로세스 설정 변경 금지)**:
   `StageHost`(UIViewControllerRepresentable)가 자식 UIHostingController에
   `setOverrideTraitCollection(userInterfaceStyle + preferredContentSizeCategory)`를 건다.
   컨테이너 단위라 쇼룸 UI는 정상 크기를 유지한 채 스테이지만 XS~AX5·다크로 바뀐다.
4. **폰트 브리지 실측 버그 수정 (선행 구현의 결함)**: `UIFontMetrics.scaledFont(for:)`는
   **프로세스 전역** 설정만 따라 트레이트 오버라이드를 무시했다 → `compatibleWith: traits`
   (UIKit) / `category:` 명시 전달(SwiftUI) 경로를 추가하고 전 컴포넌트 호출부를 이관.
   이 수정 없이는 04 §7.2의 "AX5 스냅샷 2종" 게이트 자체가 성립하지 않는다.
5. **스테이지 배경은 오버라이드 안쪽에서 칠한다**: 바깥(List 행)에서
   `JdToken.Color.background`를 칠하면 **바깥 트레이트(라이트)로 해석**돼 다크 스테이지가
   배경만 밝게 남는다(실측). 배경은 오버라이드를 받는 `hosting.view`가 소유한다 —
   다이나믹 컬러의 해석 주체가 "칠하는 뷰의 트레이트"라는 일반 규칙의 사례.
6. **core 12종은 실컴포넌트 4 + 레시피 8로 분할 (04 §10.1 준수)**: 실구현은
   JdText/JdTextView·JdHeading/JdHeadingView·JdDivider/JdDividerView·JdStackView
   (+SwiftUI wrap 전용 JdFlowLayout). Box·Center·Flex·GridLayout·HStack·VStack·Page·Section은
   **iOS 신규 타입을 만들지 않고** `packages/ios/RECIPES.md` + 쇼룸 데모(recipe 필드)로 제공한다.
   ledger 12행 notes에 실구현/레시피를 행별로 명시해 "done"의 의미를 사실대로 남겼다.
7. **타이포 사다리는 v2 리터럴 (토큰 참조 불가 — 하드코딩 예외)**: JdTextSpec의 pt 사다리
   (2xs=10…4xl=36)는 DEC-014-1의 v2 패리티 어휘라 `JdToken.FontSize`(sm=13/md=14)와 값이
   어긋난다. 스펙 상수로 1회 기입하고 헤딩 램프는 JdTextSpec을 경유해 중복을 없앴다.
   어휘 통합은 G2 radius/fontSize 재심의와 함께.
8. **UIKit 한계 2건은 폴백 + 문서화**: (a) UIStackView는 wrap 미지원 → Group의 줄바꿈은
   SwiftUI JdFlowLayout 전담, UIKit은 no-wrap 폴백(데모 UIKit 탭에 각주 표시). (b) UILabel의
   intrinsic 가로폭은 한 줄 전체라 Representable에서 **가로 압축 저항을 낮춰야** 줄바꿈이
   실제로 일어난다(실측 — 낮추기 전 헤딩이 화면 밖으로 넘쳤다).
9. **벤치 체계 신설 + 기준선 확보**: `packages/ios/tools/{run-bench.mjs,bench-gate.mjs,
   bench-budgets.json}`(의존성 0) + XCTest measure 8종. 게이트는 절대 예산(05-perf I1)과
   기준선 ±10%를 함께 본다. **2026-07-24 시뮬레이터 참고치**(iPhone 17/iOS 26.2, 디버그 빌드):
   JdButtonView init **0.27ms/개**, JdTextFieldView init **0.83ms/개** — 둘 다 I1(S·M <1ms) 이내,
   레이아웃 DSL 100뷰×4제약 2ms·diff 재호출 0.01ms/회. **실기기 확정은 Xcode 복구 후**
   (시뮬레이터 수치엔 label로 딱지를 박아 결과 JSON에 남긴다).
- 검증: 시뮬레이터 빌드 에러 0 · **XCTest 76/76**(31→76) · 쇼룸 15종 데모 실기동
  (카탈로그·상세·다크·AX5·UIKit 탭·예정 화면) · 벤치 게이트 PASS 8건.
- 결정자: 구현 중 발견, 근거 기록 후 기본값 채택 (2026-07-24).

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
