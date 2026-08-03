import JunDSCore
import UIKit

// 웹 jd-live-pct-badge 동형 — 등락률 텍스트 + 추세 색. (DEC-040)
//
// 웹이 `extends JdLivePctText`로 포맷 골격을 상속하고 색만 얹은 것을 UIKit에서도 **상속**으로
// 그대로 옮긴다(SwiftUI 쪽은 struct라 합성으로 같은 관계를 만들었다). 포맷 규칙은 여전히
// Core(JdFinanceFormat) 한 곳에만 있다.
//
// 판정 규칙은 `.live` — up(>0)이 flat보다 우선하므로 +0.003은 상승색이고 flat은
// [-0.005, 0] 구간뿐이다. JdPriceBadgeView(정확히 0만 flat)와 다른 이유는 JdTrendPolicy 주석에.
public final class JdLivePctBadgeView: JdLivePctTextView {

    /// 화면의 숫자로 판정한 추세
    public var trend: JdTrend {
        JdTrend.resolve(resolvedValue, policy: .live)
    }

    // MARK: 내부 — 부모의 골격에 색·굵기만 얹는다

    override func applyStyle() {
        // 웹: 12px bold
        font = JdFontBridge.scaledDigitFont(
            size: JdTextSpec.resolve(size: .xs).fontSize,
            weight: JdToken.FontWeight.bold,
            compatibleWith: traitCollection)
    }

    override func applyContent() {
        super.applyContent()
        textColor = JdFinanceTheme.color(trend).uiColor
        // 색이 유일한 추세 신호이면 색각 이상 사용자에게 정보가 사라진다 — 말로도 붙인다 (04 §7.1)
        accessibilityLabel = JdLivePctBadgeView.accessibilityText(
            trend: trend, formatted: formatted)
    }

    /// 추세명 사전 — SwiftUI 계층(JdLivePctBadge)에 동형 사본이 있다(DEC-010으로 공유 불가)
    static func accessibilityText(trend: JdTrend, formatted: String) -> String {
        switch trend {
        case .up: return "상승 \(formatted)"
        case .down: return "하락 \(formatted)"
        case .flat: return "보합 \(formatted)"
        }
    }
}
