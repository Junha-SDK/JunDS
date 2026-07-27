import UIKit
import JunDSCore

// MARK: - 선언형 배치 (DEC-042)
//
// 문제: `jd.layout`은 **제약만** 만든다. 그래서 화면 하나를 짜려면 뷰마다 (1) 생성
// (2) addSubview (3) 제약 — 세 단계를 손으로 반복하고, 순서를 어기면
// `preconditionFailure("addSubview 이후에 layout을 호출하라")`로 **앱이 죽는다**.
// 배치가 어려운 게 아니라 **배치를 적는 일**이 어려웠다.
//
// 답: 트리와 제약을 **한 표현식**으로 만든다. 결과 빌더가 자식을 받아 스택에 넣으므로
// addSubview 순서를 소비자가 볼 일이 없다 — 그 함정이 문법적으로 사라진다.
//
// 새 컨테이너 타입을 만들지 않았다(04 §10 번역 원칙): 축·정렬·분배·간격은 `UIStackView`가
// 이미 정확히 한다. 빠져 있던 것은 **중첩을 적는 문법**, **여백 아이템**, **폭 지정**,
// **폭에 따른 축 전환** 넷이고 그것만 더한다. 열 정렬(표)은 스택이 구조적으로 못 하므로
// `JdColumnsView`가 따로 맡는다.

// MARK: - 정렬 어휘 브리지 (DEC-043)

public extension JdAlign {
    /// 웹 어휘 → UIKit. `stretch`가 `.fill`인 것이 유일한 이름 차이다.
    var uiStackAlignment: UIStackView.Alignment {
        switch self {
        case .start: return .leading
        case .center: return .center
        case .end: return .trailing
        case .stretch: return .fill
        case .baseline: return .firstBaseline
        }
    }
}

public extension JdJustify {
    var uiStackDistribution: UIStackView.Distribution {
        switch self {
        // start/center/end는 분배가 아니라 정렬이다 — 스택은 fill로 두고 JdFlex()로 민다.
        // (UIStackView엔 justify-content 대응이 없다. 이 비대칭을 숨기지 않고 적어 둔다.)
        case .start, .center, .end: return .fill
        case .between: return .equalSpacing
        case .around, .evenly: return .equalCentering
        }
    }
}

/// 자식 뷰 목록을 만드는 결과 빌더. `if`/`if let`/`for`/옵셔널을 그대로 쓸 수 있다.
@resultBuilder
public enum JdViewBuilder {
    /// 빈 블록 `{ }` 허용 — 소비자가 `[UIView]()`처럼 타입을 적어 넣지 않아도 된다
    public static func buildBlock() -> [UIView] { [] }
    public static func buildBlock(_ parts: [UIView]...) -> [UIView] {
        parts.flatMap { $0 }
    }
    /// 뷰 한 개. **옵셔널만** 받는다 — 비옵셔널 오버로드를 함께 두면 `Box()` 하나가 두
    /// 후보에 모두 맞아 `ambiguous use of 'buildExpression'`으로 컴파일이 깨진다(실측).
    /// 비옵셔널 뷰는 암시적 승격으로 그대로 들어오고, nil은 조용히 빠진다.
    public static func buildExpression(_ view: UIView?) -> [UIView] { view.map { [$0] } ?? [] }
    public static func buildExpression(_ views: [UIView]) -> [UIView] { views }
    public static func buildOptional(_ part: [UIView]?) -> [UIView] { part ?? [] }
    public static func buildEither(first: [UIView]) -> [UIView] { first }
    public static func buildEither(second: [UIView]) -> [UIView] { second }
    public static func buildArray(_ parts: [[UIView]]) -> [UIView] { parts.flatMap { $0 } }
    public static func buildLimitedAvailability(_ part: [UIView]) -> [UIView] { part }
}

