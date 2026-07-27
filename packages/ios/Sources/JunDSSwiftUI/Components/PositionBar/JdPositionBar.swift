import SwiftUI
import JunDSCore

// 웹 jd-position-bar 동형 — 구간 대비 현재 위치 막대. (DEC-041)
//
// 좌표는 스스로 계산하지 않는다 — Core(JdPositionBarGeometry)가 클램프까지 마친 퍼센트를
// 주고 여기서는 놓기만 한다(04 §4.2 규칙 1). 두 렌더 계층이 같은 산수를 각자 구현하면
// 반드시 어긋나기 때문이다.
//
// 마커(12pt)가 트랙(8pt)보다 크므로 **클리핑하면 안 된다** — 트랙만 라운드 클립하고
// 마커는 그 바깥 레이어에 얹는다.
public struct JdPositionBar: View {
    private let low: Double
    private let high: Double
    private let cur: Double
    private let spec: JdPositionBarSpec

    public init(low: Double, high: Double, cur: Double, tone: JdPositionBarTone = .up) {
        self.low = low
        self.high = high
        self.cur = cur
        self.spec = JdPositionBarSpec.resolve(tone: tone)
    }

    public var body: some View {
        let geo = JdPositionBarGeometry.layout(low: low, high: high, cur: cur)

        // 폭 비율 배치라 GeometryReader가 필요하다 — 높이는 스펙이 고정한다
        GeometryReader { proxy in
            let w = proxy.size.width
            ZStack(alignment: .leading) {
                // 트랙 + 밴드 + 채움은 라운드 클립 안 (모두 트랙 높이)
                ZStack(alignment: .leading) {
                    Capsule().fill(spec.trackColor.color)
                    bar(color: spec.bandColor, start: geo.bandStart, width: geo.bandWidth, in: w)
                    bar(color: spec.fillColor, start: geo.fillStart, width: geo.fillWidth, in: w)
                }
                .frame(height: spec.trackHeight)
                .clipShape(Capsule())

                // 마커는 클립 밖 — 트랙보다 크다. 웹과 같이 정중앙(50%) 고정.
                RoundedRectangle(cornerRadius: spec.markerWidth, style: .continuous)
                    .fill(spec.markerColor.color)
                    .frame(width: spec.markerWidth, height: spec.markerHeight)
                    .offset(x: w / 2 - spec.markerWidth / 2)
            }
            .frame(height: spec.markerHeight, alignment: .center)
        }
        // 마커가 트랙보다 커서 전체 높이는 마커 기준이다
        .frame(height: spec.markerHeight)
        // 웹 v2는 순수 장식 div였다(대체 텍스트 0) — v3가 얹은 낭독을 iOS도 따른다
        .accessibilityElement(children: .ignore)
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(Text(JdPositionBarGeometry.accessibilityText(low: low, high: high, cur: cur)))
    }

    private func bar(color: JdDynamicColor, start: Double, width: Double, in total: CGFloat) -> some View {
        Capsule()
            .fill(color.color)
            .frame(width: total * CGFloat(width / 100))
            .offset(x: total * CGFloat(start / 100))
    }
}
