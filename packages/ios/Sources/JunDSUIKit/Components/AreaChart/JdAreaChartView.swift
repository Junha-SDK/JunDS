import JunDSCore
import UIKit

// 웹 AreaChart 동형 — 기준선 위/아래를 색으로 가르는 단일 시리즈 영역 차트. (DEC-049)
//
// 좌표·눈금·추세는 Core(JdAreaChartGeometry)가 만들고 여기서는 draw(_:) 한 패스로
// 그린다 — CAShapeLayer를 쌓지 않는다. hover 툴팁(DOM 전용)은 옮기지 않았다.
public final class JdAreaChartView: UIView {

    /// 비수치는 대입 시점에 거른다 — 좌표 하나가 NaN이면 path 전체가 조용히 사라진다
    public var values: [Double] {
        didSet {
            values = JdChartGeometry.sanitize(values)
            setNeedsDisplay()
        }
    }

    public var baseline: Double? {
        didSet { setNeedsDisplay() }
    }

    /// 라벨이 있으면 정보(role=img), 없으면 장식
    public var label: String? {
        didSet { applyAccessibility() }
    }

    private let chartWidth: CGFloat
    private let chartHeight: CGFloat

    public init(
        values: [Double],
        baseline: Double? = nil,
        width: CGFloat = 380,
        height: CGFloat = 200,
        label: String? = nil
    ) {
        self.values = JdChartGeometry.sanitize(values)
        self.baseline = baseline
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
        guard let ctx = UIGraphicsGetCurrentContext(),
            let g = JdAreaChartGeometry.resolve(
                data: values, baseline: baseline,
                width: bounds.width, height: bounds.height)
        else { return }
        let stroke = JdFinanceTheme.color(g.trend).uiColor.resolvedColor(with: traitCollection)
        let gridColor = JdChartTheme.grid.uiColor.resolvedColor(with: traitCollection)
        let axisColor = JdChartTheme.axis.uiColor.resolvedColor(with: traitCollection)

        // 격자 + 왼쪽 눈금 라벨
        for tick in g.ticks {
            let y = g.y(of: tick)
            let line = UIBezierPath()
            line.move(to: CGPoint(x: g.frame.padL, y: y))
            line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
            gridColor.setStroke()
            line.lineWidth = 1
            line.stroke()
            JdChartDraw.text(
                String(format: "%.0f", tick),
                at: CGPoint(x: g.frame.padL - 6, y: y),
                size: 10, weight: JdToken.FontWeight.normal,
                color: axisColor, anchor: .trailing)
        }

        // 기준선(점선)
        let baselinePath = UIBezierPath()
        baselinePath.move(to: CGPoint(x: g.frame.padL, y: g.baselineY))
        baselinePath.addLine(to: CGPoint(x: g.frame.plotRight, y: g.baselineY))
        baselinePath.setLineDash([3, 3], count: 2, phase: 0)
        axisColor.setStroke()
        baselinePath.lineWidth = 1
        baselinePath.stroke()

        // 채움 — 기준선까지 닫은 경로를 기준선 위/아래로 나눠 각각 up/down 그라디언트
        if g.points.count >= 2 {
            let closed = UIBezierPath()
            closed.move(to: g.points[0])
            for point in g.points.dropFirst() { closed.addLine(to: point) }
            closed.addLine(to: CGPoint(x: g.points[g.points.count - 1].x, y: g.baselineY))
            closed.addLine(to: CGPoint(x: g.points[0].x, y: g.baselineY))
            closed.close()

            let upColor = JdFinanceTheme.up.uiColor.resolvedColor(with: traitCollection)
            let downColor = JdFinanceTheme.down.uiColor.resolvedColor(with: traitCollection)
            let top = CGFloat(JdAreaChartGeometry.fillTopAlpha)
            let bottom = CGFloat(JdAreaChartGeometry.fillBottomAlpha)

            fillGradient(
                ctx, path: closed,
                clip: CGRect(
                    x: 0, y: g.frame.padT,
                    width: bounds.width, height: max(0, g.baselineY - g.frame.padT)),
                colors: [
                    upColor.withAlphaComponent(top).cgColor,
                    upColor.withAlphaComponent(bottom).cgColor,
                ],
                from: g.frame.padT, to: g.frame.plotBottom)
            fillGradient(
                ctx, path: closed,
                clip: CGRect(
                    x: 0, y: g.baselineY,
                    width: bounds.width, height: max(0, g.frame.plotBottom - g.baselineY)),
                colors: [
                    downColor.withAlphaComponent(bottom).cgColor,
                    downColor.withAlphaComponent(top).cgColor,
                ],
                from: g.frame.padT, to: g.frame.plotBottom)
        }

        // 본선
        if g.points.count >= 2 {
            let line = UIBezierPath()
            line.move(to: g.points[0])
            for point in g.points.dropFirst() { line.addLine(to: point) }
            line.lineWidth = JdAreaChartGeometry.strokeWidth
            line.lineCapStyle = .round
            line.lineJoinStyle = .round
            stroke.setStroke()
            line.stroke()
        }

        // 끝점 — 헤일로가 점보다 커서 마지막 값을 눈이 먼저 찾는다
        if let last = g.points.last {
            let halo = JdAreaChartGeometry.haloRadius
            stroke.withAlphaComponent(0.18).setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: last.x - halo, y: last.y - halo, width: halo * 2, height: halo * 2)
            ).fill()
            let dot = JdAreaChartGeometry.dotRadius
            stroke.setFill()
            UIBezierPath(
                ovalIn: CGRect(x: last.x - dot, y: last.y - dot, width: dot * 2, height: dot * 2)
            ).fill()
        }
    }

    private func fillGradient(
        _ ctx: CGContext, path: UIBezierPath, clip: CGRect,
        colors: [CGColor], from: CGFloat, to: CGFloat
    ) {
        guard clip.height > 0,
            let gradient = CGGradient(
                colorsSpace: CGColorSpaceCreateDeviceRGB(),
                colors: colors as CFArray, locations: [0, 1])
        else { return }
        ctx.saveGState()
        ctx.clip(to: clip)
        ctx.addPath(path.cgPath)
        ctx.clip()
        ctx.drawLinearGradient(
            gradient,
            start: CGPoint(x: 0, y: from),
            end: CGPoint(x: 0, y: to),
            options: [])
        ctx.restoreGState()
    }

    private func applyAccessibility() {
        isAccessibilityElement = label != nil
        accessibilityTraits = label != nil ? .image : []
        accessibilityLabel = label
    }
}
