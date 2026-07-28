import JunDSCore
import SwiftUI

// 웹 jd-severity-badge 동형 — 심각도 알약 뱃지 (DESIGN-2 §B2).
// 웹은 CSS 전용 렌더(JS 상태 0)라 심각도가 **색으로만** 전달된다(role·aria 전무) —
// iOS는 심각도명을 accessibilityValue로 얹어 보정한다 (04 §7.1: 상태는 문자열 조합이 아니라 값으로).
public struct JdSeverityBadge: View {
    private let text: String
    private let severity: JdSeverity
    private let showsDot: Bool
    private let spec: JdSeverityBadgeSpec

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ text: String,
        severity: JdSeverity = .neutral,
        size: JdDisplaySize = .md,
        showsDot: Bool = false
    ) {
        self.text = text
        self.severity = severity
        self.showsDot = showsDot
        self.spec = JdSeverityBadgeSpec.resolve(severity: severity, size: size)
    }

    public var body: some View {
        HStack(spacing: spec.gap) {  // 웹 gap: var(--jd-space-1-5)
            if showsDot {
                Circle()
                    .fill(spec.dotColor.color)
                    .frame(width: spec.dotSize, height: spec.dotSize)
                    .accessibilityHidden(true)  // 장식 — 심각도는 값으로 이미 말한다 (04 §7.1)
            }
            Text(text)
                .lineLimit(1)  // 웹 white-space: nowrap
        }
        // 스펙에 fontWeight 필드가 없어 웹 --jd-weight-medium에 대응하는 토큰을 직접 읽는다
        .font(
            JdSwiftUIFont.scaled(
                size: spec.fontSize,
                weight: JdToken.FontWeight.medium,
                category: sizeCategory)
        )
        .foregroundColor(spec.foreground.color)
        .padding(.horizontal, spec.hPadding)
        .padding(.vertical, spec.vPadding)
        .background(spec.background.color)
        // 웹 border-radius: var(--jd-radius-full) — 스펙에 radius 필드가 없어 알약 도형으로 번역
        .clipShape(Capsule(style: .continuous))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(text))
        .accessibilityValue(Text(JdSeverityBadge.severityName(severity) ?? ""))
    }

    /// 심각도명 사전 — UIKit 계층(JdSeverityBadgeView)에 동형 사본이 있다(DEC-010으로 공유 불가).
    /// neutral은 심각도 신호가 아니라 기본값이라 값을 노출하지 않는다(잡음 방지).
    static func severityName(_ severity: JdSeverity) -> String? {
        switch severity {
        case .ok: return "정상"
        case .warn: return "주의"
        case .danger: return "위험"
        case .info: return "정보"
        case .neutral: return nil
        }
    }
}
