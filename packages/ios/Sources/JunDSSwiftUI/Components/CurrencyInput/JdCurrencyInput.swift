import SwiftUI
import JunDSCore

// 웹 jd-currency-input 동형 — 통화 포맷 금액 입력 (DESIGN-3 §A).
//
// 표기 전환 계약(웹 동형): **포커스 중엔 원시 숫자, 포커스 해제 시 통화 포맷**.
// 포맷 문자열은 전부 JdNumberFormat.string(style: .currency, …)가 만든다 —
// 통화별 소수 자릿수·구분자 규칙을 렌더 계층이 다시 판단하지 않는다(04 §4.2 규칙 3).
// "값 없음"은 nil이고 빈 값은 빈 값으로 유지한다(v2는 0을 강제해 필드를 비울 수 없었다).
public struct JdCurrencyInput: View {
    @Binding private var value: Double?
    private let currency: String
    private let locale: String
    private let spec: JdTextFieldSpec
    private let isError: Bool
    private let placeholder: String
    private let label: String?

    /// 화면에 실제로 실리는 문자열 — 포커스 상태에 따라 원시/포맷이 갈린다
    @State private var draft: String

    @FocusState private var isFocused: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    public init(value: Binding<Double?>,
                currency: String = "KRW",
                locale: String = "ko-KR",
                size: JdControlSize = .md,
                isError: Bool = false,
                placeholder: String = "",
                accessibilityLabel: String? = nil) {
        self._value = value
        self.currency = currency
        self.locale = locale
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.isError = isError
        self.placeholder = placeholder
        self.label = accessibilityLabel
        self._draft = State(initialValue: JdCurrencyInput.formatted(value.wrappedValue,
                                                                    currency: currency,
                                                                    locale: locale))
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        TextField(placeholder, text: $draft)
            .focused($isFocused)
            // 통화 기호·구분자를 담아야 하므로 숫자 전용 필드가 아니다 (웹 type=text 동형)
            .keyboardType(.decimalPad)
            .font(JdSwiftUIFont.scaled(size: spec.fontSize,
                                       weight: JdToken.FontWeight.normal,
                                       category: sizeCategory))
            .foregroundColor(JdToken.Color.foreground.color)
            .padding(.horizontal, spec.hPadding)
            .frame(minHeight: spec.minHeight)
            .background(JdToken.Color.card.color)
            .clipShape(shape)
            .overlay(shape.strokeBorder(borderColor, lineWidth: JdToken.Border.thin))
            .opacity(isEnabled ? 1 : spec.disabledOpacity)
            .onChange(of: draft) { newValue in
                // 입력 중에는 포맷하지 않는다 — 숫자만 걷어 값으로 옮긴다
                value = JdCurrencyInput.parse(newValue)
            }
            .onChange(of: isFocused) { focused in
                // 포커스 진입은 원시값으로, 이탈은 통화 표기로 (웹 focus/blur 동형)
                draft = focused
                    ? JdCurrencyInput.plain(value)
                    : JdCurrencyInput.formatted(value, currency: currency, locale: locale)
            }
            .onChange(of: value) { newValue in
                if !isFocused {
                    draft = JdCurrencyInput.formatted(newValue, currency: currency, locale: locale)
                }
            }
            .accessibilityLabel(Text(label ?? placeholder))
            // 낭독은 항상 포맷 표기 — 편집 중이라도 "얼마인지"가 들려야 한다
            .accessibilityValue(Text(JdCurrencyInput.formatted(value, currency: currency, locale: locale)))
    }

    private var borderColor: Color {
        if isError { return JdToken.Color.danger.color }
        if isFocused { return JdToken.Color.primary.color }
        return JdToken.Color.border.color
    }

    // MARK: - 문자열 ↔ 값
    //
    // 포맷은 Core가 유일 소스다. 여기 남는 것은 그 역방향(사용자 문자열 → 숫자)뿐이고,
    // Core에 대응 함수가 없어 웹 `replace(/[^\d.-]/g, "")`와 같은 규칙을 최소로만 둔다.

    static func parse(_ text: String) -> Double? {
        let filtered = text.filter { $0.isNumber || $0 == "." || $0 == "-" }
        return Double(filtered)
    }

    static func formatted(_ value: Double?, currency: String, locale: String) -> String {
        guard let value else { return "" }
        return JdNumberFormat.string(value: value, style: .currency, currency: currency, locale: locale)
    }

    /// 편집 중 표기 — 웹 String(value) 동형(구분자 없는 원시 숫자)
    static func plain(_ value: Double?) -> String {
        guard let value else { return "" }
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}
