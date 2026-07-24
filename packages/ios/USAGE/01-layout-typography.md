# JunDS iOS — 사용법 01: 레이아웃 · 타이포

레이아웃·타이포 계열 컴포넌트의 **SwiftUI · UIKit 사용법**. 각 코드 예는 실제 소스의 public
init 시그니처와 1:1 대응한다. 레이아웃 컨테이너(Box·Flex·Grid 등)의 조립 레시피는 중복하지
않는다 — [RECIPES.md](../RECIPES.md) 참조.

다루는 컴포넌트: **JdText** · **JdHeading** · **JdDivider** · **JdStackView**(UIKit 전용) ·
**JdFlowLayout**(SwiftUI 전용) · **JdSpacer** · **JdAppShell** · **`.jdShow` / `.jdHide`**(SwiftUI 전용).

```swift
import JunDS   // 이 한 줄로 Core + UIKit + SwiftUI 전부. 아래 모든 예가 이 import를 전제한다.
```

공통 규약(토큰·Dynamic Type·다크 모드·Reduce Motion)은 상위 [USAGE.md](../USAGE.md) 참조.
색·치수는 언제나 토큰으로: `JdToken.Color.primary.color`(SwiftUI) / `.uiColor`(UIKit),
`JdGap.md.value`(=16), `JdToken.Space.s4`(=16). 리터럴 금지.

---

## JdText

본문 텍스트를 그린다. 웹 `jd-text` 동형. (SwiftUI `JdText` / UIKit `JdTextView` — UILabel 서브클래스, **UITextView 아님**.)

**SwiftUI**

```swift
JdText("본문 텍스트입니다.")                                       // size .md · weight 400
JdText("굵은 캡션", size: .sm, weight: JdToken.FontWeight.semibold) // 크기·굵기 변형
JdText("코드 값 0x5B4CC7", mono: true)                             // 모노스페이스 패밀리
JdText("긴 문장을 두 줄까지만…", dimmed: true, lineLimit: 2)        // muted 색 + 말줄임
```

**UIKit**

```swift
let label = JdTextView("본문 텍스트입니다.", size: .md)
label.dimmed = true              // muted 색으로 전환 (프로퍼티 didSet가 재스타일)
label.mono = true                // 모노스페이스 패밀리로 전환
label.textSize = .lg             // ⚠️ 크기 프로퍼티명은 textSize (UILabel의 size와 충돌 회피)

// jd.layout DSL로 배치 — 좌우 md 인셋, 상단 정렬
container.addSubview(label)
label.jd.layout {
    $0.leading.trailing.equalToSuperview().inset(JdGap.md.value)
    $0.top.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| (첫 인자) | `String` | — | 표시 문자열 |
| `size` | `JdTextSize` | `.md` | 폰트 크기 사다리 (pt): 2xs=10 · xs=12 · sm=14 · md=16 · lg=18 · xl=20 · 2xl=24 · 3xl=30 · 4xl=36 |
| `weight` | `CGFloat` | `JdToken.FontWeight.normal` (400) | 굵기 — `JdToken.FontWeight` 축(400/500/600/700) |
| `dimmed` | `Bool` | `false` | `true`면 `JdToken.Color.muted`, 기본은 `.foreground` |
| `mono` | `Bool` | `false` | 모노스페이스 패밀리 |
| `lineLimit` | `Int?` | `nil` | 최대 행 수, 초과분은 말줄임(tail). **SwiftUI 전용** |

특이사항: Dynamic Type 자동 스케일(UIKit은 `adjustsFontForContentSizeCategory` 내장). UIKit엔
`lineLimit` 파라미터가 없다 — 기본 `numberOfLines = 0`(다행)이고 소비자가 `label.numberOfLines`로 조절한다.
UIKit의 `weight`는 init 전용(런타임 세터 없음), `textSize`·`dimmed`·`mono`만 가변이다.

---

## JdHeading

제목을 그린다. 레벨 램프(h1~h6)는 `JdHeadingSpec` 단일 소스. 웹 `jd-heading` 동형. (SwiftUI `JdHeading` / UIKit `JdHeadingView` — UILabel 서브클래스.)

**SwiftUI**

```swift
JdHeading("페이지 제목", level: .h1)                     // 24pt bold
JdHeading("섹션 제목")                                   // 기본 level .h2 (20pt bold)
JdHeading("한 줄로 자르는 제목", level: .h3, truncate: true)
```

**UIKit**

```swift
let heading = JdHeadingView("페이지 제목", level: .h1)
heading.level = .h2              // 레벨 변경 → 램프 재적용 (didSet)
heading.text = "새 제목"          // 세터를 가로채 원문 보존 + 재스타일 (VoiceOver는 원문으로 읽음)

