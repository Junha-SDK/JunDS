import SwiftUI
import JunDSCore

// 웹 jd-sparkline 동형 — 추세 스파크라인. (DEC-049)
//
// 좌표는 Core(JdChartGeometry)가 만들고 여기서는 그리기만 한다 — 남은 차트 8종이 같은
// 계산을 공유하게 하려는 것이 요점이다(04 §4.2 규칙 1).
//
// SwiftUI는 Canvas로 그린다. Path/Shape가 아니라 Canvas인 이유: 선·면적·기준선·점을
// **한 번의 그리기 패스**에 담을 수 있고, 뷰 트리에 도형 4개를 쌓지 않는다.
public struct JdSparkline: View {
    private let values: [Double]
    private let showsFill: Bool
    private let showsBaseline: Bool
    private let showsDot: Bool
    private let label: String?
    private let spec: JdSparklineSpec

    public init(values: [Double],
                width: CGFloat = 80,
                height: CGFloat = 24,
                strokeWidth: CGFloat = 1.6,
                color: JdDynamicColor? = nil,
                showsFill: Bool = false,
                showsBaseline: Bool = false,
                showsDot: Bool = true,
                label: String? = nil) {
        // 비수치는 대입 시점에 거른다 — 좌표 하나가 NaN이면 선 전체가 조용히 사라진다
        self.values = JdChartGeometry.sanitize(values)
        self.showsFill = showsFill
        self.showsBaseline = showsBaseline
        self.showsDot = showsDot
        self.label = label
        self.spec = JdSparklineSpec.resolve(values: values, width: width, height: height,
                                            strokeWidth: strokeWidth, color: color)
    }

    public var body: some View {
        Canvas { context, size in
            let points = JdChartGeometry.points(values, in: size, inset: spec.inset)
            guard points.count >= 1 else { return }
            let color = spec.lineColor.color

            if showsFill, points.count >= 2 {
                let area = JdChartGeometry.areaPath(points, in: size)
                var path = Path()
                path.addLines(area)
                path.closeSubpath()
                context.fill(path, with: .linearGradient(
                    Gradient(colors: [color.opacity(spec.fillTopAlpha),
                                      color.opacity(spec.fillBottomAlpha)]),
                    startPoint: CGPoint(x: 0, y: 0),
                    endPoint: CGPoint(x: 0, y: size.height)))
            }

            if showsBaseline, let y = JdChartGeometry.baselineY(points) {
                var line = Path()
                line.move(to: CGPoint(x: 0, y: y))
                line.addLine(to: CGPoint(x: size.width, y: y))
                context.stroke(line, with: .color(color.opacity(spec.baselineAlpha)),
                               lineWidth: 1)
            }

            if points.count >= 2 {
                var line = Path()
                line.addLines(points)
                context.stroke(line, with: .color(color),
                               style: StrokeStyle(lineWidth: spec.strokeWidth,
                                                  lineCap: .round, lineJoin: .round))
            }

            if showsDot, let last = points.last {
                // 헤일로가 점보다 커서 마지막 값이 어디인지 눈이 먼저 찾는다
                let halo = CGRect(x: last.x - spec.dotRadius * 2, y: last.y - spec.dotRadius * 2,
                                  width: spec.dotRadius * 4, height: spec.dotRadius * 4)
                context.fill(Path(ellipseIn: halo), with: .color(color.opacity(spec.haloAlpha)))
                let dot = CGRect(x: last.x - spec.dotRadius, y: last.y - spec.dotRadius,
                                 width: spec.dotRadius * 2, height: spec.dotRadius * 2)
                context.fill(Path(ellipseIn: dot), with: .color(color))
            }
        }
        .frame(width: spec.width, height: spec.height)
        // 라벨이 있으면 정보, 없으면 장식 — 웹 v2는 이 구분이 아예 없었다
        .accessibilityElement(children: .ignore)
        .accessibilityHidden(label == nil)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(label ?? ""))
    }
}
