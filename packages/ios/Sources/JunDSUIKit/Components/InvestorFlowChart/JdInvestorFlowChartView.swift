import JunDSCore
import UIKit

// 웹 InvestorFlowChart 동형 — 투자자별(외국인·기관·개인) 순매수 3연 막대. (DEC-049)
//
// 막대 rect·색 판정은 Core(JdInvestorFlowChartGeometry / JdInvestorSeries)가 만들고
// 여기서는 칠하기만 한다. 데이터 집계는 앱의 몫이다(DEC-019).
public final class JdInvestorFlowChartView: UIView {

    public var data: [JdDayFlow] {
        didSet { setNeedsDisplay() }
    }

    /// 웹이 role="img" + aria-label을 항상 붙이는 차트다 — 기본이 정보, 장식이 아니다
    public var label: String {
        didSet { applyAccessibility() }
    }

    private let chartWidth: CGFloat
    private let chartHeight: CGFloat

    public init(
        data: [JdDayFlow],
        width: CGFloat = 800,
        height: CGFloat = 240,
        label: String = JdInvestorFlowChartGeometry.defaultAccessibilityLabel
    ) {
        self.data = data
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
            let g = JdInvestorFlowChartGeometry.resolve(
                data: data, width: bounds.width, height: bounds.height)
        else { return }
        let gridColor = JdChartTheme.grid.uiColor.resolvedColor(with: traitCollection)
        let axisColor = JdChartTheme.axis.uiColor.resolvedColor(with: traitCollection)

        // 격자 + 왼쪽 눈금 라벨
        for tick in g.ticks {
            let y = g.scale.y(tick, in: g.frame)
            let line = UIBezierPath()
            line.move(to: CGPoint(x: g.frame.padL, y: y))
            line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
            gridColor.setStroke()
            line.lineWidth = 1
            line.stroke()
            JdChartDraw.text(
                String(format: "%.0f", tick.rounded()),
                at: CGPoint(x: g.frame.padL - 4, y: y),
                size: 10, weight: JdToken.FontWeight.normal,
                color: axisColor, anchor: .trailing)
        }

        // 0선(실선) — 매수/매도의 경계
        let zero = UIBezierPath()
        zero.move(to: CGPoint(x: g.frame.padL, y: g.zeroY))
        zero.addLine(to: CGPoint(x: g.frame.plotRight, y: g.zeroY))
        axisColor.setStroke()
        zero.lineWidth = 1
        zero.stroke()

        // 3연 막대 + 날짜 라벨(간격 라벨만)
        for day in g.days {
            for bar in day.bars {
                bar.series.color(positive: bar.positive).uiColor
                    .resolvedColor(with: traitCollection).setFill()
                UIBezierPath(
                    roundedRect: bar.rect,
                    cornerRadius: JdInvestorFlowChartGeometry.cornerRadius
                ).fill()
            }
            if day.showsDateLabel {
                JdChartDraw.text(
                    day.date,
                    at: CGPoint(x: day.centerX, y: bounds.height - 6),
                    size: 10, weight: JdToken.FontWeight.normal,
                    color: axisColor, anchor: .center)
            }
        }

        // 상단 범례 — 주체 3색(웹 x 오프셋 0/64/120 동형)
        let foreground = JdToken.Color.foreground.uiColor.resolvedColor(with: traitCollection)
        let legends: [(JdInvestorSeries, CGFloat)] = [
            (.foreign, 0), (.institution, 64), (.individual, 120),
        ]
        for (series, offset) in legends {
            let x = g.frame.padL + offset
            series.color(positive: true).uiColor.resolvedColor(with: traitCollection).setFill()
            UIBezierPath(
                roundedRect: CGRect(x: x, y: 0, width: 9, height: 9),
                cornerRadius: 2
            ).fill()
            JdChartDraw.text(
                series.label,
                at: CGPoint(x: x + 13, y: 4.5),
                size: 10.5, weight: JdToken.FontWeight.bold,
                color: foreground, anchor: .leading)
        }
    }

    private func applyAccessibility() {
        isAccessibilityElement = true
        accessibilityTraits = .image
        accessibilityLabel = label
    }
}
