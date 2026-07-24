import SwiftUI
import JunDSCore

// 웹 jd-password-input 동형 — 표시 토글 + 강도 게이지 + 규칙 체크리스트 (DESIGN-3 §A).
//
// 강도·규칙 판정은 전부 JdPasswordStrength.evaluate다(점수·라벨·tone 포함) — 렌더는
// 결과만 그린다. 막대 색은 tone(JdSeverity)을 JdSeverityBadgeSpec에 넘겨 재사용한다
// (색 어휘를 새로 만들지 않는다 — 04 §4.2 규칙 1).
public struct JdPasswordInput: View {
    @Binding private var text: String
    private let placeholder: String
    private let spec: JdTextFieldSpec
    private let isError: Bool
    private let showsStrength: Bool
    private let showsRules: Bool
    private let label: String?

    @State private var isRevealed = false
    @FocusState private var isFocused: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    public init(text: Binding<String>,
                placeholder: String = "",
                size: JdControlSize = .md,
                isError: Bool = false,
                showsStrength: Bool = false,
                showsRules: Bool = false,
                accessibilityLabel: String? = nil) {
        self._text = text
        self.placeholder = placeholder
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.isError = isError
        self.showsStrength = showsStrength
        self.showsRules = showsRules
        self.label = accessibilityLabel
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JdToken.Space.s2) {
            fieldRow
            // 빈 값에는 강도를 매기지 않는다(웹 level "none" 동형) — Core 점수는 0이지만
            // 라벨은 "약함"이라 빈 필드에 경고를 띄우게 되므로 행 자체를 감춘다
            if showsStrength, !text.isEmpty {
                strengthRow
            }
            if showsRules {
                rulesList
            }
        }
    }

    // MARK: - 입력 행

    private var fieldRow: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        return HStack(spacing: JdToken.Space.s2) {
            secureOrPlainField
                .font(JdSwiftUIFont.scaled(size: spec.fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           category: sizeCategory))
                .foregroundColor(JdToken.Color.foreground.color)
                .textContentType(.password)
                .autocorrectionDisabled(true)
                .textInputAutocapitalization(.never)
                .focused($isFocused)
                .accessibilityLabel(Text(label ?? placeholder))
                .accessibilityValue(Text(isError ? "오류" : ""))
            revealToggle
        }
        .padding(.horizontal, spec.hPadding)
        .frame(minHeight: spec.minHeight)
        .background(JdToken.Color.card.color)
        .clipShape(shape)
        .overlay(shape.strokeBorder(borderColor, lineWidth: JdToken.Border.thin))
        .opacity(isEnabled ? 1 : spec.disabledOpacity)
    }

    // SecureField ↔ TextField 교체가 iOS의 표시/숨김 관용구다(웹 type 전환 동형)
    @ViewBuilder
    private var secureOrPlainField: some View {
        if isRevealed {
            TextField(placeholder, text: $text)
        } else {
            SecureField(placeholder, text: $text)
        }
    }

    private var revealToggle: some View {
        Button {
            isRevealed.toggle()
        } label: {
            Image(systemName: isRevealed ? "eye.slash" : "eye")
                .font(JdSwiftUIFont.scaled(size: spec.fontSize,
                                           weight: JdToken.FontWeight.medium,
                                           category: sizeCategory))
                .foregroundColor(JdToken.Color.muted.color)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(isRevealed ? "비밀번호 숨기기" : "비밀번호 표시"))
    }

    // MARK: - 강도 게이지 (판정은 Core, 색은 SeverityBadge 스펙 재사용)

    private var strength: JdPasswordStrength {
        JdPasswordStrength.evaluate(text)
    }

    private var strengthRow: some View {
        let current = strength
        let tone = JdSeverityBadgeSpec.resolve(severity: current.tone, size: .md)
        return HStack(spacing: JdToken.Space.s1) {
            ForEach(0..<JdPasswordRule.allCases.count, id: \.self) { index in
                Capsule()
                    // 막대는 그래픽이라 도트 색(원색), 글자는 텍스트 대비용 전경색을 쓴다
                    .fill(index < current.score ? tone.dotColor.color : JdToken.Color.border.color)
                    .frame(height: JdToken.Space.s1)
            }
            Text(current.label)
                .font(JdSwiftUIFont.scaled(size: JdToken.FontSize.xs,
                                           weight: JdToken.FontWeight.semibold,
                                           category: sizeCategory))
                .foregroundColor(tone.foreground.color)
                .padding(.leading, JdToken.Space.s1_5)
        }
        // 막대는 장식이고 문구가 상태를 말한다 — 요소 하나로 합친다 (04 §7.1)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("비밀번호 강도"))
        .accessibilityValue(Text(current.label))
    }

    // MARK: - 규칙 체크리스트

    private var rulesList: some View {
        let current = strength
        return VStack(alignment: .leading, spacing: JdToken.Space.s1) {
            ForEach(JdPasswordRule.allCases, id: \.self) { rule in
                let passed = current.isSatisfied(rule)
                HStack(spacing: JdToken.Space.s1_5) {
                    Image(systemName: passed ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(passed ? JdToken.Color.success.color : JdToken.Color.mutedLight.color)
                    Text(rule.label)
                        .foregroundColor(passed ? JdToken.Color.success.color : JdToken.Color.muted.color)
                }
                .font(JdSwiftUIFont.scaled(size: JdToken.FontSize.xs,
                                           weight: JdToken.FontWeight.normal,
                                           category: sizeCategory))
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Text(rule.label))
                .accessibilityValue(Text(passed ? "충족" : "미충족"))
            }
        }
    }

    private var borderColor: Color {
        if isError { return JdToken.Color.danger.color }
        if isFocused { return JdToken.Color.primary.color }
        return JdToken.Color.border.color
    }
}
