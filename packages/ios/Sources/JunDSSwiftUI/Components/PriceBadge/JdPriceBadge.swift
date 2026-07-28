import JunDSCore
import SwiftUI

// 웹 jd-price-badge 동형 — 등락률 + 추세 화살표 (DEC-040).
//
// JdLivePctBadge와 겹쳐 보이지만 **판정 규칙이 다르다**: 여기 flat은 정확히 0이고
// (확정된 일봉 등락률), live 쪽은 |v| < 0.005다(잘게 흔들리는 실시간 틱). 웹도 상속하지
// 않고 독립 구현했으며 같은 이유로 여기서도 분리한다 (§6 R12는 관용구가 같을 때만).
//
// 화살표: 웹은 lucide TrendingUp/Down 폴리라인이다. 서드파티 0 규칙 아래 SF Symbols로
// 번역했고(의미 동일), flat이면 화살표가 없다.
public struct JdPriceBadge: View {
    private let pct: Double
    private let spec: JdPriceBadgeSpec
    private let trend: JdTrend

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        pct: Double,
        size: JdPriceBadgeSize = .md,
        showArrow: Bool = true,
        bold: Bool = true
    ) {
        self.pct = pct
        self.spec = JdPriceBadgeSpec.resolve(pct: pct, size: size, showArrow: showArrow, bold: bold)
        self.trend = JdTrend.resolve(pct, policy: .exact)
    }

    /// 웹 표시 문자열 — 양수만 "+", 소수 2자리 고정(로케일 비의존)
    public var formatted: String {
        JdFinanceFormat.percentText(pct, decimals: 2, showSign: true, withPercent: true)
    }

    public var body: some View {
        HStack(spacing: spec.gap) {
            if spec.showsArrow, let symbol = JdPriceBadgeSpec.symbolName(trend) {
                Image(systemName: symbol)
                    // 심볼은 폰트 크기에 붙어 자란다 — Dynamic Type을 함께 따라간다
                    .font(
                        JdSwiftUIFont.scaled(
                            size: spec.iconSize,
                            weight: JdToken.FontWeight.semibold,
                            category: sizeCategory)
                    )
                    .accessibilityHidden(true)  // 추세는 아래 라벨이 말한다
            }
            Text(formatted)
                .monospacedDigit()
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.fontSize,
                        weight: spec.fontWeight,
                        category: sizeCategory))
        }
        .foregroundColor(spec.color.color)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            Text(JdLivePctBadge.accessibilityText(trend: trend, formatted: formatted)))
    }
}
