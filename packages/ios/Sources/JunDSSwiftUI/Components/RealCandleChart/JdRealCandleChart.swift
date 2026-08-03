import JunDSCore
import SwiftUI

// 웹 RealCandleChart 동형 — 출처 배지 + 신선도 + 캔들 차트. (DEC-049)
//
// 웹은 fetch·폴링·포커스 재조회까지 안은 라이브 래퍼다. iOS는 네트워크 없이 **데이터를
// 인자로 받는 뷰**다(라이브 배선은 후속 — DEC-019와 같은 주입 계약). "Yahoo에서 보기"
// 외부 링크도 앱 내비게이션의 몫이라 옮기지 않았다.
public struct JdRealCandleChart: View {
    private let candles: [JdCandle]
    private let source: JdRealCandleSource
    private let liveLabel: String
    private let rangeLabel: String?
    private let intervalLabel: String?
    private let secondsSinceUpdate: Int?
    private let markers: [JdCandleMarkerLine]
    private let width: CGFloat
    private let height: CGFloat
    private let label: String?

    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        candles: [JdCandle],
        source: JdRealCandleSource,
        liveLabel: String = "실시간",
        rangeLabel: String? = nil,
        intervalLabel: String? = nil,
        secondsSinceUpdate: Int? = nil,
        markers: [JdCandleMarkerLine] = [],
        width: CGFloat = 1280,
        height: CGFloat = 540,
        label: String? = nil
    ) {
        self.candles = JdCandleChartLayout.sanitize(candles)
        self.source = source
        self.liveLabel = liveLabel
        self.rangeLabel = rangeLabel
        self.intervalLabel = intervalLabel
        self.secondsSinceUpdate = secondsSinceUpdate
        self.markers = markers
        self.width = width
        self.height = height
        self.label = label
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s2) {
            header
            JdCandleChart(
                candles: candles,
                width: width,
                height: height,
                markers: markers,
                showsVolume: true,
                label: label)
        }
        .frame(width: width)
    }

    private var header: some View {
        let spec = JdRealCandleHeaderSpec.resolve(source: source, liveLabel: liveLabel)
        return HStack(spacing: JdToken.Space.s2) {
            HStack(spacing: 6) {
                Circle()
                    .fill(spec.dotColor.color)
                    .frame(width: 6, height: 6)
                Text(spec.text)
                    .font(
                        JdSwiftUIFont.scaled(
                            size: 11.5, weight: JdToken.FontWeight.bold,
                            category: sizeCategory))
                    .foregroundColor(spec.foreground.color)
                    .lineLimit(1)
            }
            .padding(.horizontal, JdToken.Space.s2)
            .padding(.vertical, JdToken.Space.s1)
            .background(Capsule().fill(spec.background.color))

            // 봉 수 캡션 — 웹은 라이브 소스일 때만 보여준다
            if source == .live, let rangeLabel, let intervalLabel {
                Text(
                    JdRealCandleHeaderSpec.caption(
                        count: candles.count, range: rangeLabel, interval: intervalLabel)
                )
                .font(
                    JdSwiftUIFont.scaled(
                        size: JdToken.FontSize.xs2, weight: JdToken.FontWeight.medium,
                        category: sizeCategory)
                )
                .monospacedDigit()
                .foregroundColor(JdToken.Color.muted.color)
            }

            // 신선도 — 갱신 시각 재계산(웹 5초 타이머)은 라이브 배선의 몫이라 값 주입이다
            if let secondsSinceUpdate {
                HStack(spacing: JdToken.Space.s1) {
                    Circle()
                        .fill(
                            (source == .live
                                ? JdFinanceTheme.live : JdToken.Color.muted
                            ).color
                        )
                        .frame(width: 6, height: 6)
                    Text(
                        JdRealCandleHeaderSpec.freshnessText(secondsAgo: secondsSinceUpdate)
                            + " 갱신"
                    )
                    .font(
                        JdSwiftUIFont.scaled(
                            size: JdToken.FontSize.xs2, weight: JdToken.FontWeight.bold,
                            category: sizeCategory)
                    )
                    .monospacedDigit()
                    .foregroundColor(JdToken.Color.muted.color)
                }
            }

            Spacer(minLength: 0)
        }
        .accessibilityElement(children: .combine)
    }
}
