import JunDSCore
import UIKit

// 웹 QuarterBarChart 동형 — 분기 매출·이익 짝 막대. (DEC-049)
//
// 막대 rect·눈금은 Core(JdQuarterBarChartGeometry)가 만들고 여기서는 칠하기만 한다.
public final class JdQuarterBarChartView: UIView {

    public var data: [JdQuarterRow] {
        didSet { setNeedsDisplay() }
    }

    public var metric: JdQuarterBarMetric {
        didSet { setNeedsDisplay() }
    }

    /// 라벨이 있으면 정보(role=img), 없으면 장식
    public var label: String? {
        didSet { applyAccessibility() }
    }

    private let chartWidth: CGFloat
    private let chartHeight: CGFloat

    public init(
        data: [JdQuarterRow],
        metric: JdQuarterBarMetric = .revenueOp,
        width: CGFloat = 380,
        height: CGFloat = 220,
        label: String? = nil
    ) {
        self.data = data
        self.metric = metric
        self.chartWidth = width
        self.chartHeight = height
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
        CGSize(width: chartWidth, height: chartHeight)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        setNeedsDisplay()
    }

    public override func draw(_ rect: CGRect) {
        guard
            let g = JdQuarterBarChartGeometry.resolve(
                data: data, metric: metric,
                width: bounds.width, height: bounds.height)
        else { return }
        let gridColor = JdChartTheme.grid.uiColor.resolvedColor(with: traitCollection)
        let axisColor = JdChartTheme.axis.uiColor.resolvedColor(with: traitCollection)
        let primary = JdQuarterBarChartGeometry.primaryColor.uiColor
            .resolvedColor(with: traitCollection)
        let secondary = JdQuarterBarChartGeometry.secondaryColor(metric).uiColor
            .resolvedColor(with: traitCollection)

        // 격자 + 왼쪽 눈금 라벨(천단위)
        for tick in g.ticks {
            let y = g.scale.y(tick, in: g.frame)
            let line = UIBezierPath()
            line.move(to: CGPoint(x: g.frame.padL, y: y))
            line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
            gridColor.setStroke()
            line.lineWidth = 1
            line.stroke()
            JdChartDraw.text(
                JdNumberFormat.string(value: tick.rounded(), decimals: 0),
                at: CGPoint(x: g.frame.padL - 6, y: y),
                size: 10, weight: JdToken.FontWeight.normal,
                color: axisColor, anchor: .trailing)
        }

        // 짝 막대 + 분기 라벨
        let corner = JdQuarterBarChartGeometry.cornerRadius
        for bar in g.bars {
            primary.setFill()
            UIBezierPath(roundedRect: bar.primaryRect, cornerRadius: corner).fill()
            secondary.setFill()
            UIBezierPath(roundedRect: bar.secondaryRect, cornerRadius: corner).fill()
            JdChartDraw.text(
                bar.label,
                at: CGPoint(x: bar.centerX, y: bounds.height - 8),
                size: 10, weight: JdToken.FontWeight.semibold,
                color: axisColor, anchor: .center)
        }

        // 상단 범례 — 매출 · 영업이익|순이익 (웹 x 오프셋 0/56 동형)
        let foreground = JdToken.Color.foreground.uiColor.resolvedColor(with: traitCollection)
        let legendY = g.frame.padT - 4
        let entries: [(UIColor, String)] = [(primary, "매출"), (secondary, metric.secondaryLabel)]
        var cursor = g.frame.padL
        for (color, text) in entries {
            color.setFill()
            UIBezierPath(
                roundedRect: CGRect(x: cursor, y: legendY - 2, width: 9, height: 9),
                cornerRadius: 2
            ).fill()
            JdChartDraw.text(
                text,
                at: CGPoint(x: cursor + 13, y: legendY + 2.5),
                size: 10, weight: JdToken.FontWeight.bold,
                color: foreground, anchor: .leading)
            cursor += 56
        }
    }

    private func applyAccessibility() {
        isAccessibilityElement = label != nil
        accessibilityTraits = label != nil ? .image : []
        accessibilityLabel = label
    }
}
