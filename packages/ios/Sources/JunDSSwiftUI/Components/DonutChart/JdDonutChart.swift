import JunDSCore
import SwiftUI

// 웹 DonutChart 동형 — 구성비 도넛. (DEC-049)
//
// 각도·비율은 Core(JdDonutChartGeometry)가 만들고 여기서는 호(arc)만 긋는다.
public struct JdDonutChart: View {
    private let slices: [JdDonutSlice]
    private let size: CGFloat
    private let thickness: CGFloat
    private let centerLabel: String?
    private let centerValue: String?
    private let label: String?

    public init(
        slices: [JdDonutSlice],
        size: CGFloat = 220,
        thickness: CGFloat = 28,
        centerLabel: String? = nil,
        centerValue: String? = nil,
        label: String? = nil
    ) {
        self.slices = slices
        self.size = size
        self.thickness = thickness
        self.centerLabel = centerLabel
        self.centerValue = centerValue
        self.label = label
    }

    public var body: some View {
        Canvas { context, canvasSize in
            let g = JdDonutChartGeometry.resolve(
                slices: slices, size: min(canvasSize.width, canvasSize.height),
                thickness: thickness)
            guard g.radius > 0 else { return }

            // 배경 링 — 조각이 원을 다 못 채워도 트랙이 보인다(웹 grid 원 동형)
            context.stroke(
                Path(
                    ellipseIn: CGRect(
                        x: g.center.x - g.radius, y: g.center.y - g.radius,
                        width: g.radius * 2, height: g.radius * 2)),
                with: .color(JdChartTheme.grid.color),
                lineWidth: g.thickness)

            for segment in g.segments {
                var arc = Path()
                arc.addArc(
                    center: g.center, radius: g.radius,
                    startAngle: Angle(radians: segment.startAngle),
                    endAngle: Angle(radians: segment.endAngle),
                    clockwise: false)
                context.stroke(
                    arc, with: .color(segment.color.color),
                    style: StrokeStyle(lineWidth: g.thickness, lineCap: .butt))
            }

            if let centerLabel {
                context.draw(
                    Text(centerLabel)
                        .font(
                            Font.system(
                                size: JdDonutChartGeometry.centerLabelFontSize, weight: .bold)
                        )
                        .foregroundColor(JdChartTheme.axis.color),
                    at: CGPoint(
                        x: g.center.x,
                        y: g.center.y + JdDonutChartGeometry.centerLabelOffsetY),
                    anchor: .center)
            }
            if let centerValue {
                context.draw(
                    Text(centerValue)
                        .font(
                            Font.system(
                                size: JdDonutChartGeometry.centerValueFontSize, weight: .heavy
                            ).monospacedDigit()
                        )
                        .foregroundColor(JdToken.Color.foreground.color),
                    at: CGPoint(
                        x: g.center.x,
                        y: g.center.y + JdDonutChartGeometry.centerValueOffsetY),
                    anchor: .center)
            }
        }
        .frame(width: size, height: size)
        .accessibilityElement(children: .ignore)
        .accessibilityHidden(label == nil)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label ?? ""))
    }
}
