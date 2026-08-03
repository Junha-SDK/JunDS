import JunDSCore
import SwiftUI

// 웹 MarketIndexChart 동형 — 타임프레임 pill + MA 범례 + 캔들 차트. (DEC-049)
//
// 웹은 타임프레임별 mock 캔들을 컴포넌트 안에서 생성했지만, iOS는 데이터 생성이
// 라이브러리 밖이므로(DEC-019) **타임프레임별 캔들을 인자로 받는다**. 웹의 bm-card
// 래퍼는 소비자의 몫이다(카드 배치는 앱 레이아웃 어휘).
public struct JdMarketIndexChart: View {
    private let timeframes: [JdMarketIndexTimeframe]
    private let width: CGFloat
    private let height: CGFloat
    private let label: String?
    private let onSelect: ((Int) -> Void)?

    @State private var selectedIndex: Int

    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        timeframes: [JdMarketIndexTimeframe],
        selectedIndex: Int = 0,
        width: CGFloat = 1000,
        height: CGFloat = 360,
        label: String? = nil,
        onSelect: ((Int) -> Void)? = nil
    ) {
        self.timeframes = timeframes
        self.width = width
        self.height = height
        self.label = label
        self.onSelect = onSelect
        self._selectedIndex = State(
            initialValue: timeframes.indices.contains(selectedIndex) ? selectedIndex : 0)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s1) {
            HStack(spacing: JdToken.Space.s2) {
                pills
                Spacer(minLength: JdToken.Space.s2)
                legend
            }
            if let timeframe = current {
                JdCandleChart(
                    candles: timeframe.candles,
                    width: width,
                    height: height,
                    separatorIndex: timeframe.separatorIndex,
                    xLabels: timeframe.xLabels,
                    showsVolume: true,
                    label: label)
            }
        }
        .frame(width: width)
    }

    private var current: JdMarketIndexTimeframe? {
        timeframes.indices.contains(selectedIndex) ? timeframes[selectedIndex] : nil
    }

    private var pills: some View {
        HStack(spacing: JdToken.Space.s2) {
            ForEach(timeframes.indices, id: \.self) { index in
                let active = index == selectedIndex
                let spec = JdMarketIndexChartSpec.pill(selected: active)
                Button {
                    selectedIndex = index
                    onSelect?(index)
                } label: {
                    Text(timeframes[index].label)
                        .font(
                            JdSwiftUIFont.scaled(
                                size: JdMarketIndexChartSpec.pillFontSize,
                                weight: spec.fontWeight,
                                category: sizeCategory)
                        )
                        .foregroundColor(spec.foreground.color)
                        .padding(.horizontal, JdToken.Space.s2)
                        .padding(.vertical, JdToken.Space.s1)
                        .background(Capsule().fill(spec.background.color))
                }
                .buttonStyle(.plain)
                // 웹 aria-pressed 대응
                .accessibilityAddTraits(active ? [.isSelected] : [])
            }
        }
    }

    /// MA 기간 범례 — 캔들 차트가 그리는 5개 이동평균과 1:1
    private var legend: some View {
        HStack(spacing: JdToken.Space.s2) {
            ForEach(JdMarketIndexChartSpec.maLegend, id: \.period) { entry in
                HStack(spacing: JdToken.Space.s1) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(entry.color.color)
                        .frame(width: 10, height: 10)
                    Text("\(entry.period)")
                        .font(
                            JdSwiftUIFont.scaled(
                                size: JdMarketIndexChartSpec.pillFontSize,
                                weight: JdToken.FontWeight.medium,
                                category: sizeCategory)
                        )
                        .monospacedDigit()
                        .foregroundColor(JdChartTheme.axis.color)
                }
            }
        }
        // 범례는 장식 — 색 자체를 낭독할 방법이 없고 기간 숫자만 남으면 소음이다
        .accessibilityHidden(true)
    }
}
