import UIKit
import JunDSCore

// 웹 jd-currency-input 동형 — 통화 포맷 금액 입력 (DESIGN-3 §A).
//
// 표기 전환 계약(웹 동형): **편집 중엔 원시 숫자, 편집 종료 시 통화 포맷**.
// 포맷 문자열은 전부 JdNumberFormat.string(style: .currency, …)가 만든다 — 통화별
// 소수 자릿수·구분자 규칙을 렌더가 다시 판단하지 않는다(04 §4.2 규칙 3).
// 이벤트 대응: 타이핑 → onValueChange(jd-input) · 편집 종료 → onCommit(jd-change).
public final class JdCurrencyInputView: UIView {

    /// 편집 중 프로그램 대입은 텍스트를 되쓰지 않는다(입력 중 표기 전환 방지)
    public var value: Double? {
        didSet {
            if !isEditing { applyDisplay() }
            field.accessibilityValue = formattedText
        }
    }

    public var currency: String {
        didSet { applyDisplay() }
    }

    public var locale: String {
        didSet { applyDisplay() }
    }

    public var isError: Bool {
        didSet { applyBorder() }
    }

    public var placeholder: String {
        didSet { applyPlaceholder() }
    }

    public var isEnabled: Bool = true {
        didSet {
            field.isEnabled = isEnabled
            alpha = isEnabled ? 1 : spec.disabledOpacity
        }
    }

    public var onValueChange: ((Double?) -> Void)?
    public var onCommit: ((Double?) -> Void)?

    /// 편집 중 여부 — isFirstResponder 대신 편집 이벤트로 추적한다(창 없는 환경에서도
    /// 같은 판정이 나오고, 되쓰기 가드·포커스 테두리가 한 소스를 본다)
    private var isEditing = false

    private let field = JdCurrencyField()
    private let spec: JdTextFieldSpec

    public init(value: Double? = nil,
                currency: String = "KRW",
                locale: String = "ko-KR",
                size: JdControlSize = .md,
                isError: Bool = false,
                placeholder: String = "",
                accessibilityLabel: String? = nil) {
        self.value = value
        self.currency = currency
        self.locale = locale
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.isError = isError
        self.placeholder = placeholder
        super.init(frame: .zero)

        field.hInset = spec.hPadding
        field.adjustsFontForContentSizeCategory = true
        // 통화 기호·구분자를 담아야 하므로 숫자 전용 필드가 아니다 (웹 type=text 동형)
        field.keyboardType = .decimalPad
        field.accessibilityLabel = accessibilityLabel ?? placeholder
        field.addTarget(self, action: #selector(editingChanged), for: .editingChanged)
        field.addTarget(self, action: #selector(editingBegan), for: .editingDidBegin)
        field.addTarget(self, action: #selector(editingEnded), for: .editingDidEnd)
        field.addTarget(self, action: #selector(returnPressed), for: .editingDidEndOnExit)
        addSubview(field)

        field.jd.layout {
            $0.edges.equalToSuperview()
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        field.layer.cornerCurve = .continuous
        applyPlaceholder()
        applyDisplay()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyStyle()
    }

    public override func becomeFirstResponder() -> Bool {
        return field.becomeFirstResponder()
    }

    public override func resignFirstResponder() -> Bool {
        return field.resignFirstResponder()
    }

    // MARK: - 표기 (포맷은 Core가 유일 소스)

    /// 포맷 표기 — 낭독 값도 이것을 쓴다(편집 중이라도 "얼마인지"가 들려야 한다)
    private var formattedText: String {
        guard let value else { return "" }
        return JdNumberFormat.string(value: value, style: .currency, currency: currency, locale: locale)
    }

    private func applyDisplay() {
        field.text = isEditing ? JdCurrencyInputView.plain(value) : formattedText
        field.accessibilityValue = formattedText
    }

    private func applyPlaceholder() {
        field.attributedPlaceholder = NSAttributedString(
            string: placeholder,
            attributes: [.foregroundColor: JdToken.Color.mutedLight.uiColor]
        )
    }

    private func applyStyle() {
        field.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                             weight: JdToken.FontWeight.normal,
                                             compatibleWith: traitCollection)
        field.textColor = JdToken.Color.foreground.uiColor
        field.backgroundColor = JdToken.Color.card.uiColor
        field.layer.cornerRadius = spec.radius
        field.hInset = spec.hPadding
        applyBorder()
    }

    private func applyBorder() {
        let color: JdDynamicColor
        if isError {
            color = JdToken.Color.danger
        } else if isEditing {
            color = JdToken.Color.primary
        } else {
            color = JdToken.Color.border
        }
        field.layer.borderWidth = JdToken.Border.thin
        field.layer.borderColor = color.uiColor.resolvedColor(with: traitCollection).cgColor
    }

    // MARK: - 값

    @objc private func editingChanged() {
        // 입력 중에는 포맷하지 않는다 — 숫자만 걷어 값으로 옮긴다
        value = JdCurrencyInputView.parse(field.text ?? "")
        onValueChange?(value)
    }

    @objc private func editingBegan() {
        isEditing = true
        field.text = JdCurrencyInputView.plain(value) // 원시값으로 전환 (웹 focus 동형)
        applyBorder()
    }

    @objc private func editingEnded() {
        isEditing = false
        applyDisplay() // 통화 표기로 확정 (웹 blur 동형)
        applyBorder()
        onCommit?(value)
    }

    @objc private func returnPressed() {
        _ = field.resignFirstResponder()
    }

    /// 포맷의 역방향 — Core에 대응 함수가 없어 웹 `replace(/[^\d.-]/g, "")` 규칙만 최소로 둔다
    static func parse(_ text: String) -> Double? {
        let filtered = text.filter { $0.isNumber || $0 == "." || $0 == "-" }
        return Double(filtered)
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

private final class JdCurrencyField: UITextField {
    var hInset: CGFloat = JdToken.Space.s3_5

    override func textRect(forBounds bounds: CGRect) -> CGRect {
        bounds.insetBy(dx: hInset, dy: 0)
    }

    override func editingRect(forBounds bounds: CGRect) -> CGRect {
        bounds.insetBy(dx: hInset, dy: 0)
    }

    override func placeholderRect(forBounds bounds: CGRect) -> CGRect {
        bounds.insetBy(dx: hInset, dy: 0)
    }
}
