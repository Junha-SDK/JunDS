import JunDSCore
import SwiftUI

// MARK: - 의도 기반 배치 (DEC-052)
//
// 웹 <jd-split> / <jd-switcher> / <jd-sidebar-layout>의 SwiftUI 대응.
//
// ## 왜 Layout 프로토콜인가 — 콘텐츠를 두 번 적지 않기 위해
// "넓으면 가로, 좁으면 세로"를 SwiftUI에서 쓰는 흔한 방법은 `ViewThatFits { HStack{…}
// VStack{…} }`인데, 그러면 **같은 자식을 두 번 적어야 한다.** 한쪽만 고치는 순간
// 두 배치가 갈라지고, 그 어긋남은 좁은 화면에서만 보인다.
// Layout(iOS 16+)은 자식을 한 번 받아 배치 규칙만 바꾸므로 그 실수가 불가능하다.
//
// ## 웹과 같은 의미인가
// 그렇다. 셋 다 `proposal.width` — 즉 **자기가 놓인 자리의 폭**을 보고 꺾인다.
// 웹이 `calc((임계값 - 100%) * 999)`로 컨테이너 폭을 보는 것과 같은 규칙이라,
// 사이드바 안에 중첩해도 화면 크기가 아니라 그 자리 기준으로 접힌다.

// MARK: - Split — 양끝 배치

/// 양끝 배치 — 웹 `<jd-split>`.
///
/// ```swift
/// JdSplit {
///     Text("주문 내역").font(.headline)
///     JdHStackView { exportButton; newButton }   // 오른쪽은 묶어서 하나로
/// }
/// ```
///
/// 자식이 둘이면 양끝, 셋 이상이면 균등 분배된다(웹 `space-between` 동형).
public struct JdSplit: Layout {
    private let spacing: CGFloat
    private let alignment: JdAlign

    public init(spacing: CGFloat = JdToken.Space.s4, alignment: JdAlign = .center) {
        self.spacing = spacing
        self.alignment = alignment
    }

    public func sizeThatFits(
        proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) -> CGSize {
        let sizes = subviews.map { $0.sizeThatFits(.unspecified) }
        let natural = sizes.map(\.width).reduce(0, +) + spacing * CGFloat(max(sizes.count - 1, 0))
        return CGSize(
            width: proposal.width ?? natural,
            height: sizes.map(\.height).max() ?? 0)
    }

    public func placeSubviews(
        in bounds: CGRect, proposal: ProposedViewSize,
        subviews: Subviews, cache: inout ()
    ) {
        let sizes = subviews.map { $0.sizeThatFits(.unspecified) }
        guard !sizes.isEmpty else { return }
        let used = sizes.map(\.width).reduce(0, +)
        // 남는 공간을 자식 **사이**에만 나눈다. 양끝에도 나누면 가운데로 모인다(그건 Center다).
        // 최소 간격은 지킨다 — 자식이 꽉 차면 겹치는 대신 spacing만 남는다.
        let slack = max(bounds.width - used, 0)
        let gaps = max(sizes.count - 1, 1)
        let gap = sizes.count > 1 ? max(slack / CGFloat(gaps), spacing) : 0

        var x = bounds.minX
        for (index, subview) in subviews.enumerated() {
            let size = sizes[index]
            subview.place(
                at: CGPoint(x: x, y: alignedY(in: bounds, height: size.height)),
                proposal: ProposedViewSize(size))
            x += size.width + gap
        }
    }

    private func alignedY(in bounds: CGRect, height: CGFloat) -> CGFloat {
        switch alignment {
        case .start, .baseline: return bounds.minY
        case .center: return bounds.minY + (bounds.height - height) / 2
        case .end: return bounds.maxY - height
        case .stretch: return bounds.minY
        }
    }
}

// MARK: - Switcher — 좁으면 세로

