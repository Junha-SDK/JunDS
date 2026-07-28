import JunDSCore
import UIKit

// 웹 jd-number-input 동형 — 숫자 입력 + 증감 버튼 (DESIGN-3 §A).
//
// ⚠️ **클램프 타이밍이 계약이다**: 타이핑(editingChanged) 중에는 원시값 그대로 두고,
//    커밋(editingDidEnd)·스텝 버튼에서만 JdNumberInputRules.clamp/stepped를 부른다.
//    v2는 매 키 입력마다 클램프해 min=10 필드에 "50"을 칠 수 없었다 — 재도입 금지.
//
// 이벤트 대응(웹 동형): 타이핑 → onValueChange(jd-input) · 커밋·스텝 → onCommit(jd-change).
// min/max는 Swift.min/max를 가리지 않도록 minValue/maxValue로 둔다(JdTextView.textSize 계보).
public final class JdNumberInputView: UIView {

    /// 편집 중 프로그램 대입은 텍스트를 되쓰지 않는다(부분 입력 보호 — 웹 update() 가드 동형)
    public var value: Double? {
        didSet {
            if !isEditing { field.text = JdNumberInputView.plain(value) }
            applyControls()
        }
    }

    public var minValue: Double? {
        didSet { applyControls() }
    }

    public var maxValue: Double? {
        didSet { applyControls() }
    }

    public var step: Double

    public var isError: Bool {
        didSet { applyBorder() }
    }

    public var hidesControls: Bool {
        didSet { applyControls() }
    }

    public var placeholder: String {
        didSet { applyPlaceholder() }
    }

    public var isEnabled: Bool = true {
        didSet {
            field.isEnabled = isEnabled
            alpha = isEnabled ? 1 : JdToken.Opacity.o50  // 웹 [disabled] opacity-50
            applyControls()
        }
    }

    public var onValueChange: ((Double?) -> Void)?
    public var onCommit: ((Double?) -> Void)?

    /// 편집 중 여부 — isFirstResponder 대신 편집 이벤트로 추적한다(창 없는 환경에서도
    /// 같은 판정이 나오고, 되쓰기 가드·포커스 테두리가 한 소스를 본다)
    private var isEditing = false

    // frame 지정 이니셜라이저로 만든다 — 트레이트를 얹는 init(frame:)이 반드시 지나가게
    private let field = JdNumberField(frame: .zero)
    private let decButton = UIButton(type: .system)
    private let incButton = UIButton(type: .system)
    private let decSeparator = UIView()
    private let incSeparator = UIView()
    private let rootStack = UIStackView()
    private let size: JdNumberInputSize

