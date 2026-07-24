# JunDS iOS — 레시피 (레이아웃 컴포넌트)

04 §10.1 원칙: 웹의 core/layout 컨테이너 중 **iOS 관용구가 이미 있는 것**은 신규 타입을 만들지
않고 조립 레시피로 제공한다. 아래 8종은 라이브러리 컴포넌트가 아니라 SwiftUI/UIKit 관용구 +
JunDS 토큰(JdGap·JdToken)의 조합이다. 쇼룸의 각 데모 스테이지가 이 레시피와 1:1 대응한다.

실컴포넌트로 존재하는 것(레시피 아님): `JdText`/`JdTextView`, `JdHeading`/`JdHeadingView`,
`JdDivider`/`JdDividerView`, `JdStackView`(UIKit HStack/VStack/Group 흡수), `JdFlowLayout`(SwiftUI Group wrap).

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

// UIKit → UICollectionViewCompositionalLayout (S급 강등 — 04 §10.1 리스트/스크롤 헬퍼)
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

`Wrap` = `jd-group`과 표면 동형 → SwiftUI `JdFlowLayout`, UIKit `JdStackView.horizontal`(no-wrap 폴백).
`LayoutDivider` = `jd-divider`와 동일 → `JdDivider` / `JdDividerView`를 그대로 쓴다. 신규 타입 없음.

---

주: Group의 줄바꿈(wrap)은 UIKit `UIStackView`가 지원하지 않아 SwiftUI `JdFlowLayout`(실컴포넌트)이
전담하고, UIKit은 `JdStackView.horizontal` no-wrap 폴백이다(04 §10.1). 이 한계는 데모 UIKit 탭에
각주로 표기된다.