/// 자리가 좁으면 알아서 세로로 쌓이는 배치 — 웹 `<jd-switcher>`.
///
/// ```swift
/// JdSwitcher { leftCard; rightCard }           // 임계값을 고르지 않아도 동작한다
/// JdSwitcher(threshold: .md) { a; b; c }
/// ```
///
/// 임계값은 브레이크포인트 이름 — `jdShow(above:)`·웹 `threshold="md"`와 같은 어휘다.
/// 가로일 때 자식은 폭을 균등하게 나눈다(웹 `flex-grow: 1; flex-basis: 0` 동형).
public struct JdSwitcher: Layout {
    private let threshold: JdBreakpoint
    private let spacing: CGFloat

    public init(threshold: JdBreakpoint = .sm, spacing: CGFloat = JdToken.Space.s4) {
        self.threshold = threshold
        self.spacing = spacing
    }

    /// 폭 제안이 없으면(무한 폭 문의) 가로로 본다 — 스크롤뷰 안에서 세로로 접히지 않게.
    private func isHorizontal(width: CGFloat?) -> Bool {
        guard let width, width.isFinite else { return true }
        return width >= threshold.width
    }

    public func sizeThatFits(
        proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) -> CGSize {
        let count = CGFloat(subviews.count)
        guard count > 0 else { return .zero }
        let totalSpacing = spacing * (count - 1)

        if isHorizontal(width: proposal.width) {
            let width =
                proposal.width ?? subviews.map { $0.sizeThatFits(.unspecified).width }
                .reduce(0, +) + totalSpacing
            let each = max((width - totalSpacing) / count, 0)
            let height =
                subviews
                .map { $0.sizeThatFits(ProposedViewSize(width: each, height: nil)).height }
                .max() ?? 0
            return CGSize(width: width, height: height)
        }

        let width =
            proposal.width ?? subviews.map { $0.sizeThatFits(.unspecified).width }.max() ?? 0
        let height =
            subviews
            .map { $0.sizeThatFits(ProposedViewSize(width: width, height: nil)).height }
            .reduce(0, +) + totalSpacing
        return CGSize(width: width, height: height)
    }

    public func placeSubviews(
        in bounds: CGRect, proposal: ProposedViewSize,
        subviews: Subviews, cache: inout ()
    ) {
        let count = CGFloat(subviews.count)
        guard count > 0 else { return }
        let totalSpacing = spacing * (count - 1)

        if isHorizontal(width: bounds.width) {
            let each = max((bounds.width - totalSpacing) / count, 0)
            var x = bounds.minX
            for subview in subviews {
                subview.place(
                    at: CGPoint(x: x, y: bounds.minY),
                    proposal: ProposedViewSize(width: each, height: bounds.height))
                x += each + spacing
            }
            return
        }

        var y = bounds.minY
        for subview in subviews {
            let height = subview.sizeThatFits(
                ProposedViewSize(width: bounds.width, height: nil)
            ).height
            subview.place(
                at: CGPoint(x: bounds.minX, y: y),
                proposal: ProposedViewSize(width: bounds.width, height: height))
            y += height + spacing
        }
    }
}

// MARK: - SidebarLayout — 사이드바 + 본문

// JdSidebarSide는 Core에 있다 — UIKit·SwiftUI 두 계통이 같은 값을 쓰므로
// 어느 한쪽에 두면 우산 타겟에서 같은 이름이 둘이 되어 소비자 쪽이 모호해진다.

/// 사이드바 + 본문, 본문이 최소 폭을 못 지키면 쌓임 — 웹 `<jd-sidebar-layout>`.
///
/// ```swift
/// JdSidebarLayout(sideWidth: 240, contentMin: 320) {
///     tableOfContents
///     article
/// }
/// ```
///
/// 첫 자식이 사이드바, 두 번째가 본문이다.
///
/// **꺾이는 폭을 적지 않는다.** `sideWidth + spacing + contentMin`을 못 담는 순간
/// 쌓이므로 사이드바 폭을 바꾸면 꺾이는 지점이 따라온다 — 웹에서 본문
/// `min-inline-size`가 임계값을 대신하는 것과 같은 구조다.
public struct JdSidebarLayout: Layout {
    private let sideWidth: CGFloat
    private let contentMin: CGFloat
    private let spacing: CGFloat
    private let side: JdSidebarSide

