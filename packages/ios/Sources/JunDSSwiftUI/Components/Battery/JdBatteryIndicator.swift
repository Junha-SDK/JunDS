import JunDSCore
import SwiftUI
import UIKit

// 웹 jd-battery-indicator 동형 — 배터리형 레벨 표시 (DESIGN-2 §B2).
// 웹은 div 3개(body/fill/cap)뿐이라 role·aria가 전무하다 — 값이 **폭으로만** 전달된다.
// iOS는 요소 1개로 합치고 accessibilityValue로 퍼센트를 노출해 보정한다 (04 §7.1).
// 채움 전환은 JdMotion.duration 경유 — Reduce Motion 시 즉시 반영 (04 §7.3).
public struct JdBatteryIndicator: View {
    private let clamped: Double
    private let label: String?
    private let spec: JdBatterySpec
    private let fill: JdDynamicColor

    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // 캡의 둥근 모서리는 논리 방향(웹 border-start-end-radius) — RTL에서 반대쪽이다
    @Environment(\.layoutDirection) private var layoutDirection

    // 웹은 label이 없어도 요소가 존재한다 — AT에 이름이 필요해 iOS가 신설한 기본 이름
    static let defaultAccessibilityLabel = "배터리"

    public init(
        value: Double,
        size: JdDisplaySize = .md,
        label: String? = nil,
        autoColor: Bool = false,
        color: JdBatteryColor = .primary
    ) {
        self.clamped = JdBatterySpec.clamp(value)
        self.label = label
        self.spec = JdBatterySpec.resolve(size: size)
        // 자동 색 판정도 Core의 순수 함수 — 렌더는 결과 색만 받는다 (04 §4.2 규칙 3)
        self.fill = JdBatterySpec.fillColor(autoColor ? JdBatterySpec.autoColor(for: value) : color)
    }

    public var body: some View {
        // 웹 gap: var(--jd-space-1-5) — 스펙에 gap 필드가 없어 같은 값의 토큰을 직접 읽는다
        HStack(spacing: JdToken.Space.s1_5) {
            if let label, !label.isEmpty {
                Text(label)
                    .font(
                        JdSwiftUIFont.scaled(
                            size: spec.labelFontSize,
                            weight: JdToken.FontWeight.medium,
                            category: sizeCategory)
                    )
                    // 웹 라벨색 #4b5563/#9ca3af는 스펙 부재분 — 시맨틱 등가인 muted로 번역
                    .foregroundColor(JdToken.Color.muted.color)
                    .lineLimit(1)
            }
            batteryBody
            cap
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            Text(
                label.flatMap { $0.isEmpty ? nil : $0 }
                    ?? JdBatteryIndicator.defaultAccessibilityLabel)
        )
        // 폭으로만 전달되던 값을 퍼센트로 노출한다(웹 결함 보정)
        .accessibilityValue(Text(spokenValue))
    }

    // MARK: 내부

    private var innerWidth: CGFloat { max(spec.bodyWidth - spec.borderWidth * 2, 0) }
    private var innerHeight: CGFloat { max(spec.bodyHeight - spec.borderWidth * 2, 0) }
    private var fillWidth: CGFloat { innerWidth * CGFloat(clamped / 100) }

    // 웹 구조: 테두리 상자(overflow:hidden) 안쪽 padding-box를 채움이 왼쪽부터 메운다
    private var batteryBody: some View {
        Rectangle()
            .fill(fill.color)
            .frame(width: fillWidth, height: innerHeight)
            .frame(width: innerWidth, height: innerHeight, alignment: .leading)
            .clipShape(
                RoundedRectangle(
                    cornerRadius: max(spec.radius - spec.borderWidth, 0),
                    style: .continuous)
            )
            .padding(spec.borderWidth)
            .overlay(
                RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
                    .strokeBorder(JdBatterySpec.outlineColor.color, lineWidth: spec.borderWidth)
            )
            .overlay(percentText)
            .animation(fillAnimation, value: clamped)
    }

    // 웹은 lg에서만 % 텍스트를 노출한다 — 임의 채움색 위 판독성은 흰 글자+다크 헤일로 (DEC-027-7)
    @ViewBuilder
    private var percentText: some View {
        if spec.showsPercentText {
            Text(percentDisplay)
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.percentFontSize,
                        weight: JdToken.FontWeight.bold,
                        category: sizeCategory)
                )
                // 스펙에 % 전경색·헤일로 필드가 없다 — 시스템 흰색 + 검정 헤일로(notes 보고분).
                // blur 2는 웹 text-shadow 2px에 대응하는 토큰 값을 빌려 쓴다.
                .foregroundColor(.white)
                .shadow(
                    color: .black.opacity(JdToken.Opacity.o95),
                    radius: JdToken.Space.s0_5
                )
                .accessibilityHidden(true)  // 값은 accessibilityValue가 이미 말한다
        }
    }

    private var cap: some View {
        JdBatteryCapShape(
            radius: spec.radius,
            roundsRightCorners: layoutDirection != .rightToLeft
        )
        .fill(JdBatterySpec.outlineColor.color)
        .frame(width: spec.capWidth, height: spec.capHeight)
    }

    // 웹 transition: all var(--jd-duration-slower) var(--jd-easing-ease-out)
    private var fillAnimation: Animation? {
        guard !reduceMotion else { return nil }
        let duration = JdMotion.duration(JdToken.Duration.slower)
        guard duration > 0 else { return nil }
        let easing = JdToken.Easing.easeOut
        return .timingCurve(easing.0, easing.1, easing.2, easing.3, duration: duration)
    }

    private var percentDisplay: String { "\(Int(clamped.rounded()))%" }

    // VoiceOver는 "%"를 기호로 읽어 넘기는 경우가 있어 단어로 발음시킨다
    private var spokenValue: String { "\(Int(clamped.rounded())) 퍼센트" }
}

// 캡은 바깥쪽 두 모서리만 둥글다 (웹 border-start-end-radius / border-end-end-radius).
// iOS 16 SDK엔 UnevenRoundedRectangle이 없어 UIBezierPath 경유 — 시스템 UIKit 사용은
// 자체 타겟 간 의존이 아니므로 허용 (DEC-010, 04 §4.2).
struct JdBatteryCapShape: Shape {
    let radius: CGFloat
    let roundsRightCorners: Bool

    func path(in rect: CGRect) -> Path {
        let corners: UIRectCorner =
            roundsRightCorners
            ? [.topRight, .bottomRight]
            : [.topLeft, .bottomLeft]
        let bezier = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius))
        return Path(bezier.cgPath)
    }
}
