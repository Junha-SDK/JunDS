# JunDS iOS — 레시피 (레이아웃 컴포넌트)

04 §10.1 원칙: 웹의 core/layout 컨테이너 중 **iOS 관용구가 이미 있는 것**은 신규 타입을 만들지
않고 조립 레시피로 제공한다. 아래 8종은 라이브러리 컴포넌트가 아니라 SwiftUI/UIKit 관용구 +
JunDS 토큰(JdGap·JdToken)의 조합이다. 쇼룸의 각 데모 스테이지가 이 레시피와 1:1 대응한다.

실컴포넌트로 존재하는 것(레시피 아님): `JdText`/`JdTextView`, `JdHeading`/`JdHeadingView`,
`JdDivider`/`JdDividerView`, `JdStackView`(UIKit HStack/VStack/Group 흡수), `JdFlowLayout`(SwiftUI Group wrap).

---

## 배치를 적는 법 (DEC-042) — 먼저 읽을 것

UIKit에서 화면을 짜는 일이 왜 번거로웠는지부터. `jd.layout`은 **제약만** 만든다. 그래서
뷰마다 (1) 생성 (2) `addSubview` (3) 제약 — 세 단계를 손으로 반복해야 했고, 순서를 어기면
`preconditionFailure("addSubview 이후에 layout을 호출하라")`로 **앱이 죽었다**.

지금은 트리와 제약을 **한 표현식**으로 적는다. 아래 넷이 전부다.

| 하고 싶은 것 | 쓰는 것 |
|---|---|
| 중첩 스택 | `JdVStack(gap:, align:, padding:) { … }` · `JdHStack { … }` |
| 한쪽으로 밀기 | `JdFlex()` |
| 크기·여백 지정 | `.jdSize(44)` · `.jdWidth(96)` · `.jdMinWidth(80)` · `.jdPadded(.md)` |
| 여백 값 조립 | `JdEdge.all(.md)` · `JdEdge.symmetric(v: .sm, h: .md)` · `JdEdge.only(top: .lg)` |
| 부모에 얹기 | `child.jdFill(parent)` · `child.jdFillSafeArea(parent)` |
| **행 간 열 정렬**(표) | `JdColumnsView(columns:) { … }` |
| 폭에 따른 축 전환 | `JdAdaptiveStackView(breakpoint:) { … }` |
| 줄바꿈 흐름 | `JdWrapView(itemSpacing:) { … }` (아래 Wrap 항목) |

정렬·분배는 **웹 어휘**를 쓴다(`JdAlign` = `start·center·end·stretch·baseline`,
`JdJustify` = `start·center·end·between·around·evenly`). `UIStackView.Alignment`가 소비자
코드로 새지 않고, 같은 개념을 웹은 `stretch`·iOS는 `.fill`로 부르는 갈림도 없어진다.
⚠️ `UIStackView`엔 `justify-content` 대응이 없다 — `start/center/end`는 분배가 아니라
`JdFlex()`로 미는 것이 정답이고, 그 비대칭을 숨기지 않았다.

### 기본형

```swift
let row = JdHStack(gap: .sm) {
    avatarView.jdSize(40)
    JdVStack(gap: .xs) {
        nameLabel
        tickerLabel
    }
    JdFlex()                                             // 남는 공간을 먹어 오른쪽으로 밀어낸다
    JdLiveStackedCellView(price: 71_200, change: 1.24)
}
row.jdFill(container, insets: JdEdge.symmetric(v: .sm, h: .md))
```

`JdVStack`/`JdHStack`은 **축이 이름에 있다.** SwiftUI가 `HStack { }`으로 읽히는 이유가
그것이고, 기본값도 웹 `jd-vstack`(gap md·stretch) / `jd-hstack`(gap sm·center)을 그대로
갖는다 — 흔한 경우에 인자를 하나도 적지 않는다.

`if` / `if let` / `for`를 블록 안에서 그대로 쓸 수 있다 — 조건부 화면도 한 표현식이다.

```swift
JdStackView(.vertical, gap: .sm) {
    header
    if let banner { banner }          // nil이면 조용히 빠진다
    for tag in tags { JdTagView(tag) }
    footer
}
```

### ⚠️ `JdSpacerView`와 `JdFlexSpacerView`는 다른 물건이다

- `JdSpacerView(.md)` — **고정** 간격(웹 `jd-spacer`). 토큰 크기를 지키며 늘지도 줄지도 않는다.
- `JdFlexSpacerView()` — **신축** 여백(SwiftUI `Spacer()`). 자기 크기는 0이고 남는 공간을 먹는다.