    public init(
        value: Double? = nil,
        min: Double? = nil,
        max: Double? = nil,
        step: Double = 1,
        size: JdNumberInputSize = .md,
        isError: Bool = false,
        hidesControls: Bool = false,
        placeholder: String = "",
        accessibilityLabel: String? = nil
    ) {
        self.value = value
        self.minValue = min
        self.maxValue = max
        self.step = step
        self.size = size
        self.isError = isError
        self.hidesControls = hidesControls
        self.placeholder = placeholder
        super.init(frame: .zero)

        field.adjustsFontForContentSizeCategory = true
        field.textAlignment = .center
        field.setContentHuggingPriority(.defaultLow, for: .horizontal)
        field.keyboardType = .decimalPad
        field.text = JdNumberInputView.plain(value)
        field.accessibilityLabel = accessibilityLabel ?? placeholder
        field.onAdjust = { [weak self] direction in self?.applyStep(direction) }
        field.addTarget(self, action: #selector(editingChanged), for: .editingChanged)
        field.addTarget(self, action: #selector(editingBegan), for: .editingDidBegin)
        field.addTarget(self, action: #selector(editingEnded), for: .editingDidEnd)
        field.addTarget(self, action: #selector(returnPressed), for: .editingDidEndOnExit)

        configureStepButton(decButton, systemImage: "minus", direction: -1)
        configureStepButton(incButton, systemImage: "plus", direction: 1)

        rootStack.axis = .horizontal
        rootStack.alignment = .fill
        rootStack.spacing = 0
        rootStack.addArrangedSubview(decButton)
        rootStack.addArrangedSubview(decSeparator)
        rootStack.addArrangedSubview(field)
        rootStack.addArrangedSubview(incSeparator)
        rootStack.addArrangedSubview(incButton)
        addSubview(rootStack)

        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        field.jd.layout {
            $0.height.greaterThanOrEqual(size.height)
        }
        for separator in [decSeparator, incSeparator] {
            separator.jd.layout {
                $0.width.equal(JdToken.Border.thin)
            }
        }

        // 스텝 버튼 2개를 따로 노출하지 않는다 — 필드 하나가 .adjustable 컨트롤이다
        // (웹이 버튼에 tabIndex=-1을 준 것과 같은 의도 — DESIGN-3 §A)
        accessibilityElements = [field]

        layer.cornerCurve = .continuous
        applyPlaceholder()
        applyStyle()
        applyControls()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트·심볼은 수동 재적용
        applyStyle()
    }

    public override func becomeFirstResponder() -> Bool {
        return field.becomeFirstResponder()
    }

    public override func resignFirstResponder() -> Bool {
        return field.resignFirstResponder()
    }

    // MARK: - 구성

    private func configureStepButton(_ button: UIButton, systemImage: String, direction: Int) {
        button.tag = direction
        button.setImage(UIImage(systemName: systemImage), for: .normal)
        button.tintColor = JdToken.Color.muted.uiColor
        button.setContentHuggingPriority(.required, for: .horizontal)
        // 접근성 노출은 필드 하나로 합쳐진다(accessibilityElements) — 버튼은 시각 전용
        button.isAccessibilityElement = false
        button.addTarget(self, action: #selector(didTapStep(_:)), for: .touchUpInside)
        // 웹 스텝 버튼 폭 28px에 대응하는 토큰 부재분 — 하한만 두고 Dynamic Type에서 자란다
        button.jd.layout {
            $0.width.greaterThanOrEqual(JdToken.Space.s8)  // 32
        }
    }

    private func applyPlaceholder() {
        field.attributedPlaceholder = NSAttributedString(
            string: placeholder,
            attributes: [.foregroundColor: JdToken.Color.mutedLight.uiColor]
        )
    }

    private func applyStyle() {
        field.font = JdFontBridge.scaledFont(
            size: size.fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        field.textColor = JdToken.Color.foreground.uiColor
        let symbolFont = JdFontBridge.scaledFont(
            size: size.fontSize,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        let configuration = UIImage.SymbolConfiguration(font: symbolFont)
        decButton.setPreferredSymbolConfiguration(configuration, forImageIn: .normal)
        incButton.setPreferredSymbolConfiguration(configuration, forImageIn: .normal)
        decSeparator.backgroundColor = JdToken.Color.border.uiColor
        incSeparator.backgroundColor = JdToken.Color.border.uiColor
        backgroundColor = JdToken.Color.card.uiColor
        layer.cornerRadius = JdToken.Radius.lg
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
        layer.borderWidth = JdToken.Border.thin
        layer.borderColor = color.uiColor.resolvedColor(with: traitCollection).cgColor
    }

    /// 버튼 활성·가시성 — 경계 판정은 Core의 canIncrement/canDecrement가 유일 소스다
    private func applyControls() {
        decButton.isEnabled = isEnabled && JdNumberInputRules.canDecrement(value, min: minValue)
        incButton.isEnabled = isEnabled && JdNumberInputRules.canIncrement(value, max: maxValue)
        decButton.alpha = decButton.isEnabled ? 1 : JdToken.Opacity.o30  // 웹 :disabled opacity-30
        incButton.alpha = incButton.isEnabled ? 1 : JdToken.Opacity.o30
        for view in [decButton, incButton, decSeparator, incSeparator] {
            view.isHidden = hidesControls
        }
        field.accessibilityValue = field.text
    }

    // MARK: - 값 규칙 (판정은 전부 Core)

    @objc private func editingChanged() {
        // 타이핑 중에는 클램프하지 않는다 (계약)
        value = Double(field.text ?? "")
        onValueChange?(value)
    }

    @objc private func editingBegan() {
        isEditing = true
        applyBorder()
    }

    @objc private func editingEnded() {
        isEditing = false
        applyBorder()
        commit()
    }

    @objc private func returnPressed() {
        _ = field.resignFirstResponder()
    }

    @objc private func didTapStep(_ sender: UIButton) {
        applyStep(sender.tag)
    }

    private func commit() {
        guard let raw = Double(field.text ?? "") else {
            // 빈 값은 빈 값으로 유지한다 (웹 NaN 센티널 동형 — v2는 0을 강제했다)
            value = nil
            field.text = ""
            onCommit?(nil)
            return
        }
        value = JdNumberInputRules.clamp(raw, min: minValue, max: maxValue)
        field.text = JdNumberInputView.plain(value)
        onCommit?(value)
    }

    private func applyStep(_ direction: Int) {
        guard isEnabled else { return }
        value = JdNumberInputRules.stepped(
            value, direction: direction, step: step,
            min: minValue, max: maxValue)
        field.text = JdNumberInputView.plain(value)
        onCommit?(value)
    }

    /// 웹 String(value) 동형 — 편집 문자열엔 로케일 포맷을 쓰지 않는다(구분자가 섞이면
    /// decimalPad로 다시 칠 수 없다). 표시용 포맷은 JdCurrencyInputView의 몫이다.
    static func plain(_ value: Double?) -> String {
        guard let value else { return "" }
        if value == value.rounded(), abs(value) < 1e15 {
            return String(Int64(value))
        }
        return String(value)
    }
}

/// 좌우 여백 + 조절 가능 트레이트를 얹은 필드. 스텝 버튼을 접근성에서 감추는 대신
/// **이 필드 하나**를 VoiceOver로 증감할 수 있게 만든다(컨트롤 하나 = 요소 하나, 04 §7.1).
private final class JdNumberField: UITextField {
    var onAdjust: ((Int) -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        accessibilityTraits.insert(.adjustable)
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    override func accessibilityIncrement() {
        onAdjust?(1)
    }

    override func accessibilityDecrement() {
        onAdjust?(-1)
    }

    override func textRect(forBounds bounds: CGRect) -> CGRect {
        bounds.insetBy(dx: JdToken.Space.s2, dy: 0)
    }

    override func editingRect(forBounds bounds: CGRect) -> CGRect {
        bounds.insetBy(dx: JdToken.Space.s2, dy: 0)
    }

    override func placeholderRect(forBounds bounds: CGRect) -> CGRect {
        bounds.insetBy(dx: JdToken.Space.s2, dy: 0)
    }
}
