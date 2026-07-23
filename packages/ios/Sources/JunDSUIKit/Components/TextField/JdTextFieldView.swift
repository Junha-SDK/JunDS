import UIKit
import JunDSCore

public final class JdTextFieldView: UIView {

    public var label: String? {
        didSet { applyText() }
    }

    public var placeholder: String? {
        didSet { applyText() }
    }

    // 웹 error 의미론: 빈 값이 아니면 에러 상태 (메시지가 곧 상태 — DEC-012-5)
    public var error: String? {
        didSet { applyError(announce: error != oldValue) }
    }

    public var size: JdControlSize {
        didSet { resolveAndApply() }
    }

    public var text: String {
        get { field.text ?? "" }
        set {
            // IME 안전: 실제로 다를 때만 되쓴다 (웹 update()와 동일 계약)
            if field.text != newValue { field.text = newValue }
        }
    }

    public var isEnabled: Bool = true {
        didSet {
            field.isEnabled = isEnabled
            field.alpha = isEnabled ? 1 : spec.disabledOpacity
        }
    }

    public var onTextChange: ((String) -> Void)?
    public var onCommit: ((String) -> Void)?

    private let labelView = UILabel()
    private let field = JdPaddedTextField()
    private let errorIcon = UIImageView(image: UIImage(systemName: "exclamationmark.circle"))
    private let errorLabel = UILabel()
    private let errorStack = UIStackView()
    private let rootStack = UIStackView()
    private var spec: JdTextFieldSpec

    public init(label: String? = nil,
                placeholder: String? = nil,
                size: JdControlSize = .md) {
        self.label = label
        self.placeholder = placeholder
        self.size = size
        self.spec = JdTextFieldSpec.resolve(size: size)
        super.init(frame: .zero)

        labelView.adjustsFontForContentSizeCategory = true
        labelView.numberOfLines = 0

        field.adjustsFontForContentSizeCategory = true
        field.autocapitalizationType = .none
        field.layer.cornerCurve = .continuous
        field.addTarget(self, action: #selector(editingChanged), for: .editingChanged)
        field.addTarget(self, action: #selector(editingBegan), for: .editingDidBegin)
        field.addTarget(self, action: #selector(editingEnded), for: .editingDidEnd)
        field.addTarget(self, action: #selector(returnPressed), for: .editingDidEndOnExit)

        errorIcon.tintColor = JdToken.Color.danger.uiColor
        errorIcon.setContentHuggingPriority(.required, for: .horizontal)
        errorLabel.adjustsFontForContentSizeCategory = true
        errorLabel.textColor = JdToken.Color.danger.uiColor
        errorLabel.numberOfLines = 0
        errorStack.axis = .horizontal
        errorStack.alignment = .center
        errorStack.spacing = JdToken.Space.s1
        errorStack.addArrangedSubview(errorIcon)
        errorStack.addArrangedSubview(errorLabel)

        rootStack.axis = .vertical
        rootStack.alignment = .fill
        rootStack.spacing = JdToken.Space.s1_5
        rootStack.addArrangedSubview(labelView)
        rootStack.addArrangedSubview(field)
        rootStack.addArrangedSubview(errorStack)
        addSubview(rootStack)

        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        field.jd.layout {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        applyText()
        applyError(announce: false)
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // 네이티브 위임 표면 — 포커스 편의 (웹 focus()와 동형)
    public override func becomeFirstResponder() -> Bool {
        return field.becomeFirstResponder()
    }

    public override func resignFirstResponder() -> Bool {
        return field.resignFirstResponder()
    }

    private func resolveAndApply() {
        spec = JdTextFieldSpec.resolve(size: size)
        field.hInset = spec.hPadding
        field.jd.update {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }
        applyStyle()
    }

    private func applyText() {
        labelView.text = label
        labelView.isHidden = (label == nil || label?.isEmpty == true)
        field.accessibilityLabel = label
        field.attributedPlaceholder = NSAttributedString(
            string: placeholder ?? "",
            attributes: [.foregroundColor: JdToken.Color.mutedLight.uiColor]
        )
    }

    private func applyError(announce: Bool) {
        let hasError = (error != nil && error?.isEmpty == false)
        errorStack.isHidden = !hasError
        errorLabel.text = error
        field.accessibilityHint = hasError ? error : nil
        applyBorder()
        if announce, hasError, let message = error {
            // 웹 aria-live 등가 (04 §7.1)
            UIAccessibility.post(notification: .announcement, argument: message)
        }
    }

    private func applyStyle() {
        labelView.font = JdFontBridge.scaledFont(size: spec.labelFontSize, weight: spec.labelFontWeight)
        labelView.textColor = JdToken.Color.foreground.uiColor
        field.font = JdFontBridge.scaledFont(size: spec.fontSize, weight: JdToken.FontWeight.normal)
        field.textColor = JdToken.Color.foreground.uiColor
        field.backgroundColor = JdToken.Color.card.uiColor
        field.layer.cornerRadius = spec.radius
        field.hInset = spec.hPadding
        errorLabel.font = JdFontBridge.scaledFont(size: spec.errorFontSize, weight: JdToken.FontWeight.normal)
        applyBorder()
    }

    private func applyBorder() {
        let hasError = (error != nil && error?.isEmpty == false)
        let color: JdDynamicColor
        if hasError {
            color = JdToken.Color.danger
        } else if field.isFirstResponder {
            color = JdToken.Color.primary
        } else {
            color = JdToken.Color.border
        }
        field.layer.borderWidth = JdToken.Border.thin
        field.layer.borderColor = color.uiColor.resolvedColor(with: traitCollection).cgColor
    }

    @objc private func editingChanged() {
        onTextChange?(text)
    }

    @objc private func editingBegan() {
        applyBorder()
    }

    @objc private func editingEnded() {
        applyBorder()
        onCommit?(text)
    }

    @objc private func returnPressed() {
        _ = field.resignFirstResponder()
    }
}

private final class JdPaddedTextField: UITextField {
    var hInset: CGFloat = 14

    override func textRect(forBounds bounds: CGRect) -> CGRect {
        return bounds.insetBy(dx: hInset, dy: 0)
    }

    override func editingRect(forBounds bounds: CGRect) -> CGRect {
        return bounds.insetBy(dx: hInset, dy: 0)
    }

    override func placeholderRect(forBounds bounds: CGRect) -> CGRect {
        return bounds.insetBy(dx: hInset, dy: 0)
    }
}