밀어내기에 고정 간격을 쓰면 아무 일도 일어나지 않는다. 반대로 일정 간격이 필요한 곳에
신축 여백을 쓰면 형제 크기에 따라 간격이 흔들린다.

### 진짜 어려운 것: 행 간 열 정렬 (표)

스택으로는 **구조적으로 안 되는** 배치다. `UIStackView`의 행들은 서로를 모르므로 1행의
"종목명" 폭과 2행의 "종목명" 폭이 각자 정해진다 — 표가 어긋난다. 열마다 고정 폭을 박으면
내용이 길어질 때 잘리고, 그래서 지금까지는 `UICollectionViewCompositionalLayout`을
세우는 것이 유일한 답이었다.

`JdColumnsView`는 **모든 행을 한 번에 측정해 열 폭을 공유**한다.

```swift
let table = JdColumnsView(
    columns: [
        .fit(max: 140, align: .start),   // 폭 규칙과 정렬이 **한 값**이다
        .flex(weight: 1),
        .fixed(96, align: .end),         // 숫자 열은 end — 자리수가 달라도 끝이 맞는다
    ],
    gap: .md,
    rowGap: .sm
) {
    [headerName, headerChart, headerPrice]
    for q in quotes {
        [nameLabel(q), JdPositionBarView(low: q.low, high: q.high, cur: q.cur),
         JdLiveStackedCellView(price: q.price, change: q.rate)]
    }
}
table.jdFill(scrollContent)
table.setRows(newRows)   // 목록 갱신은 이 한 줄
```

열 규칙 세 가지:

| 규칙 | 뜻 |
|---|---|
| `.fixed(96, align:)` | 고정 폭. 소비자 의도라 폭이 모자라도 **줄이지 않는다** |
| `.fit(max:, align:)` | 전 행 중 가장 넓은 내용에 맞춘다. 상한을 넘지 않고, 전체가 넘칠 때 **여기서** 줄인다 |
| `.flex(weight:, align:)` | 남는 폭을 가중치로 나눈다. 가중치가 전부 0이면 균등 분배(0으로 나누지 않는다) |

**왜 정렬이 폭과 한 값인가**: 처음엔 `columns:`와 `alignments:` 두 배열이었다. 인덱스로 짝을
맞추는 API는 하나만 밀려도 **조용히 틀린 표**를 그린다 — 컴파일도 되고 크래시도 없다.
한 값으로 합치면 그 실수가 문법적으로 불가능해진다.

보장하는 것(테스트로 고정):
- `fit` 열 폭은 **전 행이 공유**한다 — 1행만 짧아도 열이 어긋나지 않는다.
- 마지막 행이 덜 차도 깨지지 않는다(빈 칸으로 남는다).
- 폭이 부족하면 `fit`을 비율로 줄여 **내용이 컨테이너를 넘지 않는다**.
- 셀 높이는 **자기 열 폭에서** 측정한다 — 좁은 열의 라벨이 2줄이 되면 행 높이가 따라 늘어난다.
- `sizeThatFits`가 보고하는 높이 == 실제 배치 하단. 어긋나면 부모가 자르거나 빈 공간을 남긴다.
- RTL에서 좌우가 뒤집힌다.

### 반응형 — 폭에 따라 축을 뒤집는다

```swift
JdAdaptiveStackView(breakpoint: JdToken.Breakpoint.sm, wideAxis: .horizontal, gap: .md) {
    leftPane
    rightPane
}
// stack.isCompact 를 읽어 부수적 스타일(정렬·폰트)을 함께 맞출 수 있다
```

폭 0(부모가 아직 폭을 주지 않은 첫 프레임)에서는 좁다고 판정하지 않는다 — 초기 1프레임
깜빡임을 막는다. 축은 **값이 실제로 바뀔 때만** 쓴다(레이아웃 루프 방지).

### SnapKit과 무엇이 같고 무엇이 다른가

SnapKit이 읽기 좋은 이유는 **스코프된 DSL**이다 — `view.snp.makeConstraints { make in … }`.
그 형태는 이 레포에 이미 있다: `view.jd.layout { $0.edges.equalToSuperview() }`. 즉 제약
DSL은 SnapKit과 같은 급이고, 새로 만들 이유가 없었다.

