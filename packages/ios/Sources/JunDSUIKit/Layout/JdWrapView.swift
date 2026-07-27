import UIKit
import JunDSCore

/// 랩(줄바꿈) 컨테이너 — 웹 `jd-group`(row·wrap) / `jd-wrap` 동형, SwiftUI `JdFlowLayout`의
/// UIKit 대응. (DEC-041)
///
/// 왜 필요한가: UIKit엔 랩 컨테이너가 없었다. `UIStackView`는 줄바꿈을 못 하고, RECIPES는
/// 격자를 `UICollectionViewCompositionalLayout`으로 **소비자가 직접 짜라**고 안내했다.
/// 그래서 "칩 N개를 폭에 맞춰 흘려 놓는다"처럼 웹에서 한 줄이던 배치가 iOS에서는 컬렉션
/// 뷰 한 채를 세우는 일이 됐다. 이 뷰가 그 공백을 메운다 — finance KPI 행처럼 **개수가
/// 런타임에 정해지는 배치**를 컴포넌트가 스스로 소유할 수 있게 하는 것이 목적이다.
///
/// 계약:
/// - 좌→우로 흘리고 폭이 모자라면 다음 행. 행 안에서는 세로 중앙 정렬(웹 `align-items: center`).
/// - `itemSpacing`은 행 안 간격, `lineSpacing`은 행 사이 간격. 웹의 단일 `gap`을 쓰려면
///   `lineSpacing`을 생략한다(itemSpacing과 같아진다).
/// - 자식 크기는 `JdMeasure`가 묻는다(내부 제약 → sizeThatFits → intrinsic 순). 그래서
///   Auto Layout로 짜인 카드도, 스스로 배치하는 뷰도, 라벨도 전부 측정된다. 폭이
///   컨테이너보다 넓은 자식은 한 행을 혼자 쓰고 컨테이너 폭으로 줄어든다.
/// - `equalWidths`를 켜면 한 행의 아이템이 같은 폭을 나눠 갖는다(KPI 셀처럼 격자로 보여야
///   할 때). 끄면 각자 고유 폭을 쓴다(칩·태그처럼).
///
/// RTL: `effectiveUserInterfaceLayoutDirection`을 보고 배치 방향을 뒤집는다.
public final class JdWrapView: UIView {

    public var itemSpacing: CGFloat {
        didSet { invalidateLayout() }
    }

    public var lineSpacing: CGFloat {
        didSet { invalidateLayout() }
    }

    /// 한 행의 아이템이 폭을 균등 분할한다(격자형). 기본은 false(고유 폭).
    public var equalWidths: Bool {
        didSet { invalidateLayout() }
    }

    /// equalWidths일 때 한 행에 넣을 최대 개수. nil이면 폭이 허용하는 만큼.
    /// KPI 4셀을 "2×2로 고정"하고 싶을 때 쓴다.
    public var maxPerLine: Int? {
        didSet { invalidateLayout() }
    }

    /// equalWidths일 때 아이템 최소 폭 — 이보다 좁아지면 행 개수를 줄인다
    public var minItemWidth: CGFloat {
        didSet { invalidateLayout() }
    }

    private var items: [UIView] = []

