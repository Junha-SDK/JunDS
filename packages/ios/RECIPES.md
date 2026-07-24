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
