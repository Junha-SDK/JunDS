# JunDS iOS — 대기열 31종 API 계약 (layout 12 + primitives 19), 2026-07-24

**Core 계층은 이미 작성돼 있고 그것이 값의 정본이다.** 구현 전 반드시 읽을 것:

- `packages/ios/Sources/JunDSCore/JdPrimitiveOptions.swift` — 전 옵션 열거형(rawValue = 웹 attribute)
- `packages/ios/Sources/JunDSCore/Specs/JdControlSpecs.swift` — 폼 컨트롤 스펙 + `JdRangeState`
- `packages/ios/Sources/JunDSCore/Specs/JdDisplaySpecs.swift` — 표시 계열 스펙
- 기존 정본 패턴: `JdText.swift`(SwiftUI) · `JdTextView.swift`(UIKit) · `JdStackView.swift`

렌더 계층은 **스펙이 준 숫자·색만 그린다**(04 §4.2 규칙 2: 계층 파일의 동사는 이벤트 수집 →
Core 호출 → 그리기 3개뿐). 스펙에 없는 값이 필요하면 하드코딩하지 말고 notes에 보고하라.

공통 규칙(1차 배치와 동일): 서드파티 0 · JunDSSwiftUI↔JunDSUIKit 상호 import 금지(DEC-010) ·
색·치수는 스펙/JdToken/JdGap만 · Dynamic Type은 `JdFontBridge.scaledFont(…, compatibleWith:
traitCollection)`(UIKit) / `JdSwiftUIFont.scaled(…, category: sizeCategory)`(SwiftUI) 경유 ·
UIKit 뷰는 `adjustsFontForContentSizeCategory = true` + `traitCollectionDidChange` 재적용 ·
아이콘은 SF Symbols(시스템이므로 서드파티 아님).

---

## A. layout 12 — 실구현 3 + 별칭/레시피 9

| 웹                | iOS 처리                                             | 산출물                                                |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Stack             | 레시피 (VStack/HStack + `JdStackView`)               | RECIPES.md 항목 + 데모                                |
| Grid · SimpleGrid | 레시피 (LazyVGrid, adaptive)                         | RECIPES.md + 데모                                     |
| Wrap              | **별칭** — `JdFlowLayout`(기구현)                    | 데모만                                                |
| LayoutDivider     | **별칭** — `JdDivider`(기구현)                       | 데모만                                                |
| Container         | 레시피 (`JdContainerSize.maxWidth` + 패딩)           | RECIPES.md + 데모                                     |
| Overlay           | 레시피 (`.overlay` + 재질 블러)                      | RECIPES.md + 데모                                     |
| AspectRatioBox    | 레시피 (`.aspectRatio(_:contentMode:)`)              | RECIPES.md + 데모                                     |
| **Spacer**        | 실구현 — 고정 크기(웹은 양쪽 패딩이라 **총 2×size**) | `JdSpacer` / `JdSpacerView`                           |
| **Show · Hide**   | 실구현 — 컨테이너 폭 기준 모디파이어                 | `.jdShow(above:below:)` / `.jdHide(above:below:)`     |
| **AppShell**      | 실구현 — 사이드바 레일 + 콘텐츠 (+compact 드로어)    | `JdAppShell`(SwiftUI) / `JdAppShellController`(UIKit) |

