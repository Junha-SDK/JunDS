import JunDSCore
import UIKit

// 웹 jd-sparkline 동형 — 추세 스파크라인. (DEC-049)
//
// 좌표는 Core(JdChartGeometry)가 만들고 여기서는 그리기만 한다.
// UIKit은 `draw(_:)`로 그린다 — CAShapeLayer 4장을 쌓는 대신 한 번의 패스에 담는다.
// (레이어를 쌓으면 데이터가 바뀔 때마다 4장을 갱신·정렬해야 하고, 스파크라인은 작고
//  자주 바뀌는 물건이라 그 비용이 그대로 드러난다.)
public final class JdSparklineView: UIView {

    /// 비수치는 대입 시점에 거른다 — 좌표 하나가 NaN이면 선 전체가 조용히 사라진다
    public var values: [Double] {
        didSet { resolveAndApply() }
    }

    public var showsFill: Bool { didSet { setNeedsDisplay() } }
    public var showsBaseline: Bool { didSet { setNeedsDisplay() } }
    public var showsDot: Bool { didSet { setNeedsDisplay() } }

    /// 명시 색. nil이면 추세가 정한다.
    public var color: JdDynamicColor? {
        didSet { resolveAndApply() }
    }

    /// 라벨이 있으면 정보(role=img), 없으면 장식 — 웹 v2엔 이 구분이 없었다
    public var label: String? {
        didSet { applyAccessibility() }
    }

    private var spec: JdSparklineSpec

    public init(
        values: [Double],
        width: CGFloat = 80,
        height: CGFloat = 24,
        strokeWidth: CGFloat = 1.6,
        color: JdDynamicColor? = nil,
        showsFill: Bool = false,
        showsBaseline: Bool = false,
        showsDot: Bool = true,
        label: String? = nil
    ) {
        self.values = JdChartGeometry.sanitize(values)
        self.showsFill = showsFill
        self.showsBaseline = showsBaseline
        self.showsDot = showsDot
        self.color = color
        self.label = label
        self.spec = JdSparklineSpec.resolve(
            values: values, width: width, height: height,
            strokeWidth: strokeWidth, color: color)
        super.init(frame: .zero)
        backgroundColor = .clear
        isOpaque = false
        applyAccessibility()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        CGSize(width: spec.width, height: spec.height)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이내믹 색은 draw(_:) 안에서 resolve하므로 다시 그리기만 하면 된다
        setNeedsDisplay()
    }

    public override func draw(_ rect: CGRect) {
        guard let ctx = UIGraphicsGetCurrentContext() else { return }
        let size = bounds.size
        let points = JdChartGeometry.points(values, in: size, inset: spec.inset)
        guard !points.isEmpty else { return }
        let base = spec.lineColor.uiColor.resolvedColor(with: traitCollection)

        if showsFill, points.count >= 2 {
            let area = JdChartGeometry.areaPath(points, in: size)
            let path = UIBezierPath()
            path.move(to: area[0])
            for p in area.dropFirst() { path.addLine(to: p) }
            path.close()
            ctx.saveGState()
            path.addClip()
            let colors = [
                base.withAlphaComponent(CGFloat(spec.fillTopAlpha)).cgColor,
                base.withAlphaComponent(CGFloat(spec.fillBottomAlpha)).cgColor,
            ]
            if let gradient = CGGradient(
                colorsSpace: CGColorSpaceCreateDeviceRGB(),
                colors: colors as CFArray, locations: [0, 1])
            {
                ctx.drawLinearGradient(
                    gradient,
                    start: CGPoint(x: 0, y: 0),
                    end: CGPoint(x: 0, y: size.height),
                    options: [])
            }
            ctx.restoreGState()
        }

        if showsBaseline, let y = JdChartGeometry.baselineY(points) {
            let line = UIBezierPath()
            line.move(to: CGPoint(x: 0, y: y))
            line.addLine(to: CGPoint(x: size.width, y: y))
            base.withAlphaComponent(CGFloat(spec.baselineAlpha)).setStroke()
            line.lineWidth = 1
            line.stroke()
        }

        if points.count >= 2 {
            let line = UIBezierPath()
            line.move(to: points[0])
            for p in points.dropFirst() { line.addLine(to: p) }
            line.lineWidth = spec.strokeWidth
            line.lineCapStyle = .round
            line.lineJoinStyle = .round
            base.setStroke()
            line.stroke()
        }

        if showsDot, let last = points.last {
            // 헤일로가 점보다 커서 마지막 값이 어디인지 눈이 먼저 찾는다
            base.withAlphaComponent(CGFloat(spec.haloAlpha)).setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: last.x - spec.dotRadius * 2,
                    y: last.y - spec.dotRadius * 2,
                    width: spec.dotRadius * 4,
                    height: spec.dotRadius * 4)
            ).fill()
            base.setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: last.x - spec.dotRadius,
                    y: last.y - spec.dotRadius,
                    width: spec.dotRadius * 2,
                    height: spec.dotRadius * 2)
            ).fill()
        }
    }

    private func resolveAndApply() {
        spec = JdSparklineSpec.resolve(
            values: values, width: spec.width, height: spec.height,
            strokeWidth: spec.strokeWidth, color: color)
        invalidateIntrinsicContentSize()
        setNeedsDisplay()
    }

    private func applyAccessibility() {
        isAccessibilityElement = label != nil
        accessibilityTraits = label != nil ? .image : []
        accessibilityLabel = label
    }
}
