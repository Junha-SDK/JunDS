import SwiftUI
import JunDSCore

// 웹 jd-live-stacked-cell 동형 — 현재가(위) + 등락률(아래) 2단 우측정렬 셀. (DEC-041)
//
// 테이블 종목 셀 관용구다. 리프(JdLivePriceText·JdLivePctBadge)를 조립하지 않고 독립
// 구현하는 이유: 이 셀은 두 값을 **한 색으로 묶는다**. 리프를 얹으면 각자 색을 정하거나
// 정하지 않아 색 통로가 둘로 갈린다 — 웹도 같은 이유로 상속하지 않았다.
//
// 판정은 `.gainOrEven` — 0%도 상승 쪽이다. 두 값이 한 색이라 0%에 회색을 주면 그 행 전체가
// 죽은 것처럼 보인다(웹 v2 규칙 보존).
public struct JdLiveStackedCell: View {
    private let price: Double
    private let change: Double
    private let priceFallback: Double
    private let pctFallback: Double
    private let priceDecimals: Int
    private let pctDecimals: Int
    private let locale: String
    private let spec: JdLiveStackedCellSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(price: Double,
                change: Double,
                priceFallback: Double = 0,
                pctFallback: Double = 0,
                priceDecimals: Int = 0,
                pctDecimals: Int = 2,
                locale: String = "ko-KR") {
        self.price = price
        self.change = change
        self.priceFallback = priceFallback
        self.pctFallback = pctFallback
        self.priceDecimals = priceDecimals
        self.pctDecimals = pctDecimals
        self.locale = locale
        self.spec = JdLiveStackedCellSpec.resolve(
            change: JdFinanceFormat.resolvedChange(change: change, fallback: pctFallback)
        )
    }

    /// 두 줄의 확정 문자열 — 소비자·테스트 공용
    public var lines: (price: String, pct: String) {
        JdLiveStackedCellSpec.lines(price: price,
                                    change: change,
                                    priceFallback: priceFallback,
                                    pctFallback: pctFallback,
                                    priceDecimals: priceDecimals,
                                    pctDecimals: pctDecimals,
                                    locale: locale)
    }

    public var body: some View {
        let text = lines
        // trailing 정렬이 이 셀의 계약이다 — 표 오른쪽 열에서 숫자 끝이 맞아야 읽힌다
        return VStack(alignment: .trailing, spacing: spec.lineSpacing) {
            Text(text.price)
                .font(JdSwiftUIFont.scaled(size: spec.priceFontSize,
                                           weight: spec.priceFontWeight,
                                           category: sizeCategory))
            Text(text.pct)
                .font(JdSwiftUIFont.scaled(size: spec.pctFontSize,
                                           weight: spec.pctFontWeight,
                                           category: sizeCategory))
        }
        .monospacedDigit()
        // 색 통로 하나 — 두 줄이 같은 색을 상속한다(웹의 호스트→자식 상속 동형)
        .foregroundColor(spec.color.color)
        .multilineTextAlignment(.trailing)
        // 두 줄이 따로 읽히면 "가격"과 "등락률"의 관계가 사라진다
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(JdLiveStackedCellSpec.accessibilityText(
            price: text.price,
            pct: text.pct,
            change: JdFinanceFormat.resolvedChange(change: change, fallback: pctFallback)
        )))
    }
}
