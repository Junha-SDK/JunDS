import JunDSCore
import SwiftUI

// 웹 jd-code 동형 — 인라인 코드 칩 (DESIGN-3 §C).
// 계약: mono 폰트 · 배경 = variant별 *Light 토큰 · 전경 = 해당 시맨틱 색 · radius sm · padding 2/6.
//
// ⚠️ 웹 `.jd-code`의 1pt 테두리(color-mix 30%)는 계약 표면에 없고 대응 토큰도 없어 생략한다 —
//    스펙 결손 보고분(JdKbdView가 웹 미세 그림자를 같은 이유로 생략한 선례).
// ⚠️ 웹은 semantic 원색이 10% 틴트 위에서 AA 미달이라 foreground와 65% 섞지만, color-mix에
//    대응하는 토큰이 없다 — 계약대로 시맨틱 원색을 쓰고 대비 재심의는 notes 보고분으로 남긴다.
public struct JdCode: View {
    private let text: String
    private let variant: JdCodeVariant
    private let metrics: JdCodeMetrics

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ text: String,
        variant: JdCodeVariant = .default,
        size: JdControlSize = .md
    ) {
        self.text = text
        self.variant = variant
        self.metrics = JdCodeMetrics(size: size)
    }

    public var body: some View {
        Text(text)
            .font(
                JdSwiftUIFont.scaledMono(
                    size: metrics.fontSize,
                    weight: JdToken.FontWeight.normal,
                    category: sizeCategory)
            )
            .foregroundColor(JdCodeMetrics.foreground(variant).color)
            .padding(.horizontal, metrics.hPadding)
            .padding(.vertical, metrics.vPadding)
            .background(JdCodeMetrics.background(variant).color)
            .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.sm, style: .continuous))
    }
}

// 치수·색 결의 — UIKit 계층(JdCodeView)에 동형 사본이 있다(DEC-010으로 공유 불가).
// Core에 JdCodeSpec이 없어 토큰만으로 결의한다: 새 리터럴을 만들지 않는다.
struct JdCodeMetrics {
    let fontSize: CGFloat
    let hPadding: CGFloat
    let vPadding: CGFloat

    /// 웹 램프: sm 11pt·0/4 · md 12pt·2/6 · lg 13pt·4/8.
    /// 패딩은 토큰과 정확히 일치하고, 11·13pt만 대응 토큰이 없어 JdTextSpec 사다리
    /// (10/12/14 — JdBadgeSpec의 sm/md/lg 사다리와 동일)로 옮긴다(notes 보고분).
    init(size: JdControlSize) {
        switch size {
        case .sm:
            fontSize = JdTextSpec.resolve(size: .xs2).fontSize  // 10
            hPadding = JdToken.Space.s1  // 4
            vPadding = JdToken.Space.s0  // 0
        case .md:
            fontSize = JdTextSpec.resolve(size: .xs).fontSize  // 12
            hPadding = JdToken.Space.s1_5  // 6 (계약 padding 2/6)
            vPadding = JdToken.Space.s0_5  // 2
        case .lg:
            fontSize = JdTextSpec.resolve(size: .sm).fontSize  // 14
            hPadding = JdToken.Space.s2  // 8
            vPadding = JdToken.Space.s1  // 4
        }
    }

    /// default는 *Light 짝이 없다 — 웹 base(`--jd-color-card-hover`)를 그대로 쓴다.
    static func background(_ variant: JdCodeVariant) -> JdDynamicColor {
        switch variant {
        case .default: return JdToken.Color.cardHover
        case .primary: return JdToken.Color.primaryLight
        case .success: return JdToken.Color.successLight
        case .warning: return JdToken.Color.warningLight
        case .danger: return JdToken.Color.dangerLight
        }
    }

    static func foreground(_ variant: JdCodeVariant) -> JdDynamicColor {
        switch variant {
        case .default: return JdToken.Color.foreground
        case .primary: return JdToken.Color.primary
        case .success: return JdToken.Color.success
        case .warning: return JdToken.Color.warning
        case .danger: return JdToken.Color.danger
        }
    }
}