public extension JdStackView {
    /// 선언형 생성 — 자식을 블록으로 적으면 트리가 완성된다.
    ///
    /// ```swift
    /// let row = JdStackView(.horizontal, gap: .sm, align: .center) {
    ///     avatar.jdSize(40)
    ///     JdStackView(.vertical, gap: .xs) { nameLabel; tickerLabel }
    ///     JdFlexSpacerView()                  // 남는 공간을 밀어낸다
    ///     JdLiveStackedCellView(price: p, change: c)
    /// }
    /// ```
    ///
    /// `insets`는 layoutMargins로 들어간다 — 패딩을 위해 래퍼 뷰를 한 겹 더 만들지 않는다.
    convenience init(_ axis: NSLayoutConstraint.Axis,
                     gap: JdGap = .md,
                     align: UIStackView.Alignment = .fill,
                     distribute: UIStackView.Distribution = .fill,
                     insets: NSDirectionalEdgeInsets = .zero,
                     @JdViewBuilder content: () -> [UIView]) {
        self.init(axis: axis, gap: gap, alignment: align, distribution: distribute,
                  arranged: content())
        if insets != .zero {
            directionalLayoutMargins = insets
            isLayoutMarginsRelativeArrangement = true
        }
    }

    /// 모든 변에 같은 패딩 — 가장 흔한 경우의 축약
    convenience init(_ axis: NSLayoutConstraint.Axis,
                     gap: JdGap = .md,
                     align: UIStackView.Alignment = .fill,
                     distribute: UIStackView.Distribution = .fill,
                     padding: JdGap,
                     @JdViewBuilder content: () -> [UIView]) {
        self.init(axis, gap: gap, align: align, distribute: distribute,
                  insets: NSDirectionalEdgeInsets(top: padding.value, leading: padding.value,
                                                  bottom: padding.value, trailing: padding.value),
                  content: content)
    }
}

// MARK: - 여백 아이템

/// 남는 공간을 **차지해 밀어내는** 투명 아이템 — SwiftUI `Spacer()` 동형.
///
/// ⚠️ `JdSpacerView`(웹 `jd-spacer`)와 다른 물건이다. 이름을 가른 이유:
/// - `JdSpacerView`  = **고정** 간격. 토큰 크기(2×size)를 지키며 늘어나지도 줄지도 않는다.
/// - `JdFlexSpacerView` = **신축** 여백. 자기 크기는 0이고 남는 공간을 전부 먹는다.
///
/// `UIStackView`에서 "한쪽으로 밀기"를 하려면 distribution을 바꾸거나 더미 뷰에 낮은
/// 우선순위 제약을 손으로 걸어야 했다. 이 뷰가 그 관용구를 이름 하나로 만든다.
public final class JdFlexSpacerView: UIView {
    private let minLength: CGFloat

    /// - Parameter minLength: 최소 길이. 0이면 순수 신축(늘어나기만 한다).
    public init(minLength: CGFloat = 0) {
        self.minLength = minLength
        super.init(frame: .zero)
        isUserInteractionEnabled = false
        backgroundColor = .clear
        // 콘텐츠가 없으므로 우선순위를 최하로 — 다른 아이템이 먼저 자기 크기를 갖는다
        setContentHuggingPriority(.init(1), for: .horizontal)
        setContentHuggingPriority(.init(1), for: .vertical)
        setContentCompressionResistancePriority(.init(1), for: .horizontal)
        setContentCompressionResistancePriority(.init(1), for: .vertical)
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        CGSize(width: minLength, height: minLength)
    }
}

// MARK: - 크기·패딩 모디파이어
//
// 체이닝으로 쓰도록 **자기 자신을 돌려준다**(SwiftUI 모디파이어 감각). 제약을 스스로
// 활성화하므로 superview가 없어도 안전하다 — width/height는 자기 자신에 대한 제약이라
// `equalToSuperview`의 함정과 무관하다.

