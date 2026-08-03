import JunDSCore
import SwiftUI

// 웹 InvestorFlowChart 동형 — 투자자별(외국인·기관·개인) 순매수 3연 막대. (DEC-049)
//
// 막대 rect·색 판정은 Core(JdInvestorFlowChartGeometry / JdInvestorSeries)가 만들고
// 여기서는 칠하기만 한다. 데이터 집계는 앱의 몫이다(웹 buildFlow는 라이브러리 밖 — DEC-019).
public struct JdInvestorFlowChart: View {
    private let data: [JdDayFlow]
    private let width: CGFloat
    private let height: CGFloat
    private let label: String

    public init(
        data: [JdDayFlow],
        width: CGFloat = 800,
        height: CGFloat = 240,
        // 웹이 role="img" + aria-label을 항상 붙이는 차트다 — 기본이 정보, 장식이 아니다
        label: String = JdInvestorFlowChartGeometry.defaultAccessibilityLabel
    ) {
        self.data = data
        self.width = width
        self.height = height
        self.label = label
    }

    public var body: some View {
        Canvas { context, size in
            guard
                let g = JdInvestorFlowChartGeometry.resolve(
                    data: data, width: size.width, height: size.height)
            else { return }
            let gridColor = JdChartTheme.grid.color
            let axisColor = JdChartTheme.axis.color

            // 격자 + 왼쪽 눈금 라벨
            for tick in g.ticks {
                let y = g.scale.y(tick, in: g.frame)
                var line = Path()
                line.move(to: CGPoint(x: g.frame.padL, y: y))
                line.addLine(to: CGPoint(x: g.frame.plotRight, y: y))
                context.stroke(line, with: .color(gridColor), lineWidth: 1)
                context.draw(
                    Text(String(format: "%.0f", tick.rounded()))
                        .font(Font.system(size: 10).monospacedDigit())
                        .foregroundColor(axisColor),
                    at: CGPoint(x: g.frame.padL - 4, y: y),
                    anchor: .trailing)
            }

            // 0선(실선) — 매수/매도의 경계
            var zero = Path()
            zero.move(to: CGPoint(x: g.frame.padL, y: g.zeroY))
            zero.addLine(to: CGPoint(x: g.frame.plotRight, y: g.zeroY))
            context.stroke(zero, with: .color(axisColor), lineWidth: 1)

            // 3연 막대 + 날짜 라벨(간격 라벨만)
            for day in g.days {
                for bar in day.bars {
                    context.fill(
                        Path(
                            roundedRect: bar.rect,
                            cornerRadius: JdInvestorFlowChartGeometry.cornerRadius),
                        with: .color(bar.series.color(positive: bar.positive).color))
                }
                if day.showsDateLabel {
                    context.draw(
                        Text(day.date)
                            .font(Font.system(size: 10).monospacedDigit())
                            .foregroundColor(axisColor),
                        at: CGPoint(x: day.centerX, y: size.height - 6),
                        anchor: .center)
                }
            }

            // 상단 범례 — 주체 3색(웹 x 오프셋 0/64/120 동형)
            let legends: [(JdInvestorSeries, CGFloat)] = [
                (.foreign, 0), (.institution, 64), (.individual, 120),
            ]
            for (series, offset) in legends {
                let x = g.frame.padL + offset
                context.fill(
                    Path(
                        roundedRect: CGRect(x: x, y: 0, width: 9, height: 9),
                        cornerRadius: 2),
                    with: .color(series.color(positive: true).color))
                context.draw(
                    Text(series.label)
                        .font(Font.system(size: 10.5, weight: .bold))
                        .foregroundColor(JdToken.Color.foreground.color),
                    at: CGPoint(x: x + 13, y: 4.5),
                    anchor: .leading)
            }
        }
        .frame(width: width, height: height)
        .accessibilityElement(children: .ignore)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label))
    }
}
