import SwiftUI
import JunDSCore

// 웹 jd-live-micro-kpi-row 동형 — 보조 KPI 소형 셀 묶음. (DEC-041)
//
// **이 컴포넌트는 자기 배치를 스스로 소유한다.** 웹은 호스트를 `display: contents`로 두고
// 셀이 부모 그리드의 아이템이 되게 했다 — 즉 격자 정의를 소비자에게 넘겼다. iOS엔 그런
// 투명 호스트가 없고, 무엇보다 소비자가 LazyVGrid 열 정의(또는 UIKit 컴파지셔널 레이아웃)를
// 매번 짜야 하는 것이 실제 비용이다. 그래서 여기서는 셀 개수·폭에 맞춰 **스스로 감싸 배치**
// 한다. 소비자는 items만 넘긴다.
//
// 값은 이미 포맷된 문자열이다 — 폴링·포맷은 앱의 몫(DEC-019, 웹과 동일 계약).
public struct JdMicroKpiRow: View {
    private let items: [JdMicroKpiItem]
    private let minCellWidth: CGFloat
    private let spacing: CGFloat

    public init(items: [JdMicroKpiItem],
                minCellWidth: CGFloat = 132,
                spacing: CGFloat = JdToken.Space.s2) {
        self.items = items
        self.minCellWidth = minCellWidth
        self.spacing = spacing
    }

    public var body: some View {
        // adaptive 격자 — 폭이 허용하는 만큼 열을 만들고 넘치면 다음 행.
        // 웹의 `grid-cols-2 md:grid-cols-4` 같은 중단점 나열 대신 최소 셀 폭 하나로 정한다:
        // iOS는 기기 폭이 연속적이라 중단점보다 최소 폭이 더 잘 맞는다.
        LazyVGrid(
            columns: [GridItem(.adaptive(minimum: minCellWidth), spacing: spacing)],
            spacing: spacing
        ) {
            ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                JdMicroKpiCell(item: item)
            }
        }
    }
}

/// KPI 셀 한 칸. 목록 밖에서 단독으로도 쓸 수 있게 public이다.
public struct JdMicroKpiCell: View {
    private let item: JdMicroKpiItem
    private let spec: JdMicroKpiCellSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(item: JdMicroKpiItem) {
        self.item = item
        self.spec = JdMicroKpiCellSpec.resolve(item: item)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(item.label)
                .font(JdSwiftUIFont.scaled(size: spec.labelFontSize,
                                           weight: spec.labelFontWeight,
                                           category: sizeCategory))
                .foregroundColor(spec.labelColor.color)

            // 값 + 단위는 한 문단 — 단위가 줄바꿈으로 떨어지면 숫자와 분리돼 읽힌다
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(item.value)
                    .font(JdSwiftUIFont.scaled(size: spec.valueFontSize,
                                               weight: spec.valueFontWeight,
                                               category: sizeCategory))
                    .monospacedDigit()
                if let unit = item.unit, !unit.isEmpty {
                    Text(unit)
                        .font(JdSwiftUIFont.scaled(size: spec.unitFontSize,
                                                   weight: JdToken.FontWeight.semibold,
                                                   category: sizeCategory))
                }
            }
            .foregroundColor(spec.valueColor.color)

            Text(JdMicroKpiCellSpec.subText(item: item))
                .font(JdSwiftUIFont.scaled(size: spec.subFontSize,
                                           weight: spec.subFontWeight,
                                           category: sizeCategory))
                .monospacedDigit()
                .foregroundColor(spec.subColor.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, spec.hPadding)
        .padding(.vertical, spec.vPadding)
        .background(spec.background.color)
        .clipShape(RoundedRectangle(cornerRadius: spec.cornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: spec.cornerRadius, style: .continuous)
                .strokeBorder(spec.border.color, lineWidth: JdToken.Border.thin)
        )
        // 라벨·값·보조가 따로 읽히면 관계가 사라진다 (04 §7.1)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(JdMicroKpiCellSpec.accessibilityText(item: item)))
    }
}