public extension UIView {
    /// 고정 폭
    @discardableResult
    func jdWidth(_ value: CGFloat, priority: UILayoutPriority = .required) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        let c = widthAnchor.constraint(equalToConstant: value)
        c.priority = priority
        c.isActive = true
        return self
    }

    /// 고정 높이
    @discardableResult
    func jdHeight(_ value: CGFloat, priority: UILayoutPriority = .required) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        let c = heightAnchor.constraint(equalToConstant: value)
        c.priority = priority
        c.isActive = true
        return self
    }

    /// 정사각 고정 크기
    @discardableResult
    func jdSize(_ side: CGFloat) -> Self {
        jdWidth(side).jdHeight(side)
    }

    @discardableResult
    func jdSize(width: CGFloat, height: CGFloat) -> Self {
        jdWidth(width).jdHeight(height)
    }

    /// 최소 폭 — 이보다 좁아지지 않는다(표 열의 하한 등)
    @discardableResult
    func jdMinWidth(_ value: CGFloat) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        widthAnchor.constraint(greaterThanOrEqualToConstant: value).isActive = true
        return self
    }

    /// 이 뷰를 패딩 상자로 감싼다 — 원본이 아니라 **감싼 상자**를 돌려준다.
    /// 스택 아이템에 개별 여백이 필요할 때 쓴다(스택 자체의 insets로 안 되는 경우).
    func jdPadded(_ insets: NSDirectionalEdgeInsets) -> UIView {
        let box = JdStackView(axis: .vertical, gap: .custom(0), alignment: .fill,
                              arranged: [self])
        box.directionalLayoutMargins = insets
        box.isLayoutMarginsRelativeArrangement = true
        return box
    }

    func jdPadded(_ gap: JdGap) -> UIView {
        jdPadded(NSDirectionalEdgeInsets(top: gap.value, leading: gap.value,
                                         bottom: gap.value, trailing: gap.value))
    }

    /// 부모를 꽉 채운다 — `addSubview` + 네 변 제약을 한 줄로.
    ///
    /// **`jd.layout { $0.edges.equalToSuperview() }`의 안전한 대체다.** 그쪽은 addSubview를
    /// 잊으면 preconditionFailure로 죽는데, 이 메서드는 부모를 인자로 받아 스스로 붙이므로
    /// 순서를 틀릴 수 없다.
    @discardableResult
    func jdFill(_ parent: UIView, insets: NSDirectionalEdgeInsets = .zero) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        parent.addSubview(self)
        NSLayoutConstraint.activate([
            topAnchor.constraint(equalTo: parent.topAnchor, constant: insets.top),
            leadingAnchor.constraint(equalTo: parent.leadingAnchor, constant: insets.leading),
            bottomAnchor.constraint(equalTo: parent.bottomAnchor, constant: -insets.bottom),
            trailingAnchor.constraint(equalTo: parent.trailingAnchor, constant: -insets.trailing),
        ])
        return self
    }

    /// 부모의 안전 영역을 채운다 — 화면 루트에 얹을 때의 기본형
    @discardableResult
    func jdFillSafeArea(_ parent: UIView, insets: NSDirectionalEdgeInsets = .zero) -> Self {
        translatesAutoresizingMaskIntoConstraints = false
        parent.addSubview(self)
        let guide = parent.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            topAnchor.constraint(equalTo: guide.topAnchor, constant: insets.top),
            leadingAnchor.constraint(equalTo: guide.leadingAnchor, constant: insets.leading),
            bottomAnchor.constraint(equalTo: guide.bottomAnchor, constant: -insets.bottom),
            trailingAnchor.constraint(equalTo: guide.trailingAnchor, constant: -insets.trailing),
        ])
        return self
    }
}

// MARK: - 폭에 따른 축 전환 (반응형)

/// 폭이 임계값보다 좁아지면 축을 세로로 뒤집는 스택 — 웹의
/// `flex-direction: row` → `@media (max-width) { column }` 대응.
///
/// 왜 별 타입인가: `UIStackView.axis`를 `layoutSubviews`에서 바꾸는 일은 잘못하면
/// 레이아웃 루프를 만든다(축 변경 → 재레이아웃 → 축 변경 …). 그 판정을 한 곳에 가두고
/// **값이 실제로 바뀔 때만** 축을 쓰도록 고정해 둔다.
public final class JdAdaptiveStackView: UIView {

    /// 이 폭 미만이면 세로로 전환한다
    public var breakpoint: CGFloat {
        didSet { applyAxisIfNeeded(force: true) }
    }

