import JunDSCore
import SwiftUI

// 웹 jd-number-input 동형 — 숫자 입력 + 증감 버튼 (DESIGN-3 §A).
//
// ⚠️ **클램프 타이밍이 이 컴포넌트의 계약이다**(JdNumberInputRules 주석 · 웹 §1.5):
//    타이핑 중에는 클램프하지 않고 커밋(포커스 종료)·스텝 버튼에서만 Core의
//    clamp/stepped를 부른다. v2는 매 키 입력마다 클램프해서 min=10인 필드에 "50"을
//    칠 수 없었다("5"가 즉시 "10"으로 덮임) — 재도입 금지.
// ⚠️ 크기 램프는 컨트롤(32/40/48)이 아니라 JdNumberInputSize(32/36/44)다.
public struct JdNumberInput: View {
    @Binding private var value: Double?
    private let lowerBound: Double?
    private let upperBound: Double?
    private let step: Double
    private let size: JdNumberInputSize
    private let isError: Bool
    private let hidesControls: Bool
    private let placeholder: String
    private let label: String?

    /// 타이핑 중인 원시 문자열 — value와 분리돼 있어야 "부분 입력"이 살아남는다
    /// (예: min=10에서 "5"를 치는 중간 상태, 소수점만 찍은 "1.")
    @State private var draft: String

    @FocusState private var isFocused: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.sizeCategory) private var sizeCategory

    public init(
        value: Binding<Double?>,
        min: Double? = nil,
        max: Double? = nil,
        step: Double = 1,
        size: JdNumberInputSize = .md,
        isError: Bool = false,
        hidesControls: Bool = false,
        placeholder: String = "",
        accessibilityLabel: String? = nil
    ) {
        self._value = value
        self.lowerBound = min
        self.upperBound = max
        self.step = step
        self.size = size
        self.isError = isError
        self.hidesControls = hidesControls
        self.placeholder = placeholder
        self.label = accessibilityLabel
        self._draft = State(initialValue: JdNumberInput.plain(value.wrappedValue))
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous)
        HStack(spacing: 0) {
            if !hidesControls {
                stepButton(direction: -1, systemImage: "minus")
                separator
            }
            field
            if !hidesControls {
                separator
                stepButton(direction: 1, systemImage: "plus")
            }
        }
        .background(JdToken.Color.card.color)
        .clipShape(shape)
        .overlay(shape.strokeBorder(borderColor, lineWidth: JdToken.Border.thin))
        .opacity(isEnabled ? 1 : JdToken.Opacity.o50)  // 웹 [disabled] opacity-50
    }

    // MARK: - 조각

    private var field: some View {
        TextField(placeholder, text: $draft)
            .focused($isFocused)
            .keyboardType(.decimalPad)
            .multilineTextAlignment(.center)
            .font(
                JdSwiftUIFont.scaled(
                    size: size.fontSize,
                    weight: JdToken.FontWeight.normal,
                    category: sizeCategory)
            )
            .foregroundColor(JdToken.Color.foreground.color)
            .padding(.horizontal, JdToken.Space.s2)
            .frame(minHeight: size.height)
            // 타이핑 중: 원시값만 반영하고 클램프하지 않는다 (계약)
            .onChange(of: draft) { newValue in
                value = Double(newValue)
            }
            // 커밋(포커스 종료)에서만 클램프한다 (계약)
            .onChange(of: isFocused) { focused in
                if !focused { commit() }
            }
            // 외부 변경 반영 — 편집 중에는 되쓰지 않는다(부분 입력 보호, 웹 update() 가드 동형)
            .onChange(of: value) { newValue in
                if !isFocused { draft = JdNumberInput.plain(newValue) }
            }
            .accessibilityLabel(Text(label ?? placeholder))
            .accessibilityValue(Text(draft))
            // 스텝 버튼 2개를 따로 노출하지 않고 컨트롤 하나를 조절 가능하게 만든다
            // (웹이 버튼에 tabIndex=-1을 준 것과 같은 의도 — DESIGN-3 §A)
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: applyStep(1)
                case .decrement: applyStep(-1)
                @unknown default: break
                }
            }
    }

    /// 웹 좌/우 버튼 사이 구분선 — border-inline-start/end 동형
    private var separator: some View {
        Rectangle()
            .fill(JdToken.Color.border.color)
            .frame(width: JdToken.Border.thin)
            .accessibilityHidden(true)
    }

    /// 웹 버튼의 aria-label("감소"/"증가")은 이식하지 않는다 — 버튼을 접근성에서 감추고
    /// 필드 하나를 .adjustable로 노출하는 것이 이 계약의 a11y 표면이다.
    private func stepButton(direction: Int, systemImage: String) -> some View {
        let enabled =
            direction > 0
            ? JdNumberInputRules.canIncrement(value, max: upperBound)
            : JdNumberInputRules.canDecrement(value, min: lowerBound)
        return Button {
            applyStep(direction)
        } label: {
            Image(systemName: systemImage)
                .font(
                    JdSwiftUIFont.scaled(
                        size: size.fontSize,
                        weight: JdToken.FontWeight.medium,
                        category: sizeCategory)
                )
                .foregroundColor(JdToken.Color.muted.color)
                .padding(.horizontal, JdToken.Space.s2_5)
                .frame(minHeight: size.height)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(!enabled)
        .opacity(enabled ? 1 : JdToken.Opacity.o30)  // 웹 :disabled opacity-30
        .accessibilityHidden(true)
    }

    // MARK: - 값 규칙 (판정은 전부 Core — 여기서 재구현하지 않는다)

    private var borderColor: Color {
        if isError { return JdToken.Color.danger.color }
        if isFocused { return JdToken.Color.primary.color }
        return JdToken.Color.border.color
    }

    private func commit() {
        guard let raw = Double(draft) else {
            // 빈 값은 빈 값으로 유지한다 (웹 NaN 센티널 동형 — v2는 0을 강제했다)
            value = nil
            draft = ""
            return
        }
        let clamped = JdNumberInputRules.clamp(raw, min: lowerBound, max: upperBound)
        value = clamped
        draft = JdNumberInput.plain(clamped)
    }

    private func applyStep(_ direction: Int) {
        let next = JdNumberInputRules.stepped(
            value, direction: direction, step: step,
            min: lowerBound, max: upperBound)
        value = next
        draft = JdNumberInput.plain(next)
    }

    /// 웹 String(value) 동형 — 편집 문자열은 로케일 포맷을 쓰지 않는다(천단위 구분자가
    /// 섞이면 decimalPad로 다시 칠 수 없다). 표시용 포맷은 JdCurrencyInput의 몫이다.
    private static func plain(_ value: Double?) -> String {
        guard let value else { return "" }
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}
