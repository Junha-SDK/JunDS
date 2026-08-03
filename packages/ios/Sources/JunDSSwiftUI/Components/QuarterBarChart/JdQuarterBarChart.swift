import JunDSCore
import SwiftUI

// 웹 QuarterBarChart 동형 — 분기 매출·이익 짝 막대. (DEC-049)
//
// 막대 rect·눈금은 Core(JdQuarterBarChartGeometry)가 만들고 여기서는 칠하기만 한다.
public struct JdQuarterBarChart: View {
    private let data: [JdQuarterRow]
    private let metric: JdQuarterBarMetric
    private let width: CGFloat
    private let height: CGFloat
    private let label: String?

    public init(
        data: [JdQuarterRow],
        metric: JdQuarterBarMetric = .revenueOp,
        width: CGFloat = 380,
        height: CGFloat = 220,
        label: String? = nil
    ) {
        self.data = data
        self.metric = metric
        self.width = width
        self.height = height
        self.label = label
    }

    public var body: some View {
        Canvas { context, size in
            guard
                let g = JdQuarterBarChartGeometry.resolve(
                    data: data, metric: metric,
                    width: size.width, height: size.height)
            else { return }
            let gridColor = JdChartTheme.grid.color
            let axisColor = JdChartTheme.axis.color
            let primary = JdQuarterBarChartGeometry.primaryColor.color
            let secondary = JdQuarterBarChartGeometry.secondaryColor(metric).color

            // 격자 + 왼쪽 눈금 라벨(천단위)
            for tick in g.ticks {
                let y = g.scale.y(tick, in: g.frame)
                var line = Path()
                line.move(to: CGPoint(x: g.frame.padL, y: y))
                line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
                context.stroke(line, with: .color(gridColor), lineWidth: 1)
                context.draw(
                    Text(JdNumberFormat.string(value: tick.rounded(), decimals: 0))
                        .font(Font.system(size: 10).monospacedDigit())
                        .foregroundColor(axisColor),
                    at: CGPoint(x: g.frame.padL - 6, y: y),
                    anchor: .trailing)
            }

            // 짝 막대 + 분기 라벨
            let corner = JdQuarterBarChartGeometry.cornerRadius
            for bar in g.bars {
                context.fill(
                    Path(roundedRect: bar.primaryRect, cornerRadius: corner),
                    with: .color(primary))
                context.fill(
                    Path(roundedRect: bar.secondaryRect, cornerRadius: corner),
                    with: .color(secondary))
                context.draw(
                    Text(bar.label)
                        .font(Font.system(size: 10, weight: .semibold))
                        .foregroundColor(axisColor),
                    at: CGPoint(x: bar.centerX, y: size.height - 8),
                    anchor: .center)
            }

            // 상단 범례 — 매출 · 영업이익|순이익
            drawLegend(
                &context, x: g.frame.padL, y: g.frame.padT - 4,
                entries: [
                    (primary, "매출"),
                    (secondary, metric.secondaryLabel),
                ])
        }
        .frame(width: width, height: height)
        .accessibilityElement(children: .ignore)
        .accessibilityHidden(label == nil)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label ?? ""))
    }

    private func drawLegend(
        _ context: inout GraphicsContext,
        x: CGFloat, y: CGFloat,
        entries: [(color: Color, text: String)]
    ) {
        var cursor = x
        for entry in entries {
            context.fill(
                Path(
                    roundedRect: CGRect(x: cursor, y: y - 2, width: 9, height: 9),
                    cornerRadius: 2),
                with: .color(entry.color))
            context.draw(
                Text(entry.text)
                    .font(Font.system(size: 10, weight: .bold))
                    .foregroundColor(JdToken.Color.foreground.color),
                at: CGPoint(x: cursor + 13, y: y + 2.5),
                anchor: .leading)
            cursor += 56
        }
    }
}
