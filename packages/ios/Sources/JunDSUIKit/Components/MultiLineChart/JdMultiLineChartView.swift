import JunDSCore
import UIKit

// 웹 MultiLineChart 동형 — 다중 시리즈 비교 라인 차트(기본: 첫 값 = 0% 정규화). (DEC-049)
//
// 좌표·정규화·눈금은 Core(JdMultiLineChartGeometry)가 만들고 여기서는 draw(_:) 한
// 패스로 그린다. hover 툴팁(DOM 전용)은 옮기지 않았다.
public final class JdMultiLineChartView: UIView {

    public var series: [JdChartSeries] {
        didSet { setNeedsDisplay() }
    }

    public var normalize: Bool {
        didSet { setNeedsDisplay() }
    }

    public var unit: String {
        didSet { setNeedsDisplay() }
    }

    public var showsLegend: Bool {
        didSet { setNeedsDisplay() }
    }

    /// 라벨이 있으면 정보(role=img), 없으면 장식
    public var label: String? {
        didSet { applyAccessibility() }
    }

    private let chartWidth: CGFloat
    private let chartHeight: CGFloat

    public init(
        series: [JdChartSeries],
        normalize: Bool = true,
        unit: String = "%",
        showsLegend: Bool = true,
        width: CGFloat = 380,
        height: CGFloat = 220,
        label: String? = nil
    ) {
        self.series = series
        self.normalize = normalize
        self.unit = unit
        self.showsLegend = showsLegend
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
            let g = JdMultiLineChartGeometry.resolve(
                series: series, normalize: normalize,
                width: bounds.width, height: bounds.height,
                showLegend: showsLegend)
        else { return }
        let gridColor = JdChartTheme.grid.uiColor.resolvedColor(with: traitCollection)
        let axisColor = JdChartTheme.axis.uiColor.resolvedColor(with: traitCollection)

        // 격자 + 왼쪽 눈금 라벨(±부호 포함)
        for tick in g.ticks {
            let y = g.scale.y(tick, in: g.frame)
            let line = UIBezierPath()
            line.move(to: CGPoint(x: g.frame.padL, y: y))
            line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
            gridColor.setStroke()
            line.lineWidth = 1
            line.stroke()
            JdChartDraw.text(
                JdMultiLineChartGeometry.tickText(tick, unit: unit),
                at: CGPoint(x: g.frame.padL - 6, y: y),
                size: 10, weight: JdToken.FontWeight.normal,
                color: axisColor, anchor: .trailing)
        }

        // 0선(점선)
        let zero = UIBezierPath()
        zero.move(to: CGPoint(x: g.frame.padL, y: g.zeroY))
        zero.addLine(to: CGPoint(x: g.frame.plotRight, y: g.zeroY))
        zero.setLineDash([3, 3], count: 2, phase: 0)
        axisColor.setStroke()
        zero.lineWidth = 1
        zero.stroke()

        // 시리즈 선 + 끝점(흰 테두리 — 겹친 선 위에서 점을 세운다, 웹 리터럴 동형)
        for (index, points) in g.seriesPoints.enumerated() {
            let color = series[index].color.uiColor.resolvedColor(with: traitCollection)
            if points.count >= 2 {
                let line = UIBezierPath()
                line.move(to: points[0])
                for point in points.dropFirst() { line.addLine(to: point) }
                line.lineWidth = JdMultiLineChartGeometry.strokeWidth
                line.lineCapStyle = .round
                line.lineJoinStyle = .round
                color.setStroke()
                line.stroke()
            }
            if let last = points.last {
                let r = JdMultiLineChartGeometry.endDotRadius
                let dot = UIBezierPath(
                    ovalIn: CGRect(x: last.x - r, y: last.y - r, width: r * 2, height: r * 2))
                color.setFill()
                dot.fill()
                UIColor.white.setStroke()
                dot.lineWidth = 1.5
                dot.stroke()
            }
        }

        // 인라인 범례 — 웹의 90pt 간격 나이브 배치 동형
        if showsLegend {
            for (index, s) in series.enumerated() {
                let x = g.frame.padL + CGFloat(index) * 90
                let swatch = UIBezierPath(
                    roundedRect: CGRect(x: x, y: bounds.height - 11, width: 10, height: 3),
                    cornerRadius: 1.5)
                s.color.uiColor.resolvedColor(with: traitCollection).setFill()
                swatch.fill()
                JdChartDraw.text(
                    s.name,
                    at: CGPoint(x: x + 14, y: bounds.height - 9.5),
                    size: 10, weight: JdToken.FontWeight.bold,
                    color: axisColor, anchor: .leading)
            }
        }
    }

    private func applyAccessibility() {
        isAccessibilityElement = label != nil
        accessibilityTraits = label != nil ? .image : []
        accessibilityLabel = label
    }
}