SnapKit이 **하지 않는** 일이 둘 있고 그게 여기서 더한 부분이다:

| | SnapKit | JunDS |
|---|---|---|
| 제약 관계 적기 | `snp.makeConstraints { }` | `jd.layout { }` (동급) |
| **트리 만들기** | 없음 — `addSubview`는 손으로 | `JdVStack { }` 빌더가 함께 한다 |
| **`addSubview` 잊음** | 런타임에 제약이 안 붙거나 크래시 | 문법적으로 불가능(빌더가 넣는다) |
| **행 간 열 정렬** | 없음 — 열마다 제약을 손으로 엮어야 | `JdColumnsView`가 폭을 공유 |
| 토큰 강제 | 없음(원시 CGFloat) | `JdGap`·`JdAlign`만 받는다 |

정리하면 **SnapKit 대신**이 아니라 **SnapKit이 비워 둔 층**이다. 제약이 필요한 비계층
관계("이 뷰를 저 뷰 오른쪽에")는 여전히 `jd.layout`을 쓴다.

### SwiftUI는 무엇을 쓰나

SwiftUI엔 이미 다 있어서 **새 타입을 만들지 않았다**(04 §10 번역 원칙):

| UIKit | SwiftUI |
|---|---|
| `JdHStack { … }` / `JdVStack { … }` | `HStack { … }` / `VStack { … }` |
| `JdFlex()` | `Spacer()` |
| `JdColumnsView(columns:)` | `Grid { GridRow { … } }` (iOS 16 — DEC-004가 전제한 하한) |
| `JdAdaptiveStackView` | `ViewThatFits { HStack { … }; VStack { … } }` |
| `JdWrapView` | `JdFlowLayout` (실컴포넌트) |

즉 **개념 어휘는 3플랫폼 공통**이고, 표현만 각 플랫폼의 관용구를 따른다.

---

## Box — 스타일 컨테이너

패딩·배경·모서리·테두리 토큰의 조합. 신규 뷰 없이 모디파이어 번들.

```swift
// SwiftUI
content
    .padding(JdGap.md.value)                 // p="md"
    .background(JdToken.Color.card.color)     // bg="card"
    .cornerRadius(JdToken.Radius.lg)          // radius="lg"
    .overlay(RoundedRectangle(cornerRadius: JdToken.Radius.lg)
        .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin)) // border

// UIKit
let box = UIView()
box.backgroundColor = JdToken.Color.card.uiColor
box.layer.cornerRadius = JdToken.Radius.lg
box.layoutMargins = UIEdgeInsets(top: JdGap.md.value, left: JdGap.md.value,
                                 bottom: JdGap.md.value, right: JdGap.md.value)
```

## Center — 양축 중앙

```swift
// SwiftUI
ZStack { content }.frame(maxWidth: .infinity, maxHeight: .infinity)   // 기본 정렬 .center
// 또는 content.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)

// UIKit — child.jd.layout { $0.center.equalToSuperview() }
```

## Flex — 방향에 따른 스택 선택

`direction`이 곧 스택 종류다. `align`은 교차축 정렬.

```swift
// SwiftUI (direction=row)
HStack(alignment: .center, spacing: JdGap.md.value) { a; b; c }   // align center
// (direction=column) → VStack(alignment: .leading/.center/.trailing, spacing:)

// UIKit → JdStackView(axis: .horizontal, gap: .md, alignment: .center, arranged: [a, b, c])
```

## HStack — 가로 스택 (기본 gap sm·center)

```swift
HStack(alignment: .center, spacing: JdGap.sm.value) { a; b; c }        // SwiftUI
JdStackView.horizontal(gap: .sm, [a, b, c])                            // UIKit
```

## VStack — 세로 스택 (기본 gap md·stretch)

```swift
// SwiftUI — ⚠️ 기본 교차축이 center라 웹 stretch를 원하면 자식에 .frame(maxWidth: .infinity)
VStack(spacing: JdGap.md.value) { rowA.frame(maxWidth: .infinity); rowB.frame(maxWidth: .infinity) }
JdStackView.vertical(gap: .md, [rowA, rowB])                           // UIKit — .fill이 곧 stretch
```

## GridLayout — 적응형 그리드