    /// 넓을 때의 축(기본 가로), 좁을 때는 그 반대
    public var wideAxis: NSLayoutConstraint.Axis {
        didSet { applyAxisIfNeeded(force: true) }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let stack: JdStackView

    /// 현재 좁은 상태인가 — 소비자가 부수적 스타일을 맞출 때 읽는다
    public private(set) var isCompact = false

    public init(breakpoint: CGFloat = JdToken.Breakpoint.sm,
                wideAxis: NSLayoutConstraint.Axis = .horizontal,
                gap: JdGap = .md,
                align: UIStackView.Alignment = .fill,
                @JdViewBuilder content: () -> [UIView]) {
        self.breakpoint = breakpoint
        self.wideAxis = wideAxis
        self.stack = JdStackView(axis: wideAxis, gap: gap, alignment: align, arranged: content())
        super.init(frame: .zero)
        stack.jdFill(self)
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        applyAxisIfNeeded(force: false)
        super.layoutSubviews()
    }

    private func applyAxisIfNeeded(force: Bool) {
        let compact = bounds.width > 0 && bounds.width < breakpoint
        guard force || compact != isCompact else { return }
        isCompact = compact
        let target: NSLayoutConstraint.Axis =
            compact ? (wideAxis == .horizontal ? .vertical : .horizontal) : wideAxis
        // 같은 값을 다시 쓰면 UIStackView가 불필요한 무효화를 일으킨다 — 변할 때만 쓴다
        if stack.axis != target { stack.axis = target }
    }
}

// MARK: - 축이 이름에 드러나는 생성자 (DEC-043)
//
// `JdStackView(.horizontal, gap: .sm, align: .center) { … }`는 축이 인자에 묻혀 읽는 순간
// 눈이 한 번 멈춘다. SwiftUI가 `HStack { }`으로 읽히는 이유는 **축이 이름에 있기** 때문이다.
// JdStackView가 final이라 서브클래스를 못 만드므로 대문자 자유 함수로 같은 읽기를 만든다
// (Swift 표준 관용구 — 타입처럼 읽히고 자동완성에서도 타입 옆에 뜬다).

/// 세로 스택 — 웹 `jd-vstack`(gap md · stretch) 기본값
public func JdVStack(gap: JdGap = .md,
                     align: JdAlign = .stretch,
                     justify: JdJustify = .start,
                     padding: JdGap? = nil,
                     @JdViewBuilder content: () -> [UIView]) -> JdStackView {
    JdStackView(.vertical, gap: gap, align: align.uiStackAlignment,
                distribute: justify.uiStackDistribution,
                insets: padding.map(JdEdge.all) ?? .zero,
                content: content)
}

/// 가로 스택 — 웹 `jd-hstack`(gap sm · center) 기본값
public func JdHStack(gap: JdGap = .sm,
                     align: JdAlign = .center,
                     justify: JdJustify = .start,
                     padding: JdGap? = nil,
                     @JdViewBuilder content: () -> [UIView]) -> JdStackView {
    JdStackView(.horizontal, gap: gap, align: align.uiStackAlignment,
                distribute: justify.uiStackDistribution,
                insets: padding.map(JdEdge.all) ?? .zero,
                content: content)
}

/// 남는 공간을 먹어 형제를 밀어내는 신축 여백 — SwiftUI `Spacer()` 자리
public func JdFlex(min: CGFloat = 0) -> JdFlexSpacerView {
    JdFlexSpacerView(minLength: min)
}

/// 여백 조립 — `NSDirectionalEdgeInsets`를 손으로 적지 않게 한다
public enum JdEdge {
    public static func all(_ gap: JdGap) -> NSDirectionalEdgeInsets {
        NSDirectionalEdgeInsets(top: gap.value, leading: gap.value,
                                bottom: gap.value, trailing: gap.value)
    }
    public static func symmetric(v: JdGap = .none, h: JdGap = .none) -> NSDirectionalEdgeInsets {
        NSDirectionalEdgeInsets(top: v.value, leading: h.value, bottom: v.value, trailing: h.value)
    }
    public static func only(top: JdGap = .none, leading: JdGap = .none,
                            bottom: JdGap = .none, trailing: JdGap = .none) -> NSDirectionalEdgeInsets {
        NSDirectionalEdgeInsets(top: top.value, leading: leading.value,
                                bottom: bottom.value, trailing: trailing.value)
    }
}
