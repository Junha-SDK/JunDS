import JunDSCore
import SwiftUI

// 웹 jd-live-pct-badge 동형 — 등락률 텍스트 + 추세 색 (DEC-040).
//
// 웹은 `class JdLivePctBadge extends JdLivePctText`로 포맷 골격을 상속하고 색만 얹는다.
// SwiftUI의 struct는 상속이 없으므로 **합성**으로 같은 관계를 만든다 — 포맷은 여전히
// JdLivePctText 한 곳에만 있다(규칙 중복 금지).
//
// 판정 규칙은 `.live`다: up(>0)이 flat보다 우선하므로 +0.003은 상승색이고, flat(회색)은
// [-0.005, 0] 구간뿐이다. 이 규칙이 JdPriceBadge(정확히 0만 flat)와 다른 이유는
// JdTrendPolicy 주석에 있다.
public struct JdLivePctBadge: View {
    private let text: JdLivePctText

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        change: Double,
        fallback: Double = 0,
        decimals: Int = 2,
        showSign: Bool = true,
        withPercent: Bool = true
    ) {
        self.text = JdLivePctText(
            change: change,
            fallback: fallback,
            decimals: decimals,
            showSign: showSign,
            withPercent: withPercent)
    }

    /// 화면의 숫자로 판정한다 — 원시 change가 아니라 fallback이 반영된 표시값이다
    public var trend: JdTrend {
        JdTrend.resolve(text.resolvedValue, policy: .live)
    }

    public var body: some View {
        Text(text.formatted)
            .monospacedDigit()
            // 웹: 12px bold
            .font(
                JdSwiftUIFont.scaled(
                    size: JdTextSpec.resolve(size: .xs).fontSize,
                    weight: JdToken.FontWeight.bold,
                    category: sizeCategory)
            )
            .foregroundColor(JdFinanceTheme.color(trend).color)
            // 색이 유일한 추세 신호이면 색각 이상 사용자에게 정보가 사라진다 — 부호가 이미
            // 문자열에 있으므로(+/-) 값 자체는 낭독되지만, 추세를 말로도 붙인다 (04 §7.1)
            .accessibilityLabel(
                Text(
                    JdLivePctBadge.accessibilityText(
                        trend: trend,
                        formatted: text.formatted)))
    }

    /// 추세명 사전 — UIKit 계층에 동형 사본이 있다(DEC-010으로 계층 간 공유 불가).
    static func accessibilityText(trend: JdTrend, formatted: String) -> String {
        switch trend {
        case .up: return "상승 \(formatted)"
        case .down: return "하락 \(formatted)"
        case .flat: return "보합 \(formatted)"
        }
    }
}