```swift
// SwiftUI — cols=N
LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: JdGap.md.value), count: n),
          spacing: JdGap.md.value) { cells }
// autoFit/minChildWidth → GridItem(.adaptive(minimum: 120), spacing: JdGap.md.value)

// UIKit (DEC-042로 갱신)
JdWrapView(itemSpacing: JdGap.md.value, equalWidths: true, minItemWidth: 120, cells)  // autoFit
JdColumnsView(columns: Array(repeating: .flexible(), count: n), columnGap: JdGap.md.value) { rows }
// 셀이 수백 개거나 재사용·프리페치가 필요하면 여전히 UICollectionViewCompositionalLayout이 맞다
```

## Page — 페이지 셸

```swift
NavigationStack {
    ScrollView {
        VStack(alignment: .leading, spacing: JdGap.lg.value) {
            // jd-page-header
            VStack(alignment: .leading, spacing: JdGap.xs.value) {
                JdHeading("제목", level: .h1)
                JdText("설명", size: .md, dimmed: true)
            }
            // jd-page-body: 섹션들
            sectionA; sectionB
        }
        .padding(JdToken.Space.s4)          // 웹 16px, regular-width 24pt
        .frame(maxWidth: 1280)               // max-width xl 프리셋
        .frame(maxWidth: .infinity)          // margin-inline auto
    }
}
```

## Section — 제목 있는 그룹

```swift
VStack(alignment: .leading, spacing: JdGap.md.value) {
    VStack(alignment: .leading, spacing: JdToken.Space.s0_5) {
        JdHeading(title, level: .h4)
        JdText(description, size: .sm, dimmed: true)
    }
    VStack(alignment: .leading, spacing: gap.value) { content }
}
.padding(JdToken.Space.s4)
// border 플래그 → radius xl2(16) + 1px stroke
.overlay(RoundedRectangle(cornerRadius: JdToken.Radius.xl2, style: .continuous)
    .stroke(JdToken.Color.border.color, lineWidth: JdToken.Border.thin))
```

---

## Stack — 방향 전환 스택 (layout)

웹 `jd-stack`은 core `jd-vstack`과 같은 기본값(column·gap md)에 `direction`만 더한 것이다.

```swift
// SwiftUI — direction=column(기본) / row
VStack(spacing: JdGap.md.value) { content }     // 또는 HStack
// UIKit — JdStackView(axis: .vertical, gap: .md, alignment: .fill, arranged: views)
```

## Grid · SimpleGrid — GridLayout 별칭 (layout)

세 태그(`jd-grid-layout`·`jd-grid`·`jd-simple-grid`)는 웹에서도 단일 구현 + 별칭이다(R12).
iOS도 같은 레시피 하나를 공유한다 — `min-child-width`/`auto-fill`/`auto-fit`은 전부 adaptive로 수렴.

```swift
// cols = N
LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: JdGap.md.value), count: n),
          spacing: JdGap.md.value) { cells }
// auto-fit / auto-fill / min-child-width = N
LazyVGrid(columns: [GridItem(.adaptive(minimum: n), spacing: JdGap.md.value)],
          spacing: JdGap.md.value) { cells }
```

## Container — 최대폭 + 중앙 정렬 (layout)

```swift
// size 프리셋은 Core가 값의 정본: JdContainerSize.lg.maxWidth == 1024 (full == nil)
content
    .frame(maxWidth: JdContainerSize.lg.maxWidth)                 // 상한
    .frame(maxWidth: .infinity, alignment: noCenter ? .leading : .center)  // margin-inline auto
    .padding(.horizontal, JdToken.Space.s4)                       // 웹 16pt(≥640에서 24pt)
```

iPhone 세로에서는 화면 폭이 프리셋보다 좁아 사실상 패딩만 관측된다 — iPad·분할 화면에서 의미가 산다.

## Overlay — 덮개 (layout)

```swift
base.overlay(alignment: noCenter ? .topLeading : .center) {
    content
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.ultraThinMaterial)      // 웹 backdrop-filter: blur(4px) 등가
}
// blur 없이 딤만 필요하면 .background(JdToken.Color.foreground.color.opacity(0.5))
```

## AspectRatioBox — 비율 상자 (layout)

```swift
content
    .aspectRatio(16.0 / 9.0, contentMode: .fill)   // 웹 기본 16/9
    .clipped()                                      // 웹 overflow:hidden
// UIKit: child.jd.layout { $0.width.equal(to: child.jd.height).multiplier(16.0/9.0) }
```

## Wrap · LayoutDivider — 기구현 별칭 (layout)

