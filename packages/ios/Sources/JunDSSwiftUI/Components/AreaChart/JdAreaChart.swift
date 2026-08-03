import JunDSCore
import SwiftUI

// 웹 AreaChart 동형 — 기준선 위/아래를 색으로 가르는 단일 시리즈 영역 차트. (DEC-049)
//
// 좌표·눈금·추세는 Core(JdAreaChartGeometry)가 만들고 여기서는 그리기만 한다.
// Canvas 한 패스에 격자·기준선·채움·선·끝점을 담는다 — 도형을 뷰 트리에 쌓지 않는다.
//
// 웹과 다른 점: 마우스 hover 크로스헤어·툴팁은 DOM 전용 상호작용이라 옮기지 않았다.
public struct JdAreaChart: View {
    private let values: [Double]
    private let baseline: Double?
    private let width: CGFloat
    private let height: CGFloat
    private let label: String?

    public init(
        values: [Double],
        baseline: Double? = nil,
        width: CGFloat = 380,
        height: CGFloat = 200,
        label: String? = nil
    ) {
        // 비수치는 대입 시점에 거른다 — 좌표 하나가 NaN이면 path 전체가 조용히 사라진다
        self.values = JdChartGeometry.sanitize(values)
        self.baseline = baseline
        self.width = width
        self.height = height
        self.label = label
    }

    public var body: some View {
        Canvas { context, size in
            guard
                let g = JdAreaChartGeometry.resolve(
                    data: values, baseline: baseline,
                    width: size.width, height: size.height)
            else { return }
            let stroke = JdFinanceTheme.color(g.trend).color
            let gridColor = JdChartTheme.grid.color
            let axisColor = JdChartTheme.axis.color

            // 격자 + 왼쪽 눈금 라벨
            for tick in g.ticks {
                let y = g.y(of: tick)
                var line = Path()
                line.move(to: CGPoint(x: g.frame.padL, y: y))
                line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
                context.stroke(line, with: .color(gridColor), lineWidth: 1)
                context.draw(
                    Text(String(format: "%.0f", tick))
                        .font(Font.system(size: 10).monospacedDigit())
                        .foregroundColor(axisColor),
                    at: CGPoint(x: g.frame.padL - 6, y: y),
                    anchor: .trailing)
            }

            // 기준선(점선)
            var baselinePath = Path()
            baselinePath.move(to: CGPoint(x: g.frame.padL, y: g.baselineY))
            baselinePath.addLine(to: CGPoint(x: g.frame.plotRight, y: g.baselineY))
            context.stroke(
                baselinePath, with: .color(axisColor),
                style: StrokeStyle(lineWidth: 1, dash: [3, 3]))

            // 채움 — 기준선까지 닫은 경로를 기준선 위/아래로 나눠 각각 up/down 그라디언트
            if g.points.count >= 2 {
                var closed = Path()
                closed.addLines(g.points)
                closed.addLine(
                    to: CGPoint(x: g.points[g.points.count - 1].x, y: g.baselineY))
                closed.addLine(to: CGPoint(x: g.points[0].x, y: g.baselineY))
                closed.closeSubpath()

                let upColor = JdFinanceTheme.up.color
                let downColor = JdFinanceTheme.down.color
                let top = JdAreaChartGeometry.fillTopAlpha
                let bottom = JdAreaChartGeometry.fillBottomAlpha

                var above = context
                above.clip(
                    to: Path(
                        CGRect(
                            x: 0, y: g.frame.padT,
                            width: size.width,
                            height: max(0, g.baselineY - g.frame.padT))))
                above.fill(
                    closed,
                    with: .linearGradient(
                        Gradient(colors: [upColor.opacity(top), upColor.opacity(bottom)]),
                        startPoint: CGPoint(x: 0, y: g.frame.padT),
                        endPoint: CGPoint(x: 0, y: g.frame.plotBottom)))

                var below = context
                below.clip(
                    to: Path(
                        CGRect(
                            x: 0, y: g.baselineY,
                            width: size.width,
                            height: max(0, g.frame.plotBottom - g.baselineY))))
                below.fill(
                    closed,
                    with: .linearGradient(
                        Gradient(colors: [downColor.opacity(bottom), downColor.opacity(top)]),
                        startPoint: CGPoint(x: 0, y: g.frame.padT),
                        endPoint: CGPoint(x: 0, y: g.frame.plotBottom)))
            }

            // 본선
            if g.points.count >= 2 {
                var line = Path()
                line.addLines(g.points)
                context.stroke(
                    line, with: .color(stroke),
                    style: StrokeStyle(
                        lineWidth: JdAreaChartGeometry.strokeWidth,
                        lineCap: .round, lineJoin: .round))
            }

            // 끝점 — 헤일로가 점보다 커서 마지막 값을 눈이 먼저 찾는다
            if let last = g.points.last {
                let halo = JdAreaChartGeometry.haloRadius
                context.fill(
                    Path(
                        ellipseIn: CGRect(
                            x: last.x - halo, y: last.y - halo,
                            width: halo * 2, height: halo * 2)),
                    with: .color(stroke.opacity(0.18)))
                let dot = JdAreaChartGeometry.dotRadius
                context.fill(
                    Path(
                        ellipseIn: CGRect(
                            x: last.x - dot, y: last.y - dot,
                            width: dot * 2, height: dot * 2)),
                    with: .color(stroke))
            }
        }
        .frame(width: width, height: height)
        // 라벨이 있으면 정보, 없으면 장식(Sparkline과 같은 계약)
        .accessibilityElement(children: .ignore)
        .accessibilityHidden(label == nil)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label ?? ""))
    }
}
