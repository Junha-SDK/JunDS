import SwiftUI
import JunDSCore

// 웹 jd-back-top 동형 — 버튼만 컴포넌트다 (DESIGN-3 §B).
// 스크롤 자체는 시스템(ScrollViewReader)이 하고, 가시성 판정은 소비자가
// JdBackTop.shouldShow(scrollY:threshold:)로 한다 — 여기서 임계값을 다시 계산하지 않는다.
public struct JdBackTopButton: View {
    private let action: () -> Void
    private let label: String

    public init(action: @escaping () -> Void,
                label: String = JdBackTop.defaultLabel) {
        self.action = action
        self.label = label
    }

    public var body: some View {
        Button(action: action) {
            Image(systemName: "arrow.up")
        }
        .buttonStyle(JdBackTopButtonStyle())
        .accessibilityLabel(Text(label))
    }
}

/// 40pt 원형 + card 배경 + border 1pt + shadow lg (DESIGN-3 §B).
/// 40pt·아이콘 20pt는 아이콘 버튼 lg 스펙에서 그대로 가져오고 형태만 원형으로 바꾼다.
struct JdBackTopButtonStyle: ButtonStyle {
    private let spec = JdIconButtonSpec.resolve(variant: .outline, size: .lg)

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // 변경 시 재평가 + 값을 scaled에 명시 전달 (04 §6)
    @Environment(\.sizeCategory) private var sizeCategory

    func makeBody(configuration: Configuration) -> some View {
        let background = configuration.isPressed ? spec.pressedBackground : JdToken.Color.card
        return configuration.label
            .font(JdSwiftUIFont.scaled(size: spec.iconSize,
                                       weight: JdToken.FontWeight.semibold,
                                       category: sizeCategory))
            .foregroundColor(JdToken.Color.foreground.color)
            .frame(minWidth: spec.side, minHeight: spec.side) // 고정 크기 금지 (04 §7.2)
            .background(background.color)
            .clipShape(Circle())
            .overlay(Circle().strokeBorder(JdToken.Color.border.color,
                                           lineWidth: JdToken.Border.thin))
            .shadow(color: Self.shadowInk.color,
                    radius: Self.shadowGeometry.blur / 2, // CSS blur = 2 × 렌더 반경
                    x: Self.shadowGeometry.x,
                    y: Self.shadowGeometry.y)
            .contentShape(Circle())
            .opacity(isEnabled ? 1 : JdToken.Opacity.o50)
            .animation(reduceMotion ? nil : .easeOut(duration: JdToken.Duration.fast),
                       value: configuration.isPressed)
    }

    // 알파는 토큰 색이 이미 들고 있다 — 레이어 첫 장만 쓴다(JdKeyCap과 같은 승계 규칙)
    private static let shadowInk = JdDynamicColor(
        light: JdToken.Shadow.lg.light.first?.color ?? 0,
        dark: JdToken.Shadow.lg.dark.first?.color ?? 0
    )

    private static let shadowGeometry: JdToken.Shadow.Layer =
        JdToken.Shadow.lg.light.first ?? .init(color: 0, x: 0, y: 0, blur: 0, spread: 0)
}