`Wrap` = `jd-group`과 표면 동형 → SwiftUI `JdFlowLayout`, UIKit **`JdWrapView`**.
`LayoutDivider` = `jd-divider`와 동일 → `JdDivider` / `JdDividerView`를 그대로 쓴다. 신규 타입 없음.

```swift
// SwiftUI — Layout 프로토콜
JdFlowLayout(spacing: JdGap.sm.value) { chips }

// UIKit — 줄바꿈 컨테이너 (DEC-041에서 신설)
let wrap = JdWrapView(itemSpacing: JdGap.sm.value, chips)          // 고유 폭 흐름(칩·태그)
let grid = JdWrapView(itemSpacing: JdGap.sm.value,
                      equalWidths: true, minItemWidth: 132, cells)  // 균등 분할 격자(KPI 셀)
grid.maxPerLine = 2                                                 // 2×2로 고정하고 싶을 때
```

**갱신 (2026-07-27, DEC-041)**: UIKit의 줄바꿈 공백이 메워졌다. 이전에는 `UIStackView`가
줄바꿈을 못 해서 `JdStackView.horizontal` no-wrap 폴백이었고, 격자는 아래 GridLayout 항목처럼
소비자가 `UICollectionViewCompositionalLayout`을 직접 세워야 했다 — 웹에서 한 줄이던 배치가
iOS에서는 컬렉션 뷰 한 채가 되는 비대칭이었다. `JdWrapView`는 frame 배치로 흘리고
`sizeThatFits`/`intrinsicContentSize`로 높이를 정확히 보고해 부모 Auto Layout에 정상 참여한다.

**언제 컬렉션 뷰가 여전히 맞나**: 셀이 수백 개거나 재사용·프리페치가 필요하면
`UICollectionView`가 맞다. `JdWrapView`는 **개수가 화면에 들어오는 규모**(칩 묶음, KPI 4~8칸)를
전제로 재사용 없이 전부 배치한다. `JdMicroKpiRowView`가 이 뷰를 쓰는 이유이기도 하다.

---

primitives 배치(DESIGN-3)의 "컴포넌트 없음" 판정 6종. 시스템 API가 이미 하는 일을 새 타입으로
감싸지 않는다(04 §10 번역 원칙) — 라이브러리에 타입이 없고 아래 조립법이 전부다.
`AspectRatio`는 별칭이라 위 `AspectRatioBox` 레시피를 그대로 쓴다.

## VisuallyHidden — AT 전용 텍스트 (primitives)

웹 `.jd-visually-hidden`(1px로 잘라 화면 밖에 두는 클래스)의 대응물은 새 뷰가 아니라 **접근성 모디파이어**다.
시각 표현은 그대로 두고 AT가 읽는 문자열만 갈아끼운다.

```swift
// SwiftUI — 실뷰에 라벨을 싣는 것이 1순위
JdText("42", size: .lg)
    .accessibilityLabel(Text("읽지 않은 알림"))
    .accessibilityValue(Text("42개"))
    .accessibilityHint(Text("두 번 탭하면 알림함이 열립니다"))

// 시각 요소 없이 AT 전용 문구가 정말 필요할 때만 — 0×0 뷰
Color.clear
    .frame(width: 0, height: 0)
    .accessibilityElement()
    .accessibilityLabel(Text("정렬 기준: 날짜 내림차순"))

// UIKit
label.isAccessibilityElement = true
label.accessibilityLabel = "읽지 않은 알림"
label.accessibilityValue = "42개"
```

⚠️ `.hidden()` · `isHidden = true` · `alpha = 0`은 대체재가 아니다 — 셋 다 접근성 트리에서도 요소를
제거한다(웹 `display: none` 함정과 동형). 남는 길은 크기를 0으로 줄이는 쪽뿐이고, 0×0 요소는 VoiceOver
스와이프 순서에만 걸리므로 남용하지 않는다.

## AnnouncerProvider — 라이브 리전 (primitives)

뷰 없음. 화면 변화 없이 일어난 사건을 AT에 알리는 함수 하나가 전부다(Core 기구현).

```swift
JdAnnouncer.announce("복사됨")                             // 기본 polite
JdAnnouncer.announce("업로드 실패", priority: .assertive)   // 진행 중 발화를 끊고 즉시
```

웹은 polite/assertive 두 라이브 리전 노드를 DOM에 심고 비운 뒤 다음 프레임에 다시 채워 같은 문구를
재낭독시키지만, iOS는 OS가 라이브 리전을 소유하고 동일 문자열도 매번 다시 읽는다 — 그 해킹은
이식하지 않는다(내부적으로 polite → `.announcement`, assertive → `.screenChanged`).