container.addSubview(heading)
heading.jd.layout {
    $0.top.leading.trailing.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| (첫 인자) | `String` | — | 표시 문자열 |
| `level` | `JdHeadingLevel` | `.h2` | 레벨 램프: h1 24 bold · h2 20 bold · h3 20 semibold · h4 18 semibold · h5 16 semibold · h6 14 semibold+대문자 |
| `truncate` | `Bool` | `false` | `true`면 단일 행 말줄임. **SwiftUI 전용** |

특이사항: 접근성 heading 트레이트 + 레벨을 부여해 VoiceOver 로터로 탐색된다. L6는 **표시만** 대문자화이며
VoiceOver는 원문으로 읽는다(웹 `text-transform` 동형). UIKit엔 `truncate` 파라미터가 없다 —
`heading.numberOfLines = 1`로 대신한다.

---

## JdDivider

1pt 구분선. 라벨을 주면 `선—라벨—선`. 웹 `jd-divider` 동형. (SwiftUI `JdDivider` / UIKit `JdDividerView` — UIView 서브클래스.)

**SwiftUI**

```swift
JdDivider()                                   // 가로 1pt 선 (부모 폭만큼 stretch)
JdDivider(label: "또는")                        // 선—라벨—선 (라벨 = muted)
JdDivider(orientation: .vertical)             // 세로 선 — 부모가 높이를 줘야 보인다
```

**UIKit**

```swift
let divider = JdDividerView()                 // 가로 선
divider.label = "또는"                          // 런타임에 라벨 부여 → line—label—line 재구성

container.addSubview(divider)
divider.jd.layout {
    // 두께(1pt)는 intrinsicContentSize가 고정 — 길이·위치만 제약한다
    $0.leading.trailing.equalToSuperview().inset(JdGap.md.value)
    $0.centerY.equalToSuperview()
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `orientation` | `JdOrientation` | `.horizontal` | `.horizontal` / `.vertical` |
| `label` | `String?` | `nil` | 있으면 `선—라벨—선`(라벨 muted), 없으면 순수 선 |

특이사항: 두께는 `JdToken.Border.thin`(1pt) 고정, 길이는 소비자 제약 몫(웹의 `margin-block 16px`은
이식하지 않음 — 간격은 스택 spacing으로). 라벨이 없으면 접근성 트리에서 제외(장식), 있으면 그 텍스트만
노출한다. 세로 방향은 부모가 교차축 길이(높이)를 반드시 줘야 한다.

---

## JdStackView

`UIStackView` 박판 래퍼 — `spacing`을 `JdGap`으로만 받아 원시 CGFloat 하드코딩을 차단한다.
**UIKit 전용**(SwiftUI 스택은 `HStack`/`VStack` 관용구 — [RECIPES.md](../RECIPES.md) 참조).

**UIKit**

```swift
// 세로 스택 — 기본 gap md(16) · align .fill(=웹 stretch)
let column = JdStackView.vertical(gap: .md, [rowA, rowB, rowC])

// 가로 스택 — 기본 gap sm(8) · align .center
let row = JdStackView.horizontal(gap: .sm, [iconView, titleLabel])

// 전체 지정 init
let bar = JdStackView(axis: .horizontal,
                      gap: .lg,
                      alignment: .center,
                      distribution: .equalSpacing,
                      arranged: [leadingView, spacer, trailingView])
bar.gap = .xl                    // 런타임 간격 변경 → spacing 자동 환산 (didSet)
bar.backgroundColor = JdToken.Color.card.uiColor

view.addSubview(column)
column.jd.layout {
    $0.top.leading.trailing.equalToSuperview().inset(JdGap.md.value)
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `axis` | `NSLayoutConstraint.Axis` | `.vertical` | 주축 방향 |
| `gap` | `JdGap` | `.md` (16) | 아이템 간격 → `spacing`으로 환산 |
| `alignment` | `UIStackView.Alignment` | `.fill` | 교차축 정렬 (`.fill` = 웹 stretch) |
| `distribution` | `UIStackView.Distribution` | `.fill` | 주축 분배 |
| `arranged` | `[UIView]` | `[]` | 초기 자식 뷰 |

팩토리: `.horizontal(gap: .sm, alignment: .center, [뷰])` · `.vertical(gap: .md, [뷰])` — 각각 웹
`jd-hstack`/`jd-vstack` 기본값 동형.

특이사항: 토큰 밖 간격이 꼭 필요하면 `gap: .custom(JdToken.Space.s3)`(=12)로 명시한다(grep 가능한 탈출구).
줄바꿈(wrap)은 `UIStackView` 한계로 미지원 — 흐름 배치는 SwiftUI `JdFlowLayout`을 쓴다.

---

## JdFlowLayout

좌→우로 흐르다 폭을 넘치면 다음 행으로 감싸는 레이아웃(웹 `jd-group` wrap 번역). 행 안에서는 세로 중앙 정렬.
**SwiftUI 전용**(iOS 16+ `Layout` 프로토콜).

**SwiftUI**

```swift
// 태그 무리 — 넘치면 자동 줄바꿈
JdFlowLayout(spacing: JdToken.Space.s2) {
    ForEach(tags, id: \.self) { tag in
        JdText(tag, size: .sm)
    }
}

// 행 내 간격과 행 사이 간격을 분리
JdFlowLayout(spacing: JdGap.sm.value, rowSpacing: JdGap.md.value) {
    chipA
    chipB
    chipC
}
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `spacing` | `CGFloat` | `JdToken.Space.s2` (8) | 행 안 아이템 간격 |
| `rowSpacing` | `CGFloat?` | `nil` | 행 사이 간격, 미지정 시 `spacing`과 동일(웹 단일 gap 동형) |

특이사항: RTL은 `Layout`이 자동 반전 처리한다(leading 기준 배치). UIKit엔 대응 컴포넌트가 없다 —
`JdStackView`는 no-wrap이므로 줄바꿈이 필요하면 SwiftUI를 쓰거나 소비자가 직접 흐름을 계산한다.

---

## JdSpacer

토큰 간격만큼 자리를 차지하는 **고정 크기** 스페이서(웹 `jd-spacer` 동형). SwiftUI의 탐욕적 `Spacer()`가 아니다.
(SwiftUI `JdSpacer` / UIKit `JdSpacerView` — UIView 서브클래스.)

**SwiftUI**

```swift
VStack(spacing: 0) {
    JdHeading("제목")
    JdSpacer(.lg)                    // 세로 lg(24) → 실제 48pt
    JdText("본문")
}

JdSpacer()                           // 기본 세로 md(16) → 실제 32pt
JdSpacer(.sm, axis: .horizontal)     // 가로 sm(8) → 실제 16pt
```

**UIKit**

```swift
let spacer = JdSpacerView(.md)       // 세로, intrinsic 높이 32 (=2×16)
spacer.size = .lg                    // 런타임 변경 → intrinsic 무효화 후 재계산 (didSet)

stack.addArrangedSubview(headerView)
stack.addArrangedSubview(spacer)     // 스택 아이템 사이 고정 간격
stack.addArrangedSubview(bodyView)
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| (첫 인자) | `JdGap` | `.md` (16) | 간격 크기 — **실제 차지 공간은 이 값의 2배** |
| `axis` | `JdSpacerAxis` | `.vertical` | `.vertical` / `.horizontal` |

특이사항: ⚠️ 실제 길이 = `size`의 **2배**다(웹의 양측 패딩 `padding-block`/`padding-inline` 합을 승계 —
md → 32pt). 순수 장식이라 접근성 트리에서 제외된다. 교차축은 0(SwiftUI)/미지정(UIKit)이라 부모 폭을 부풀리지 않는다.

---

## JdAppShell

사이드바 레일 + 본문 골격(웹 `jd-app-shell` 동형). compact 폭(< md 768, **컨테이너 폭 기준**)에서는
레일 대신 오버레이 드로어 + 딤 배경이 되고 딤을 탭하면 닫힌다. (SwiftUI `JdAppShell` / UIKit `JdAppShellController`.)

**SwiftUI** — 슬롯 4종(sidebar·header·content·footer) + `collapsed`/`compactOpen` 바인딩:

```swift
struct RootView: View {
    @State private var collapsed = false
    @State private var compactOpen = false

    var body: some View {
        JdAppShell(collapsed: $collapsed, compactOpen: $compactOpen) {
            SidebarView()                                  // sidebar 슬롯
        } header: {
            HeaderView(onMenu: { compactOpen = true })     // compact 진입 메뉴는 소비자 몫
        } content: {
            ContentView()
        } footer: {
            EmptyView()                                    // 슬롯 생략 = EmptyView() 전달
        }
    }
}

// 폭 변형
JdAppShell(sidebarWidth: 320, collapsedWidth: JdToken.Space.s16,   // 64
           collapsed: $collapsed, compactOpen: $compactOpen) { /* … 4슬롯 … */ }
```

**UIKit** — sidebar·content 두 VC + 프로퍼티 제어:

```swift
let shell = JdAppShellController(sidebar: sidebarVC, content: contentVC)
shell.sidebarWidth = 260
shell.collapsedWidth = JdToken.Space.s16     // 64
shell.isCollapsed = true                     // 레일 접기 (애니메이션 전환)
shell.isCompactOpen = true                   // compact 폭에서 드로어 열기 (regular 복귀 시 자동 닫힘)
```

| 파라미터/프로퍼티 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `sidebarWidth` | `CGFloat` | `260` | 펼친 레일 폭 |
| `collapsedWidth` | `CGFloat` | `64` (`JdToken.Space.s16`) | 접힌 레일 폭 |
| `collapsed` / `isCollapsed` | `Binding<Bool>` / `Bool` | `false` | 레일 접힘 상태 |
| `compactOpen` / `isCompactOpen` | `Binding<Bool>` / `Bool` | `false` | compact 드로어 개폐 |
| `sidebar`·`header`·`content`·`footer` | `@ViewBuilder` | — | SwiftUI 슬롯(생략 시 `EmptyView()`) |
| `sidebar`·`content` | `UIViewController` | — | UIKit init 인자(자식 VC 컨테인먼트) |

특이사항: ⚠️ **웹/SwiftUI는 header·footer 슬롯이 있지만 UIKit `JdAppShellController`는 sidebar+content 2열만** —
헤더/푸터는 content VC 내부에서 구성한다. compact 판정 기준은 화면이 아니라 컨테이너 폭이라 분할 화면·팝오버에서도
일관하다. 웹 `⌘+B` 단축키는 iOS 표면에서 제외됐고 `collapsed`/`compactOpen`으로 소비자가 제어한다. 딤 배경은
접근성상 "사이드바 닫기" 버튼으로 노출되고, 레일 전환은 Reduce Motion을 존중한다.

---

## `.jdShow` / `.jdHide`

브레이크포인트 조건으로 뷰를 표시/숨김하는 모디파이어(웹 `jd-show`/`jd-hide` 동형). **SwiftUI 전용**.
판정 기준은 뷰포트가 아니라 **컨테이너(배치 맥락) 폭**이다.

**SwiftUI**

```swift
sidebar.jdShow(above: .md)                    // md(768) 이상에서만 표시 (모바일 폭에서 숨김)
compactNav.jdShow(below: .lg)                 // lg(1024) 미만에서만 표시
tabletOnly.jdShow(above: .md, below: .lg)     // md 이상 AND lg 미만 (태블릿 구간만)

mobileHint.jdHide(above: .lg)                 // lg 이상이면 숨김 (데스크톱 폭에서 제거)
```

| 파라미터 | 타입 | 기본값 | 의미 |
|---|---|---|---|
| `above` | `JdBreakpoint?` | `nil` | 이 브레이크포인트 폭 **이상**(≥) 조건 |
| `below` | `JdBreakpoint?` | `nil` | 이 브레이크포인트 폭 **미만**(<) 조건 |

`JdBreakpoint`: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.

특이사항: `jdShow`는 `above`(≥) **AND** `below`(<) 결합으로 가시. `jdHide`는 두 숨김 규칙의 **OR**이라
`jdShow`의 단순 부정이 아니다(웹 CSS가 attribute별 독립 규칙을 합성하는 것과 동형). 숨김은 계층에서 제거하는
`display:none` 등가(자리 0×0). 판정은 Core `JdBreakpoint.isVisible(width:above:below:)` 단일 소스가 담당하며,
초기 미측정 상태는 "보임"이 기본값이라 첫 렌더 깜빡임이 없다.
