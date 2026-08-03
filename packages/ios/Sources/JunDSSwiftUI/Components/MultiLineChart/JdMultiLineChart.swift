import JunDSCore
import SwiftUI

// 웹 MultiLineChart 동형 — 다중 시리즈 비교 라인 차트(기본: 첫 값 = 0% 정규화). (DEC-049)
//
// 좌표·정규화·눈금은 Core(JdMultiLineChartGeometry)가 만들고 여기서는 그리기만 한다.
// 웹과 다른 점: hover 크로스헤어·툴팁(DOM 전용)은 옮기지 않았다.
public struct JdMultiLineChart: View {
    private let series: [JdChartSeries]
    private let normalize: Bool
    private let unit: String
    private let showsLegend: Bool
    private let width: CGFloat
    private let height: CGFloat
    private let label: String?

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
        self.width = width
        self.height = height
        self.label = label
    }

    public var body: some View {
        Canvas { context, size in
            guard
                let g = JdMultiLineChartGeometry.resolve(
                    series: series, normalize: normalize,
                    width: size.width, height: size.height,
                    showLegend: showsLegend)
            else { return }
            let gridColor = JdChartTheme.grid.color
            let axisColor = JdChartTheme.axis.color

            // 격자 + 왼쪽 눈금 라벨(±부호 포함)
            for tick in g.ticks {
                let y = g.scale.y(tick, in: g.frame)
                var line = Path()
                line.move(to: CGPoint(x: g.frame.padL, y: y))
                line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
                context.stroke(line, with: .color(gridColor), lineWidth: 1)
                context.draw(
                    Text(JdMultiLineChartGeometry.tickText(tick, unit: unit))
                        .font(Font.system(size: 10).monospacedDigit())
                        .foregroundColor(axisColor),
                    at: CGPoint(x: g.frame.padL - 6, y: y),
                    anchor: .trailing)
            }

            // 0선(점선)
            var zero = Path()
            zero.move(to: CGPoint(x: g.frame.padL, y: g.zeroY))
            zero.addLine(to: CGPoint(x: g.frame.plotRight, y: g.zeroY))
            context.stroke(
                zero, with: .color(axisColor),
                style: StrokeStyle(lineWidth: 1, dash: [3, 3]))

            // 시리즈 선 + 끝점(흰 테두리 — 웹 리터럴 동형, 겹친 선 위에서 점을 세운다)
            for (index, points) in g.seriesPoints.enumerated() {
                let color = series[index].color.color
                if points.count >= 2 {
                    var line = Path()
                    line.addLines(points)
                    context.stroke(
                        line, with: .color(color),
                        style: StrokeStyle(
                            lineWidth: JdMultiLineChartGeometry.strokeWidth,
                            lineCap: .round, lineJoin: .round))
                }
                if let last = points.last {
                    let r = JdMultiLineChartGeometry.endDotRadius
                    let rect = CGRect(x: last.x - r, y: last.y - r, width: r * 2, height: r * 2)
                    context.fill(Path(ellipseIn: rect), with: .color(color))
                    context.stroke(
                        Path(ellipseIn: rect), with: .color(.white), lineWidth: 1.5)
                }
            }

            // 인라인 범례 — 웹의 90pt 간격 나이브 배치 동형
            if showsLegend {
                for (index, s) in series.enumerated() {
                    let x = g.frame.padL + CGFloat(index) * 90
                    context.fill(
                        Path(
                            roundedRect: CGRect(x: x, y: size.height - 11, width: 10, height: 3),
                            cornerRadius: 1.5),
                        with: .color(s.color.color))
                    context.draw(
                        Text(s.name)
                            .font(Font.system(size: 10, weight: .bold))
                            .foregroundColor(axisColor),
                        at: CGPoint(x: x + 14, y: size.height - 9.5),
                        anchor: .leading)
                }
            }
        }
        .frame(width: width, height: height)
        .accessibilityElement(children: .ignore)
        .accessibilityHidden(label == nil)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label ?? ""))
    }
}