## NumberFormatter — 숫자 표기 (primitives)

뷰 없음. 웹은 값을 그리는 태그지만 iOS에선 문자열 함수 하나면 끝나고, 결과를 `JdText`에 넘긴다.

```swift
JdNumberFormat.string(value: 1234.5)                               // "1,234.5"
JdNumberFormat.string(value: 12000, style: .currency)              // "₩12,000" (KRW 기본)
JdNumberFormat.string(value: 1234.5, style: .currency,
                      currency: "USD", locale: "en-US")            // "$1,234.50"
JdNumberFormat.string(value: 0.153, style: .percent, decimals: 1)  // ×100 → "15.3%"
JdNumberFormat.string(value: 12_800, style: .compact)              // "1.3만"
JdNumberFormat.compactCount(1_200)                                 // "1.2천"

JdText(JdNumberFormat.string(value: total, style: .currency), size: .lg, mono: true)
```

Foundation의 `.compactName`은 "1K"/"1M"이라 웹 문자열(천·만·억)과 어긋난다 — 축약은 반드시 Core의
`style: .compact` / `compactCount`를 거치고, 렌더 계층에서 `NumberFormatter`를 새로 만들지 않는다.

## ScrollArea — 스크롤 컨테이너 (primitives)

`ScrollView` 그 자체다. 웹이 노출하던 축·최대 높이 두 축이 그대로 대응한다.

```swift
// SwiftUI
ScrollView(.vertical) {
    VStack(alignment: .leading, spacing: JdGap.sm.value) { rows }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(JdGap.md.value)
}
.frame(maxHeight: 240)                       // 웹 max-height
.clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))

// orientation="horizontal"
ScrollView(.horizontal) { HStack(spacing: JdGap.sm.value) { chips } }
    .scrollIndicators(.hidden)               // iOS 16+

// UIKit
let scroll = UIScrollView()
scroll.alwaysBounceVertical = true
scroll.showsHorizontalScrollIndicator = false
```

웹 ScrollArea가 얹던 커스텀 스크롤바 CSS(폭·thumb 색·hover 확대)는 이식 대상이 아니다 — iOS 인디케이터는
이미 얇고 자동으로 사라지며, 두께·색을 바꾸는 공개 API도 `indicatorStyle`(default/black/white)뿐이다.

## Icon — SF Symbols (primitives)

아이콘은 SF Symbols 하나로 수렴한다(서드파티 0). 변 길이는 `JdIconSize.side`, 색은 `JdToken`.

```swift
// SwiftUI — SF Symbol의 크기는 폰트에 실린다
Image(systemName: "star.fill")
    .font(.system(size: JdIconSize.md.side))          // md = 20
    .foregroundColor(JdToken.Color.primary.color)
    .accessibilityHidden(true)                        // 장식 아이콘은 AT에서 제거

// 본문과 함께 자라야 하면 변을 스케일한다 (View 프로퍼티로)
@ScaledMetric(relativeTo: .body) private var iconSide: CGFloat = JdIconSize.md.side

// UIKit
let config = UIImage.SymbolConfiguration(
    pointSize: UIFontMetrics(forTextStyle: .body)
        .scaledValue(for: JdIconSize.md.side, compatibleWith: traitCollection),
    weight: .medium)
let iconView = UIImageView(image: UIImage(systemName: "star.fill", withConfiguration: config))
iconView.tintColor = JdToken.Color.primary.uiColor
iconView.isAccessibilityElement = false
```

`JdIconSize.side`는 웹 SVG 박스의 변이고 SF Symbol의 `pointSize`는 글리프 기준이라 실제 박스가 정확히
같지는 않다 — 그리드 정렬이 필요하면 `.frame(width:height:)`로 박스를 고정한다. 버튼 안 아이콘은 이 램프가
아니라 `JdIconButtonSpec.iconSize`(버튼 변의 0.5배)를 따른다. `JdIconSize`는 단독 아이콘용이다.

## Image — 원격 이미지 (primitives)

웹 `jd-image`의 `status`(loading/loaded/error) 3상태가 `AsyncImage`의 `phase`와 1:1이다 — 상태 기계를
다시 짜지 않는다.