```swift
// JunDSSwiftUI/Components/Spacer/JdSpacer.swift
public struct JdSpacer: View {
    public init(_ size: JdGap = .md, axis: JdSpacerAxis = .vertical)
    // 웹 패리티: 차지 공간 = 2 × size.value (양쪽 패딩). 장식이므로 accessibilityHidden(true).
    // ⚠️ SwiftUI의 탐욕적 Spacer()가 아니다 — 고정 크기다.
}
// JunDSUIKit/Components/Spacer/JdSpacerView.swift
public final class JdSpacerView: UIView {
    public init(_ size: JdGap = .md, axis: JdSpacerAxis = .vertical)
    public var size: JdGap { get set }   // didSet → 제약 상수 갱신
    // intrinsicContentSize로 2×size 확보, isAccessibilityElement = false
}

// JunDSSwiftUI/Layout/JdBreakpointVisibility.swift
public extension View {
    /// 컨테이너 폭 기준 가시성 — 판정은 Core의 JdBreakpoint.isVisible(width:above:below:)
    func jdShow(above: JdBreakpoint? = nil, below: JdBreakpoint? = nil) -> some View
    func jdHide(above: JdBreakpoint? = nil, below: JdBreakpoint? = nil) -> some View
}
// 구현: GeometryReader 대신 `.background(GeometryReader{...})`로 폭을 읽어 상태에 반영하거나,
// 부모 폭을 받는 컨테이너 모디파이어로. 숨김은 뷰를 계층에서 제거(display:none 등가).
// ⚠️ SSG 결정성 규칙은 웹 쪽 것이라 iOS엔 무관하나, 초기 폭 0에서 깜빡이지 않게
//    첫 측정 전에는 "보임"을 기본값으로 둔다(웹의 무조건 렌더 후 CSS 숨김과 동형).

// JunDSSwiftUI/Components/AppShell/JdAppShell.swift
public struct JdAppShell<Sidebar: View, Header: View, Content: View, Footer: View>: View {
    public init(sidebarWidth: CGFloat = 260, collapsedWidth: CGFloat = 64,
                collapsed: Binding<Bool>, compactOpen: Binding<Bool>,
                @ViewBuilder sidebar: () -> Sidebar, @ViewBuilder header: () -> Header,
                @ViewBuilder content: () -> Content, @ViewBuilder footer: () -> Footer)
    // regular 폭: 레일(collapsed면 collapsedWidth) + 콘텐츠. compact 폭: 드로어 오버레이 +
    // 딤 배경(탭하면 닫힘). 애니메이션은 JdMotion.duration 경유(Reduce Motion 존중).
    // 웹 Ctrl/⌘+B는 iOS에서 하드웨어 키보드 한정이라 표면에서 제외 — collapsed 바인딩으로 소비자가 제어.
}
public final class JdAppShellController: UIViewController {
    public init(sidebar: UIViewController, content: UIViewController)
    public var isCollapsed: Bool { get set }     // 애니메이션 폭 전환
    public var sidebarWidth: CGFloat { get set } // 기본 260 / collapsed 64
    // compact(가로 축소) 시 드로어 + 딤 뷰. 자식 VC 컨테인먼트 규약 준수.
}
```

## B. primitives 19 — 실구현 17 + 별칭 2

별칭: **Divider**(=`JdDivider` 기구현) · **Switch**(=Toggle 단일 구현, 아래 참조).

### B1. 폼 컨트롤 (9)