    public init(itemSpacing: CGFloat = JdToken.Space.s2,
                lineSpacing: CGFloat? = nil,
                equalWidths: Bool = false,
                maxPerLine: Int? = nil,
                minItemWidth: CGFloat = 0,
                _ views: [UIView] = []) {
        self.itemSpacing = itemSpacing
        self.lineSpacing = lineSpacing ?? itemSpacing
        self.equalWidths = equalWidths
        self.maxPerLine = maxPerLine
        self.minItemWidth = minItemWidth
        super.init(frame: .zero)
        setItems(views)
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // MARK: - 내용

    /// 자식을 통째로 교체한다. 개수가 런타임에 변하는 배치가 이 뷰의 주 용도다.
    public func setItems(_ views: [UIView]) {
        for old in items where old.superview === self {
            old.removeFromSuperview()
        }
        items = views
        for view in views {
            view.translatesAutoresizingMaskIntoConstraints = true // frame 배치
            addSubview(view)
        }
        invalidateLayout()
    }

    public var arrangedViews: [UIView] { items }

    // MARK: - 레이아웃
    //
    // Auto Layout 제약을 걸지 않고 frame으로 배치한다: 아이템 수가 런타임에 바뀔 때
    // 제약을 매번 세우고 허무는 비용(그리고 제약 충돌 로그)이 랩 배치에서는 순손실이다.
    // 대신 intrinsicContentSize를 정확히 보고해 부모의 Auto Layout에는 정상 참여한다.

    public override func layoutSubviews() {
        super.layoutSubviews()
        _ = arrange(in: bounds.width, place: true)
    }

    public override var intrinsicContentSize: CGSize {
        // 폭이 아직 없으면 높이를 알 수 없다 — UIView.noIntrinsicMetric으로 부모에게 넘긴다
        guard bounds.width > 0 else {
            return CGSize(width: UIView.noIntrinsicMetric, height: UIView.noIntrinsicMetric)
        }
        return CGSize(width: UIView.noIntrinsicMetric, height: arrange(in: bounds.width, place: false))
    }

    public override func sizeThatFits(_ size: CGSize) -> CGSize {
        CGSize(width: size.width, height: arrange(in: size.width, place: false))
    }

    private func invalidateLayout() {
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }

    /// 한 번의 순회로 배치와 높이 계산을 겸한다(place=false면 계산만).
    /// 반환값은 필요한 전체 높이.
    @discardableResult
    private func arrange(in maxWidth: CGFloat, place: Bool) -> CGFloat {
        guard !items.isEmpty, maxWidth > 0 else { return 0 }
        let isRTL = effectiveUserInterfaceLayoutDirection == .rightToLeft

        if equalWidths {
            return arrangeGrid(in: maxWidth, place: place, isRTL: isRTL)
        }
        return arrangeFlow(in: maxWidth, place: place, isRTL: isRTL)
    }

    /// 고유 폭 흐름 — 칩·태그용
    private func arrangeFlow(in maxWidth: CGFloat, place: Bool, isRTL: Bool) -> CGFloat {
        var y: CGFloat = 0
        var index = 0
        while index < items.count {
            // 이 행에 들어갈 아이템을 모은다
            var line: [(view: UIView, size: CGSize)] = []
            var used: CGFloat = 0
            while index < items.count {
                let view = items[index]
                // 측정은 JdMeasure 단일 규칙 — sizeThatFits만 묻던 옛 코드는 내부 제약으로
                // 크기가 정해지는 뷰에 0을 받아 아이템이 사라졌다 (DEC-046)
                let size = JdMeasure.size(of: view, width: maxWidth)
                let needed = line.isEmpty ? size.width : used + itemSpacing + size.width
                if !line.isEmpty && needed > maxWidth { break }
                line.append((view, size))
                used = needed
                index += 1
            }
            let lineHeight = line.map(\.size.height).max() ?? 0
            if place { placeLine(line, y: y, lineHeight: lineHeight, maxWidth: maxWidth, isRTL: isRTL) }
            y += lineHeight + lineSpacing
        }
        return max(0, y - lineSpacing)
    }

    /// 균등 분할 격자 — KPI 셀용. 한 행 개수는 minItemWidth·maxPerLine이 함께 정한다.
    private func arrangeGrid(in maxWidth: CGFloat, place: Bool, isRTL: Bool) -> CGFloat {
        let perLine = resolvePerLine(maxWidth: maxWidth)
        let totalSpacing = itemSpacing * CGFloat(perLine - 1)
        let itemWidth = max(0, (maxWidth - totalSpacing) / CGFloat(perLine))

        var y: CGFloat = 0
        var index = 0
        while index < items.count {
            let slice = Array(items[index..<min(index + perLine, items.count)])
            let sized = slice.map { view -> (view: UIView, size: CGSize) in
                // 격자는 폭을 강제한다 — 그래서 열이 맞는다. 높이는 그 폭에서 측정한다.
                let size = JdMeasure.size(of: view, width: itemWidth)
                return (view, CGSize(width: itemWidth, height: size.height))
            }
            // 한 행의 셀 높이를 가장 큰 것으로 맞춘다(격자가 들쭉날쭉해지지 않게)
            let lineHeight = sized.map(\.size.height).max() ?? 0
            let stretched = sized.map { ($0.view, CGSize(width: itemWidth, height: lineHeight)) }
            if place { placeLine(stretched, y: y, lineHeight: lineHeight, maxWidth: maxWidth, isRTL: isRTL) }
            y += lineHeight + lineSpacing
            index += perLine
        }
        return max(0, y - lineSpacing)
    }

    private func resolvePerLine(maxWidth: CGFloat) -> Int {
        var perLine = items.count
        if let cap = maxPerLine, cap > 0 { perLine = min(perLine, cap) }
        if minItemWidth > 0 {
            // (n × min) + ((n-1) × spacing) <= maxWidth 를 만족하는 최대 n
            let fitting = Int(((maxWidth + itemSpacing) / (minItemWidth + itemSpacing)).rounded(.down))
            perLine = min(perLine, max(1, fitting))
        }
        return max(1, perLine)
    }

    private func placeLine(_ line: [(view: UIView, size: CGSize)],
                           y: CGFloat,
                           lineHeight: CGFloat,
                           maxWidth: CGFloat,
                           isRTL: Bool) {
        var x: CGFloat = 0
        for (view, size) in line {
            // 행 안 세로 중앙 정렬 (웹 align-items: center)
            let originY = y + (lineHeight - size.height) / 2
            let originX = isRTL ? maxWidth - x - size.width : x
            view.frame = CGRect(x: originX, y: originY, width: size.width, height: size.height)
            x += size.width + itemSpacing
        }
    }
}
