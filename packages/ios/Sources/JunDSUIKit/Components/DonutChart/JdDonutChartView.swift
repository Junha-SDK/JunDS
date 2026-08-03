import JunDSCore
import UIKit

// 웹 DonutChart 동형 — 구성비 도넛. (DEC-049)
//
// 각도·비율은 Core(JdDonutChartGeometry)가 만들고 여기서는 호(arc)만 긋는다.
public final class JdDonutChartView: UIView {

    public var slices: [JdDonutSlice] {
        didSet { setNeedsDisplay() }
    }

    public var centerLabel: String? {
        didSet { setNeedsDisplay() }
    }

    public var centerValue: String? {
        didSet { setNeedsDisplay() }
    }

    /// 라벨이 있으면 정보(role=img), 없으면 장식
    public var label: String? {
        didSet { applyAccessibility() }
    }

    private let chartSize: CGFloat
    private let thickness: CGFloat

    public init(
        slices: [JdDonutSlice],
        size: CGFloat = 220,
        thickness: CGFloat = 28,
        centerLabel: String? = nil,
        centerValue: String? = nil,
        label: String? = nil
    ) {
        self.slices = slices
        self.chartSize = size
        self.thickness = thickness
        self.centerLabel = centerLabel
        self.centerValue = centerValue
        self.label = label
        super.init(frame: .zero)
        backgroundColor = .clear
        isOpaque = false
        applyAccessibility()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        CGSize(width: chartSize, height: chartSize)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        setNeedsDisplay()
    }

    public override func draw(_ rect: CGRect) {
        let g = JdDonutChartGeometry.resolve(
            slices: slices,
            size: min(bounds.width, bounds.height),
            thickness: thickness)
        guard g.radius > 0 else { return }

        // 배경 링 — 조각이 원을 다 못 채워도 트랙이 보인다
        let track = UIBezierPath(
            ovalIn: CGRect(
                x: g.center.x - g.radius, y: g.center.y - g.radius,
                width: g.radius * 2, height: g.radius * 2))
        track.lineWidth = g.thickness
        JdChartTheme.grid.uiColor.resolvedColor(with: traitCollection).setStroke()
        track.stroke()

        for segment in g.segments {
            let arc = UIBezierPath(
                arcCenter: g.center, radius: g.radius,
                startAngle: CGFloat(segment.startAngle),
                endAngle: CGFloat(segment.endAngle),
                clockwise: true)
            arc.lineWidth = g.thickness
            arc.lineCapStyle = .butt
            segment.color.uiColor.resolvedColor(with: traitCollection).setStroke()
            arc.stroke()
        }

        if let centerLabel {
            JdChartDraw.text(
                centerLabel,
                at: CGPoint(
                    x: g.center.x,
                    y: g.center.y + JdDonutChartGeometry.centerLabelOffsetY),
                size: JdDonutChartGeometry.centerLabelFontSize,
                weight: JdToken.FontWeight.bold,
                color: JdChartTheme.axis.uiColor.resolvedColor(with: traitCollection),
                anchor: .center)
        }
        if let centerValue {
            JdChartDraw.text(
                centerValue,
                at: CGPoint(
                    x: g.center.x,
                    y: g.center.y + JdDonutChartGeometry.centerValueOffsetY),
                size: JdDonutChartGeometry.centerValueFontSize,
                weight: 800,
                color: JdToken.Color.foreground.uiColor.resolvedColor(with: traitCollection),
                anchor: .center)
        }
    }

    private func applyAccessibility() {
        isAccessibilityElement = label != nil
        accessibilityTraits = label != nil ? .image : []
        accessibilityLabel = label
    }
}
