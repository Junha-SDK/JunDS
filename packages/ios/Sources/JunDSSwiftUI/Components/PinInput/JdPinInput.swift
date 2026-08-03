import JunDSCore
import SwiftUI

// 웹 jd-pin-input 동형 — 자릿수 분할 코드 입력 (DESIGN-3 §A).
// **OTPInput은 별도 타입이 아니라 이 컴포넌트의 설정 변형이다**(alphanumeric=false +
// .oneTimeCode 자동완성) — R12 Switch=Toggle 선례.
//
// 셀 표시·정리·포커스 인덱스·완료 판정은 전부 JdPinRules다(재구현 금지).
//
// ⚠️ 셀마다 TextField를 두는 구성은 iOS 16 SwiftUI에서 성립하지 않는다: 빈 칸의
//    Backspace가 바인딩을 건드리지 않아 관측 불가하고, masked 칸을 SecureField로 바꾸면
//    JdPinRules.cellText(masked:)가 무력화되며, 한 번에 붙여넣기도 칸별로 쪼개진다.
//    그래서 **값을 쥔 입력 필드는 하나**이고 칸은 파생 표시다 — 붙여넣기 한 번에 전체가
//    채워지고(sanitize가 그대로 처리) 접근성 요소도 자연히 하나로 합쳐진다.
public struct JdPinInput: View {
    @Binding private var value: String
    private let length: Int
    private let masked: Bool
    private let alphanumeric: Bool
    private let isError: Bool
    private let label: String?
    private let onComplete: ((String) -> Void)?

    /// 값을 쥔 단일 필드의 포커스 — 칸 강조 인덱스는 JdPinRules.focusIndex가 판정한다
    @FocusState private var focusedField: Int?
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    /// 웹 v2 PinInput 칸: 40×48. 토큰 조합으로만 표기한다(전용 스펙 부재분)
    private static let cellWidth = JdToken.Space.s10  // 40
    private static let cellHeight = JdToken.Space.s12  // 48

    public init(
        value: Binding<String>,
        length: Int = 6,
        masked: Bool = false,
        alphanumeric: Bool = false,
        isError: Bool = false,
        accessibilityLabel: String? = nil,
        onComplete: ((String) -> Void)? = nil
    ) {
        self._value = value
        self.length = length
        self.masked = masked
        self.alphanumeric = alphanumeric
        self.isError = isError
        self.label = accessibilityLabel
        self.onComplete = onComplete
    }

    public var body: some View {
        HStack(spacing: JdToken.Space.s2) {
            ForEach(0..<max(length, 0), id: \.self) { index in
                cell(index)
            }
        }
        .overlay(inputProxy)
        .accessibilityElement(children: .contain)
        .opacity(isEnabled ? 1 : JdToken.Opacity.o50)  // 웹 :disabled opacity-50
    }

    // MARK: - 칸 (표시 전용 — 값은 프록시 필드가 쥔다)

    private func cell(_ index: Int) -> some View {
        let shape = RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous)
        let text = JdPinRules.cellText(value, index: index, masked: masked) ?? ""
        return Text(text)
            .font(
                JdSwiftUIFont.scaled(
                    size: JdToken.FontSize.lg,
                    weight: JdToken.FontWeight.bold,
                    category: sizeCategory)
            )
            .foregroundColor(JdToken.Color.foreground.color)
            .frame(width: Self.cellWidth, height: Self.cellHeight)
            .background(JdToken.Color.card.color)
            .clipShape(shape)
            .overlay(shape.strokeBorder(borderColor(index), lineWidth: JdToken.Border.thin))
            .accessibilityHidden(true)
    }

    private func borderColor(_ index: Int) -> Color {
        if isError { return JdToken.Color.danger.color }
        // 다음 입력이 들어갈 칸을 강조한다 — 인덱스 판정은 Core
        if focusedField != nil, index == JdPinRules.focusIndex(value, length: length) {
            return JdToken.Color.primary.color
        }
        return JdToken.Color.border.color
    }

    // MARK: - 값을 쥔 단일 필드

    /// 글자·캐럿을 감춘 채 칸 위를 덮는다 — 어느 칸을 눌러도 키보드가 올라온다.
    /// 접근성에서는 이 필드 하나만 노출되고 값은 "입력된 자리수"다(DESIGN-3 §A).
    private var inputProxy: some View {
        TextField("", text: sanitized)
            .focused($focusedField, equals: 0)
            .keyboardType(alphanumeric ? .asciiCapable : .numberPad)
            .textContentType(.oneTimeCode)
            .autocorrectionDisabled(true)
            .textInputAutocapitalization(.never)
            .foregroundColor(.clear)
            .tint(.clear)
            .accessibilityLabel(Text(label ?? "인증 번호 입력"))
            .accessibilityValue(Text("\(value.count)자리 입력됨"))
            .contentShape(Rectangle())
    }

    private var sanitized: Binding<String> {
        Binding(
            get: { value },
            set: { raw in
                let next = JdPinRules.sanitize(raw, length: length, alphanumeric: alphanumeric)
                guard next != value else { return }
                value = next
                if JdPinRules.isComplete(next, length: length) {
                    onComplete?(next)
                }
            })
    }
}