```swift
// Toggle + Switch — 웹은 두 태그지만 iOS는 같은 시스템 컨트롤이라 단일 구현 + 별칭(R12).
public struct JdToggle: View {
    public init(_ label: String? = nil, isOn: Binding<Bool>, size: JdToggleSize = .md)
    // SwiftUI Toggle + .toggleStyle(.switch) + .tint(JdToken.Color.primary.color)
    // size → .controlSize(.mini/.regular/.large). label nil이면 .labelsHidden()
}
public typealias JdSwitch = JdToggle
public final class JdToggleView: UIView {   // UISwitch + 라벨 (gap 8)
    public init(label: String? = nil, isOn: Bool = false, size: JdToggleSize = .md)
    public var isOn: Bool { get set }
    public var onChange: ((Bool) -> Void)?   // 웹 jd-change 등가(사용자 조작 시에만)
}
public typealias JdSwitchView = JdToggleView

// Checkbox — iOS 관용구 부재 → SF Symbols 자체 드로잉. 3상태(JdCheckboxState).
public struct JdCheckbox: View {
    public init(_ label: String? = nil, state: Binding<JdCheckboxState>,
                size: JdToggleSize = .md, indeterminateAllowed: Bool = false)
    // 심볼: on = "checkmark.square.fill"(primary), indeterminate = "minus.square.fill",
    // off = "square"(border). a11y: .isButton 아님 — .accessibilityAddTraits(.isSelected) +
    // accessibilityValue(선택됨/선택 안 됨/부분 선택)
}
public final class JdCheckboxView: UIControl { … isSelectedState: JdCheckboxState, onChange }

// RadioGroup — 옵션 배열 + 단일 선택. 웹 role=radiogroup 등가.
public struct JdRadioOption: Identifiable, Hashable, Sendable {
    public let value: String; public let label: String; public let isDisabled: Bool
    public var id: String { value }
    public init(value: String, label: String, isDisabled: Bool = false)
}   // ← 이 타입은 JunDSCore에 신설(양 계층 공유)
public struct JdRadioGroup: View {
    public init(_ options: [JdRadioOption], selection: Binding<String?>,
                axis: JdAxis = .vertical, size: JdToggleSize = .md, isEnabled: Bool = true)
    // 심볼: 선택 "largecircle.fill.circle"(primary) / 미선택 "circle"(border)
    // a11y: 각 행 .accessibilityAddTraits(.isButton) + isSelected, 컨테이너에 라벨은 소비자 몫
}
public final class JdRadioGroupView: UIView { … options, selectedValue, onChange, axis }

// Slider — 값·마크. 마크 위치 계산은 Core(JdRangeState.fraction 유사)나 단순 비례.
public struct JdSliderMark: Hashable, Sendable {   // ← JunDSCore에 신설
    public let value: Double; public let label: String?
    public init(value: Double, label: String? = nil)
}
public struct JdSlider: View {
    public init(value: Binding<Double>, in bounds: ClosedRange<Double> = 0...100,
                step: Double = 1, color: JdSliderColor = .primary, size: JdToggleSize = .md,
                showsValue: Bool = false, marks: [JdSliderMark] = [],
                format: ((Double) -> String)? = nil)
    // showsValue → 상단 행(min 좌·현재값 중앙 semibold·max 우), 웹 헤더 동형
}
public final class JdSliderView: UIView { … UISlider + 헤더 행, onValueChange/onCommit }

// RangeSlider — 두 손잡이. 클램프·양자화는 전부 Core JdRangeState (렌더는 fraction만 사용).
public struct JdRangeSlider: View {
    public init(state: Binding<JdRangeState>, showsValues: Bool = false,
                format: ((Double) -> String)? = nil)
    // 레일 JdSliderSpec.railColor, 채움 primary, 손잡이 20pt 흰색+2pt primary 테두리.
    // a11y: 손잡이 각각 .accessibilityValue + .accessibilityAdjustableAction(증감 = step)
    //       라벨은 "최솟값"/"최댓값"(웹 리터럴 동형)
}
public final class JdRangeSliderView: UIControl { … rangeState, onChange; 각 손잡이 accessibilityElement }
// state는 UIControl.State와 충돌(오버라이드 불가) → rangeState — JdTextView size → textSize와
// 같은 UIKit 명명 충돌 회피(DESIGN §2.3 선례). SwiftUI 표면의 state:는 그대로다.

// Label
public struct JdLabel: View {
    public init(_ text: String, isRequired: Bool = false)
    // 14pt medium foreground + required면 " *"(danger, 앞 여백 2pt).
    // a11y: required 표식은 장식이 아니라 라벨에 "필수"로 합류시킨다(웹의 순수 시각 표식 결함 보정)
}
public final class JdLabelView: UILabel { … isRequired }

// Textarea — 웹 error는 boolean(메시지 없음). autoResize·showCount 지원.
public struct JdTextarea: View {
    public init(text: Binding<String>, placeholder: String = "", rows: Int = 4,
                maxLength: Int = 0, isError: Bool = false, showsCount: Bool = false)
    // TextEditor 기반. 테두리 1pt(에러면 danger), radius 12, padding 10/14.
    // a11y: isError면 .accessibilityValue("오류") — 웹의 aria-invalid 부재를 보정(계약 명시)
}
public final class JdTextareaView: UIView { … UITextView 래핑, onTextChange, autoResize }

// IconButton — label 필수(아이콘 전용 컨트롤, 04 §7.1 컴파일 타임 강제)
public struct JdIconButton: View {
    public init(systemImage: String, accessibilityLabel: String,
                variant: JdIconButtonVariant = .ghost, size: JdIconButtonSize = .md,
                action: @escaping () -> Void)
}
public final class JdIconButtonView: UIControl {
    public init(systemImage: String, accessibilityLabel: String,
                variant: JdIconButtonVariant = .ghost, size: JdIconButtonSize = .md)
    public var onTap: (() -> Void)?
}
```