```swift
AsyncImage(url: url) { phase in
    switch phase {
    case .empty:                                   // 웹 status="loading"
        JdSpinner(size: .sm)
            .frame(maxWidth: .infinity, minHeight: 120)
            .background(JdToken.Color.cardHover.color)
    case .success(let image):                      // status="loaded"
        image.resizable()
            .aspectRatio(contentMode: .fill)       // JdImageFit.cover (.fit = contain)
    case .failure:                                 // status="error" — 폴백
        Image(systemName: "photo")
            .font(.system(size: JdIconSize.lg.side))
            .foregroundColor(JdToken.Color.mutedLight.color)
            .frame(maxWidth: .infinity, minHeight: 120)
            .background(JdToken.Color.cardHover.color)
    @unknown default:
        EmptyView()
    }
}
.frame(height: 160)
.clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))  // 웹 radius
.accessibilityLabel(Text(alt))    // 의미 있는 이미지만. 장식이면 .accessibilityHidden(true)

// UIKit — 로딩은 URLSession, 표시는 UIImageView
let imageView = UIImageView()
imageView.contentMode = .scaleAspectFill    // cover (.scaleAspectFit = contain, .scaleToFill = fill)
imageView.clipsToBounds = true
imageView.layer.cornerRadius = JdToken.Radius.lg
imageView.backgroundColor = JdToken.Color.cardHover.uiColor

URLSession.shared.dataTask(with: url) { data, _, _ in
    let loaded = data.flatMap(UIImage.init(data:))
    DispatchQueue.main.async {
        imageView.image = loaded ?? UIImage(systemName: "photo")   // 에러 폴백
    }
}.resume()
```

`JdImageFit.fill`(비율 무시)만 `contentMode` 대응이 없다 — `.resizable()` + 고정 `frame`이 그 자리다.
`AsyncImage`는 `URLSession` 공유 캐시에만 기대므로 긴 목록의 재사용 캐싱은 소비자 몫이다(서드파티 0
규칙상 이미지 캐시 라이브러리는 도입하지 않는다).

---

# Behaviors (웹 hooks → iOS)

웹의 hooks는 v3에서 Behavior(`createXxx(el, opts)`)가 됐고, iOS에서는 **셋 중 하나로 수렴한다**
(00-inventory §4 iOS 매핑, 04 §4):

- **Core 순수 유틸** — 계산·판정이 코드의 전부인 것. `JdBehaviors.swift`에 실체가 있다.
- **시스템 API/환경값 레시피** — SwiftUI @Environment·Combine·시스템 API가 이미 하는 일. 아래 조립법.
- **N/a** — 웹/React 렌더 모델 전용이라 iOS에 개념이 없는 것.

라이브러리에 hook용 새 View/타입을 만들지 않는다 — 시스템이 하는 일을 감싸면 유지 비용만 남는다(04 §10).

## Core 유틸 (JdBehaviors.swift — 실체 있음)

| hook | Core | 비고 |
|---|---|---|
| useDebounce | `JdDebouncer(delay:)` | 명령형 호출부용. 선언형은 Combine `.debounce` |
| useThrottle | `JdThrottler(interval:)` | 선행 즉시 + 후행 1회(웹 알고리즘) |
| useCountUp | `JdCountUp.easeOutExpo/value` | 이징은 순수 함수, 구동은 `TimelineView`/`CADisplayLink` |
| useForm | `JdForm.firstViolation/isValid` + `JdFieldRule` | 검증 규칙 판정. 폼 상태는 `@State`/Observable |
| useHotkeys · useKeyboardShortcut | `JdHotkey.normalize` | 정규화만 Core, 실제 처리는 `UIKeyCommand`/`.onKeyPress` |
| useReadingProgress | `JdScrollProgress.reading` | 오프셋→진행률. 구동은 스크롤 델리게이트 |
| useScrollSpy | `JdScrollProgress.activeSection` | 오프셋→활성 섹션 인덱스 |
| useImagePreload | `JdPreload.batches` | 동시성 배치 계획. 로딩은 `URLSession` |
| useInfiniteFeed | `JdInfiniteFeedGate` | 중복 로드 가드. 목록 상태는 데이터 계층 |
| useBreakpointValue | `JdBreakpointValue.resolve` | 폭→값 해석 |

