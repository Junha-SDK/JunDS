import SwiftUI
import JunDSCore

// 웹 jd-phone-input 동형 — 국가 코드 + 전화번호 (DESIGN-3 §A).
//
// 마스킹은 전부 JdPhoneMask.format이 한다 — 국가별 그룹 규칙을 렌더가 다시 알지 않는다.
// value는 웹과 같이 **숫자만** 보관하고 하이픈은 표시 전용이다.
// 국가 선택은 시스템 Picker(.menu) 위임 — v2 수제 드롭다운의 키보드·role 결함을 물려받지 않는다.
public struct JdPhoneInput: View {
    @Binding private var value: String
    @Binding private var country: JdPhoneCountry
    private let spec: JdTextFieldSpec
    private let isError: Bool
    private let label: String?

    @FocusState private var isFocused: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    public init(value: Binding<String>,
                country: Binding<JdPhoneCountry>,
                size: JdControlSize = .md,
                isError: Bool = false,
                accessibilityLabel: String? = nil) {
        self._value = value
        self._country = country
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.isError = isError
        self.label = accessibilityLabel
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: spec.radius, style: .continuous)
        HStack(spacing: JdToken.Space.s2) {
            picker
            TextField("", text: masked)
                .focused($isFocused)
                .keyboardType(.phonePad)
                .font(JdSwiftUIFont.scaled(size: spec.fontSize,
                                           weight: JdToken.FontWeight.normal,
                                           category: sizeCategory))
                .foregroundColor(JdToken.Color.foreground.color)
                .accessibilityLabel(Text(label ?? "전화번호"))
                // 낭독 값은 국제 표기 — 국가번호가 빠진 채 읽히지 않게 한다
                .accessibilityValue(Text(JdPhoneMask.fullNumber(value, country: country)))
        }
        .padding(.horizontal, spec.hPadding)
        .frame(minHeight: spec.minHeight)
        .background(JdToken.Color.card.color)
        .clipShape(shape)
        .overlay(shape.strokeBorder(borderColor, lineWidth: JdToken.Border.thin))
        .opacity(isEnabled ? 1 : spec.disabledOpacity)
    }

    private var picker: some View {
        Picker("국가 선택", selection: $country) {
            ForEach(JdPhoneCountry.allCases, id: \.self) { item in
                Text(item.dialCode).tag(item)
            }
        }
        .pickerStyle(.menu)
        .tint(JdToken.Color.muted.color)
        .accessibilityLabel(Text("국가 선택"))
    }

    private var borderColor: Color {
        if isError { return JdToken.Color.danger.color }
        if isFocused { return JdToken.Color.primary.color }
        return JdToken.Color.border.color
    }

    /// 표시는 마스킹, 저장은 숫자 — 규칙의 단일 소스는 Core다.
    /// (숫자 추출은 Core에 대응 함수가 없어 여기 최소로 둔다 — 웹 replace(/\D/g,"") 동형)
    private var masked: Binding<String> {
        Binding(get: { JdPhoneMask.format(value, country: country) },
                set: { newValue in value = newValue.filter(\.isNumber) })
    }
}
