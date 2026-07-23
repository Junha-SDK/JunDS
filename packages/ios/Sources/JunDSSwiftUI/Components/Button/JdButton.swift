import SwiftUI
import JunDSCore

public struct JdButton: View {
    private let title: String
    private let spec: JdButtonSpec
    private let isLoading: Bool
    private let action: () -> Void

    public init(_ title: String,
                variant: JdButtonVariant = .primary,
                size: JdControlSize = .md,
                loading: Bool = false,
                action: @escaping () -> Void) {
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
            .font(JdSwiftUIFont.scaled(size: spec.fontSize, weight: spec.fontWeight, category: sizeCategory))
            .padding(.horizontal, spec.hPadding)
            .frame(minHeight: spec.minHeight) // 고정 height 금지 — XXXL에서 자란다 (04 §7.2)
            .foregroundColor(spec.foreground.color)
            .background(background.color)
            .clipShape(shape)
            .overlay(borderOverlay(shape))
            .opacity(isEnabled ? 1 : spec.disabledOpacity)
            .animation(reduceMotion ? nil : .easeOut(duration: JdToken.Duration.fast),
                       value: configuration.isPressed)
    }

    @ViewBuilder
    private func borderOverlay(_ shape: RoundedRectangle) -> some View {
        if let border = spec.border {
            shape.strokeBorder(border.color, lineWidth: JdToken.Border.thin)
        }
    }
}
