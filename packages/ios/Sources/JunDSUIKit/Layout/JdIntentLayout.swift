import JunDSCore
import UIKit

// MARK: - 의도 기반 배치 (DEC-052)
//
// 웹 <jd-split> / <jd-switcher> / <jd-sidebar-layout>의 UIKit 대응.
//
// ## 왜 이름을 더하나 — 축·정렬·분배를 몰라도 고를 수 있게
// `JdStackView(.horizontal, gap: .md, align: .center, distribute: .fill)` 뒤에
// `JdFlex()`를 끼우면 "양끝 배치"가 된다. 그 사실을 **먼저 알아야** 한다는 게 문제였다.
// 화면을 짜는 사람이 떠올리는 말은 "제목 왼쪽, 버튼 오른쪽"이지 distribution이 아니다.
//
// ## 왜 새 컨테이너 타입을 (거의) 만들지 않았나 (04 §10 번역 원칙)
// Split·Switcher는 UIStackView가 이미 할 수 있는 일에 이름만 붙인 자유 함수다.
// SidebarLayout만 전용 뷰인데, "본문이 최소 폭을 못 지키면 쌓인다"는 판정이
// 스택에 없는 규칙이기 때문이다.
//
// ## 왜 …View 접미사인가
// SwiftUI 쪽이 같은 개념을 `JdSplit`/`JdSwitcher`/`JdSidebarLayout`로 갖는다. 우산
// 타겟이 두 계통을 함께 @_exported하므로 이름이 겹치면 소비자 쪽에서 모호해진다 —
// JdFlowLayout(SwiftUI) ↔ JdWrapView(UIKit)와 같은 관례를 따른다.
//
// ## 웹과 같은 의미인가
// 그렇다. 셋 다 **자기가 놓인 자리의 폭**을 보고 꺾인다 — 화면 크기가 아니라.
// 웹 쪽이 `calc((임계값 - 100%) * 999)`로 컨테이너 폭을 보는 것과 같은 규칙이고,
// iOS가 브레이크포인트를 컨테이너 폭으로 해석하는 원칙(04 §10)과도 일치한다.

/// 양끝 배치 — 웹 `<jd-split>`.
///
/// ```swift
/// JdSplitView {
///     titleLabel
///     JdHStack(gap: .sm) { exportButton; newButton }
/// }
/// ```
///
/// children 사이마다 신축 여백이 들어간다. 즉 둘이면 양끝, 셋이면 균등 분배 —
/// 웹의 `space-between`과 같은 결과다. "하나만 왼쪽, 나머지 오른쪽"이 필요하면 위
/// 예시처럼 오른쪽을 `JdHStack`으로 묶어라.
@MainActor
public func JdSplitView(
    gap: JdGap = .md,
    align: JdAlign = .center,
    padding: JdGap? = nil,
    @JdViewBuilder content: () -> [UIView]
) -> JdStackView {
    let items = content()
    // 아이템 사이에만 신축 여백 — 양끝에 넣으면 가운데로 모인다(그건 Center다).
    var arranged: [UIView] = []
    for (index, item) in items.enumerated() {
        if index > 0 { arranged.append(JdFlexSpacerView()) }
        arranged.append(item)
    }
    return JdStackView(
        .horizontal, gap: gap, align: align.uiStackAlignment,
        insets: padding.map(JdEdge.all) ?? .zero
    ) { arranged }
}

/// 자리가 좁으면 알아서 세로로 쌓이는 배치 — 웹 `<jd-switcher>`.
///
/// ```swift
/// JdSwitcherView { leftCard; rightCard }              // 기본 임계값(sm)
/// JdSwitcherView(threshold: .md) { a; b; c }          // 더 넓어야 가로로
/// ```
///
/// 임계값은 브레이크포인트 이름으로 고른다 — `jdShow(above:)`·웹 `threshold="md"`와
/// 같은 어휘다. 고르지 않아도 동작하는 것이 요점이다.
@MainActor
public func JdSwitcherView(
    threshold: JdBreakpoint = .sm,
    gap: JdGap = .md,
    align: JdAlign = .stretch,
    @JdViewBuilder content: () -> [UIView]
) -> JdAdaptiveStackView {
    JdAdaptiveStackView(
        breakpoint: threshold.width,
        wideAxis: .horizontal,
        gap: gap,
        align: align.uiStackAlignment,
        content: content)
}