### B2. 표시 (10, Divider 별칭 포함)

```swift
public struct JdBadge: View {
    public init(_ text: String, variant: JdBadgeVariant = .default,
                size: JdDisplaySize = .md, showsDot: Bool = false)
    public init(count: Int, maxCount: Int = 99)   // count 모드: 원형 18pt·danger 고정
}
public final class JdBadgeView: UIView { … }

public struct JdTag: View {
    public init(_ text: String, color: JdTagColor = .gray, onRemove: (() -> Void)? = nil)
    // onRemove != nil → 닫기 버튼(SF "xmark", 12pt, accessibilityLabel "삭제")
}
public final class JdTagView: UIView { … onRemove }

public struct JdAvatar: View {
    public init(name: String = "", image: Image? = nil,
                size: JdAvatarSize = .md, status: JdAvatarStatus? = nil)
    // image nil → 이니셜 폴백(JdAvatarSpec.initials + fallbackColor). 상태 도트는 우하단 링.
    // a11y: 하나의 요소로 합치고 라벨 = name(비면 "아바타"), 상태는 accessibilityValue
}
public final class JdAvatarView: UIView { … name, image, status }

public struct JdSpinner: View {
    public init(size: JdDisplaySize = .md, label: String = JdSpinnerSpec.defaultLabel,
                color: JdDynamicColor = JdToken.Color.primary)
    // Reduce Motion 시 회전 정지(정적 표시) — 04 §7.3
}
public final class JdSpinnerView: UIView { … UIActivityIndicatorView 기반 }

public struct JdKbd: View {   // 단축키 문자열, 공백 제거(JdKbdSpec.normalize)
    public init(_ keys: String)
}
public final class JdKbdView: UILabel { … keys }

public struct JdKeyCap: View {
    public init(_ key: String, variant: JdKeyCapVariant = .default,
                size: JdDisplaySize = .md, isPressed: Bool = false)
}
public final class JdKeyCapView: UILabel { … isPressed }

public struct JdStatusDot: View {
    public init(_ status: JdStatusKind = .neutral, label: String? = nil, size: JdDisplaySize = .md)
    // pulse는 Reduce Motion 시 정지. a11y: 라벨 있으면 그 텍스트, 없으면 상태명을 라벨로
    //   (웹은 라벨 없으면 AT에 아무것도 안 보이는 결함 — iOS는 상태명을 노출해 보정)
}
public final class JdStatusDotView: UIView { … }

public struct JdSeverityBadge: View {
    public init(_ text: String, severity: JdSeverity = .neutral,
                size: JdDisplaySize = .md, showsDot: Bool = false)
}
public final class JdSeverityBadgeView: UIView { … }

public struct JdBatteryIndicator: View {
    public init(value: Double, size: JdDisplaySize = .md, label: String? = nil,
                autoColor: Bool = false, color: JdBatteryColor = .primary)
    // a11y: 하나의 요소, accessibilityValue = "N 퍼센트" (웹의 role 부재 결함 보정)
    // 채움 애니메이션은 JdMotion.duration(0.5) 경유
}
public final class JdBatteryIndicatorView: UIView { … value 애니메이션 }
```

---

## C. 테스트 요구 (배치별)

- Core 순수 함수는 **전수**: `JdBreakpoint.isVisible` 경계값, `JdRangeState` 클램프·양자화·역변환,
  `JdAvatarSpec.initials`(2어절/1어절/한글/빈 문자열), `JdBatterySpec.autoColor` 임계(70/30 경계),
  `JdBadgeSpec.countText`(초과/미만), `JdKbdSpec.normalize`.
- UIKit 뷰: init 후 기본 상태·프로퍼티 didSet 반영·접근성 표면(라벨/트레이트/값).
- SwiftUI: `UIHostingController` 호스팅 스모크(sizeThatFits > 0) + 크기 축 단조성.

## D. 쇼룸 데모 (별도 배치)

데모 파일은 `demo/JunDSDemo.swiftpm/Demos/<Id>Demo.swift`, ledger id를 그대로 쓴다.
`DemoRegistry.all` 등록은 **통합자만** 한다(배치 에이전트는 건드리지 않는다).
