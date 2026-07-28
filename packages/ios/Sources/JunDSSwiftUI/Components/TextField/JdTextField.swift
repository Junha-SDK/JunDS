import JunDSCore
import SwiftUI

public struct JdTextField: View {
    private let label: String?
    private let placeholder: String
    @Binding private var text: String
    private let spec: JdTextFieldSpec
    private let error: String?
    private let onCommit: (() -> Void)?

    @FocusState private var isFocused: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        _ label: String? = nil,
        placeholder: String = "",
        text: Binding<String>,
        size: JdControlSize = .md,
        error: String? = nil,
        onCommit: (() -> Void)? = nil
    ) {
        self.label = label
        self.placeholder = placeholder
        self._text = text
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.error = error
        self.onCommit = onCommit
    }

    private var hasError: Bool {
        if let error, !error.isEmpty { return true }
        return false
    }

    private var borderColor: Color {
        if hasError { return JdToken.Color.danger.color }
        if isFocused { return JdToken.Color.primary.color }
        return JdToken.Color.border.color
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        VStack(alignment: .leading, spacing: JdToken.Space.s1_5) {
            if let label, !label.isEmpty {
                Text(label)
                    .font(
                        JdSwiftUIFont.scaled(
                            size: spec.labelFontSize, weight: spec.labelFontWeight,
                            category: sizeCategory)
                    )
                    .foregroundColor(JdToken.Color.foreground.color)
            }
            TextField(placeholder, text: $text)
                .focused($isFocused)
                .onSubmit { onCommit?() }
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.fontSize, weight: JdToken.FontWeight.normal,
                        category: sizeCategory)
                )
                .foregroundColor(JdToken.Color.foreground.color)
                .padding(.horizontal, spec.hPadding)
                .frame(minHeight: spec.minHeight)
                .background(JdToken.Color.card.color)
                .clipShape(shape)
                .overlay(shape.strokeBorder(borderColor, lineWidth: JdToken.Border.thin))
                .opacity(isEnabled ? 1 : spec.disabledOpacity)
                .accessibilityLabel(Text(label ?? placeholder))
                .accessibilityHint(hasError ? Text(error ?? "") : Text(""))
            if hasError, let error {
                HStack(spacing: JdToken.Space.s1) {
                    Image(systemName: "exclamationmark.circle")
                    Text(error)
                }
                .font(
                    JdSwiftUIFont.scaled(
                        size: spec.errorFontSize, weight: JdToken.FontWeight.normal,
                        category: sizeCategory)
                )
                .foregroundColor(JdToken.Color.danger.color)
            }
        }
    }
}
