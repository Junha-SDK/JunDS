import JunDSCore
import SwiftUI

public struct JdButton: View {
    private let title: String
    private let spec: JdButtonSpec
    private let isLoading: Bool
    private let action: () -> Void

    public init(
        _ title: String,
        variant: JdButtonVariant = .primary,
        size: JdControlSize = .md,
        loading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.spec = JdButtonSpec.resolve(variant: variant, size: size)
        self.isLoading = loading
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: JdToken.Space.s2) {
                if isLoading {
                    ProgressView()
                        .tint(spec.foreground.color)
                }
                Text(title)
            }
        }
        .buttonStyle(JdButtonPressStyle(spec: spec))
        .disabled(isLoading)
        .accessibilityValue(isLoading ? Text("로딩 중") : Text(""))
    }
}

struct JdButtonPressStyle: ButtonStyle {
    let spec: JdButtonSpec
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.sizeCategory) private var sizeCategory

    func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        let background = configuration.isPressed ? spec.pressedBackground : spec.background
        return configuration.label
            .font(
                JdSwiftUIFont.scaled(
                    size: spec.fontSize, weight: spec.fontWeight, category: sizeCategory)
            )
            .padding(.horizontal, spec.hPadding)
            .frame(minHeight: spec.minHeight)  // 고정 height 금지 — XXXL에서 자란다 (04 §7.2)
            .foregroundColor(spec.foreground.color)
            .background(background.color)
            .clipShape(shape)
            .overlay(borderOverlay(shape))
            // 융기 (DEC-039) — 눌리면 그림자를 거두어 면이 바닥에 닿게 한다.
            // 색만 바뀌는 버튼은 손가락이 픽셀을 가려서 아무 반응도 없는 것으로 읽힌다.
            .jdElevation(
                configuration.isPressed ? JdToken.Shadow.none : JdToken.Shadow.xs, in: shape
            )
            // 눌림은 면적으로 — reduceMotion이면 JdMotion이 애니메이션을 nil로 낮춘다
            .jdPressScale(configuration.isPressed && !reduceMotion)
            .opacity(isEnabled ? 1 : spec.disabledOpacity)
            .animation(
                reduceMotion ? nil : .easeOut(duration: JdToken.Duration.press),
                value: configuration.isPressed)
    }

    @ViewBuilder
    private func borderOverlay(_ shape: RoundedRectangle) -> some View {
        if let border = spec.border {
            shape.strokeBorder(border.color, lineWidth: JdToken.Border.thin)
        }
    }
}