    public init(
        sideWidth: CGFloat = 256,
        contentMin: CGFloat = 320,
        spacing: CGFloat = JdToken.Space.s6,
        side: JdSidebarSide = .start
    ) {
        self.sideWidth = sideWidth
        self.contentMin = contentMin
        self.spacing = spacing
        self.side = side
    }

    private var neededWidth: CGFloat { sideWidth + spacing + contentMin }

    private func isSideBySide(width: CGFloat?) -> Bool {
        guard let width, width.isFinite else { return true }
        return width >= neededWidth
    }

    public func sizeThatFits(
        proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) -> CGSize {
        guard subviews.count == 2 else {
            // 자식이 둘이 아니면 이 배치의 의미가 없다. 크래시 대신 세로로 쌓아 두고
            // 개발 빌드에서만 알린다 — 릴리스에서 화면이 빈 것보다 낫다.
            assertionFailure("JdSidebarLayout은 자식이 정확히 둘이다 — \(subviews.count)개를 받았다")
            return stackedSize(proposal: proposal, subviews: subviews)
        }
        let width = proposal.width ?? neededWidth
        guard isSideBySide(width: width) else {
            return stackedSize(proposal: proposal, subviews: subviews)
        }
        let contentWidth = max(width - sideWidth - spacing, 0)
        let sideHeight = subviews[0].sizeThatFits(
            ProposedViewSize(width: sideWidth, height: nil)
        ).height
        let contentHeight = subviews[1].sizeThatFits(
            ProposedViewSize(width: contentWidth, height: nil)
        ).height
        return CGSize(width: width, height: max(sideHeight, contentHeight))
    }

    public func placeSubviews(
        in bounds: CGRect, proposal: ProposedViewSize,
        subviews: Subviews, cache: inout ()
    ) {
        guard subviews.count == 2, isSideBySide(width: bounds.width) else {
            placeStacked(in: bounds, subviews: subviews)
            return
        }
        let contentWidth = max(bounds.width - sideWidth - spacing, 0)
        // 시각 순서만 뒤집는다 — 자식 순서(=접근성·탭 순서)는 그대로 둔다.
        // 웹이 마크업을 유지한 채 `order: 1`만 쓰는 것과 같은 선택이다.
        let sideX = side == .start ? bounds.minX : bounds.minX + contentWidth + spacing
        let contentX = side == .start ? bounds.minX + sideWidth + spacing : bounds.minX

        subviews[0].place(
            at: CGPoint(x: sideX, y: bounds.minY),
            proposal: ProposedViewSize(width: sideWidth, height: bounds.height))
        subviews[1].place(
            at: CGPoint(x: contentX, y: bounds.minY),
            proposal: ProposedViewSize(width: contentWidth, height: bounds.height))
    }

    // MARK: 쌓인 상태 — 둘 다 한 줄을 다 쓴다

    private func stackedSize(proposal: ProposedViewSize, subviews: Subviews) -> CGSize {
        let width =
            proposal.width ?? subviews.map { $0.sizeThatFits(.unspecified).width }.max() ?? 0
        let height =
            subviews
            .map { $0.sizeThatFits(ProposedViewSize(width: width, height: nil)).height }
            .reduce(0, +) + spacing * CGFloat(max(subviews.count - 1, 0))
        return CGSize(width: width, height: height)
    }

    private func placeStacked(in bounds: CGRect, subviews: Subviews) {
        var y = bounds.minY
        for subview in subviews {
            let height = subview.sizeThatFits(
                ProposedViewSize(width: bounds.width, height: nil)
            ).height
            subview.place(
                at: CGPoint(x: bounds.minX, y: y),
                proposal: ProposedViewSize(width: bounds.width, height: height))
            y += height + spacing
        }
    }
}