```swift
// useDebounce — 검색어를 300ms 지연
let debouncer = JdDebouncer(delay: 0.3)
func onQueryChange(_ q: String) { debouncer.call { runSearch(q) } }

// useCountUp — 0→1234를 이징으로 (TimelineView 구동)
TimelineView(.animation) { ctx in
    let t = min(elapsed(ctx.date) / duration, 1)
    Text("\(Int(JdCountUp.value(from: 0, to: 1234, progress: t)))")
}

// useForm — 필드 검증
let rules: [JdFieldRule] = [.required, .email]
if let violation = JdForm.firstViolation(email, rules: rules) {
    errorText = violation.message(label: "이메일")
}
```

## 시스템 API / 환경값 레시피 (라이브러리 타입 없음)

| hook | iOS 대응 |
|---|---|
| useMediaQuery · useBreakpoint | `@Environment(\.horizontalSizeClass)` / `UITraitCollection.horizontalSizeClass` |
| usePrefersColorScheme | `@Environment(\.colorScheme)` |
| useReducedMotion | `@Environment(\.accessibilityReduceMotion)` / `UIAccessibility.isReduceMotionEnabled` (Core `JdMotion`) |
| useWindowSize · useElementSize · useResizeObserver | `GeometryReader` / `viewDidLayoutSubviews` |
| useWindowScroll · useScrollSpy(구동) | `ScrollView` + `.onScrollGeometryChange`(iOS 18) 또는 `scrollViewDidScroll` |
| useNetworkStatus | `NWPathMonitor` (Network 프레임워크) |
| useLocalStorage · useSessionStorage | `@AppStorage` / `UserDefaults` (세션은 인메모리 캐시) |
| useCookie | `HTTPCookieStorage.shared` |
| useClipboard · useCopyToClipboard | `UIPasteboard.general` (복사 컴포넌트는 `JdCopyButton`) |
| useInterval · useTimeout | `Timer` / `Task.sleep` / `DispatchQueue.asyncAfter` |
| useAnimationFrame | `CADisplayLink` / `TimelineView(.animation)` |
| useLongPress | `.onLongPressGesture` / `UILongPressGestureRecognizer` |
| useHover | `.onHover` / `UIHoverGestureRecognizer` (iPad 포인터) |
| useKeyboard | `.onKeyPress` / `UIKeyCommand` |
| useEventListener | `NotificationCenter` / target-action |
| useIntersectionObserver | `.onAppear` / `UICollectionView willDisplay` |
| useGeolocation | `CLLocationManager` |
| useFullscreen | `.fullScreenCover` / `present(_:animated:)` |
| useDocumentTitle | `navigationItem.title` / `.navigationTitle` |
| useIdle | 사용자 이벤트 타임스탬프 + `Timer` (커스텀) |
| usePanelResize | `DragGesture` / 팬 제스처 + `setNeedsLayout` |
| useFocusMode | 커스텀 몰입 상태(+`UserDefaults` 저장) |
| useNetworkStatus | `NWPathMonitor` |
| useResource | actor 기반 캐시 레이어(서드파티 0 — SWR류 미도입) |
| useMutation | `Task` + `async/await`, 결과는 `Result` |
| useScrollLock | `scrollView.isScrollEnabled = false` (시트가 시스템 스크롤락을 이미 처리) |

```swift
// useMediaQuery / useBreakpoint — 폭이 아니라 사이즈 클래스가 판단 근거(04 §10)
@Environment(\.horizontalSizeClass) private var sizeClass
var isCompact: Bool { sizeClass == .compact }

// useLocalStorage — @AppStorage가 UserDefaults 구독까지 해준다
@AppStorage("jd.theme") private var theme = "system"

// useReducedMotion — Core 단일 진입점
withAnimation(JdMotion.duration(0.3) == 0 ? nil : .easeOut) { … }
```

## N/a (iOS에 개념 없음)

| hook | 이유 |
|---|---|
| useClickOutside | 시트·팝오버·메뉴가 바깥 탭을 시스템 dismiss로 처리 |
| useFocusTrap | `accessibilityViewIsModal` + 시스템 프레젠테이션이 포커스 격리 |
| useFocusVisible | iOS엔 포커스 링 개념이 없다(키보드 포커스는 시스템 소관) |
| useFavicon | 웹 전용 |
| useMounted · usePrevious · useSteps · useToggle · useDisclosure · useAsync · useOptimisticState · useIsomorphicLayoutEffect · useUpdateEffect | React 렌더 수명/상태 훅 — SwiftUI `@State`/Observable로 자연 내부화, 별도 타입 불요 |

이 판정들은 ledger의 `ios` 칼럼에 그대로 반영된다(Core 유틸·레시피 = done, 웹/React 전용 = n/a).