/// 사이드바 + 본문, 본문이 최소 폭을 못 지키면 쌓임 — 웹 `<jd-sidebar-layout>`.
///
/// ```swift
/// JdSidebarLayoutView(sideWidth: 240, contentMin: 320) {
///     tableOfContents
///     article
/// }
/// ```
///
/// 첫 자식이 사이드바, 두 번째가 본문이다.
///
/// **꺾이는 폭을 적지 않는다.** `sideWidth + gap + contentMin`을 못 담는 순간 쌓이므로,
/// 사이드바 폭을 바꾸면 꺾이는 지점이 따라온다 — 웹에서 본문 `min-inline-size`가
/// 임계값을 대신하는 것과 같은 구조다. 브레이크포인트를 사이드바 폭과 따로 관리하다
/// 어긋나 본문이 찌그러지는 일이 없다.
@MainActor
public final class JdSidebarLayoutView: UIView {

    /// 가로 배치일 때 사이드바가 갖는 폭
    public var sideWidth: CGFloat {
        didSet { sideWidthConstraint?.constant = sideWidth; applyAxisIfNeeded(force: true) }
    }

    /// 본문이 이보다 좁아지면 세로로 쌓인다
    public var contentMin: CGFloat {
        didSet { applyAxisIfNeeded(force: true) }
    }

    /// 현재 쌓여 있는가 — 소비자가 부수적 스타일을 맞출 때 읽는다
    public private(set) var isStacked = false

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let stack: JdStackView
    private let sidebar: UIView
    private var sideWidthConstraint: NSLayoutConstraint?

    public init(
        sideWidth: CGFloat = 256,
        contentMin: CGFloat = 320,
        gap: JdGap = .lg,
        side: JdSidebarSide = .start,
        @JdViewBuilder content: () -> [UIView]
    ) {
        let items = content()
        precondition(
            items.count == 2,
            "JdSidebarLayout은 자식이 정확히 둘이다 (사이드바, 본문) — \(items.count)개를 받았다")
        self.sideWidth = sideWidth
        self.contentMin = contentMin
        self.sidebar = items[0]
        // 시각 순서만 뒤집는다. 접근성 순서(자식 배열)는 그대로 두는 것이 웹의
        // `order: 1`과 같은 선택이다 — 본문을 먼저 읽는 편이 대개 맞다.
        let arranged = side == .start ? items : [items[1], items[0]]
        self.stack = JdStackView(
            axis: .horizontal, gap: gap, alignment: .fill,
            arranged: arranged)
        super.init(frame: .zero)
        stack.jdFill(self)
        let widthConstraint = sidebar.widthAnchor.constraint(equalToConstant: sideWidth)
        // 쌓였을 때는 이 제약을 끄므로 required로 둬도 충돌하지 않는다
        widthConstraint.isActive = false
        sideWidthConstraint = widthConstraint
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        applyAxisIfNeeded(force: false)
        super.layoutSubviews()
    }

    private func applyAxisIfNeeded(force: Bool) {
        // 폭 0은 "아직 배치 전"이지 "좁다"가 아니다 — 첫 배치 전에 쌓아 두면
        // 화면에 한 번 세로로 떴다가 가로로 튀는 것이 보인다.
        let needed = sideWidth + stack.spacing + contentMin
        let stacked = bounds.width > 0 && bounds.width < needed
        guard force || stacked != isStacked else { return }
        isStacked = stacked
        let axis: NSLayoutConstraint.Axis = stacked ? .vertical : .horizontal
        if stack.axis != axis { stack.axis = axis }
        // 세로로 쌓이면 사이드바도 한 줄을 다 쓴다 — 폭 고정을 푼다
        if sideWidthConstraint?.isActive != !stacked {
            sideWidthConstraint?.isActive = !stacked
        }
    }
}
