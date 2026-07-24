import UIKit
import JunDSCore

// 웹 jd-phone-input 동형 — 국가 코드 + 전화번호 (DESIGN-3 §A).
//
// 마스킹은 전부 JdPhoneMask.format이 한다 — 국가별 그룹 규칙을 렌더가 다시 알지 않는다.
// value는 웹과 같이 **숫자만** 보관하고 하이픈은 표시 전용이다.
// 국가 선택은 UIMenu 위임(시스템 관용구) — v2 수제 드롭다운의 키보드·역할 결함을 물려받지 않는다.
public final class JdPhoneInputView: UIView {

    /// 숫자만 보관한다. 대입 시에도 숫자만 남긴다(웹 value 규약 동형)
    public var value: String {
        didSet {
            // 관찰자 안의 재대입은 didSet을 다시 부르지 않는다(Swift 규칙) — 무한 재귀 없음
            let digits = value.filter(\.isNumber)
            if digits != value { value = digits }
            applyValue()
        }
    }

    public var country: JdPhoneCountry {
        didSet {
            applyCountry()
            applyValue()
        }
    }

    public var isError: Bool {
        didSet { applyBorder() }
    }

    public var isEnabled: Bool = true {
        didSet {
            field.isEnabled = isEnabled
            countryButton.isEnabled = isEnabled
            alpha = isEnabled ? 1 : spec.disabledOpacity
        }
    }

    public var onValueChange: ((String) -> Void)?
    public var onCommit: ((String) -> Void)?
    /// 국가 변경 — 웹 jd-change(detail.country) 동형
    public var onCountryChange: ((JdPhoneCountry) -> Void)?

    /// 편집 중 여부 — isFirstResponder 대신 편집 이벤트로 추적한다(창 없는 환경에서도
    /// 같은 판정이 나오고, 되쓰기 가드·포커스 테두리가 한 소스를 본다)
    private var isEditing = false

    private let countryButton = UIButton(type: .system)
    private let field = UITextField()
    private let rootStack = UIStackView()
    private let spec: JdTextFieldSpec

    public init(value: String = "",
                country: JdPhoneCountry = .kr,
                size: JdControlSize = .md,
                isError: Bool = false,
                accessibilityLabel: String? = nil) {
        self.value = value.filter(\.isNumber)
        self.country = country
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.isError = isError
        super.init(frame: .zero)

        countryButton.accessibilityLabel = "국가 선택"
        countryButton.tintColor = JdToken.Color.muted.uiColor
        countryButton.showsMenuAsPrimaryAction = true
        countryButton.setContentHuggingPriority(.required, for: .horizontal)
        countryButton.setContentCompressionResistancePriority(.required, for: .horizontal)

        field.adjustsFontForContentSizeCategory = true
        field.keyboardType = .phonePad
        field.accessibilityLabel = accessibilityLabel ?? "전화번호"
        field.addTarget(self, action: #selector(editingChanged), for: .editingChanged)
        field.addTarget(self, action: #selector(editingBegan), for: .editingDidBegin)
        field.addTarget(self, action: #selector(editingEnded), for: .editingDidEnd)
        field.addTarget(self, action: #selector(returnPressed), for: .editingDidEndOnExit)

        rootStack.axis = .horizontal
        rootStack.alignment = .center
        rootStack.spacing = JdToken.Space.s2
        rootStack.isLayoutMarginsRelativeArrangement = true
        rootStack.directionalLayoutMargins = NSDirectionalEdgeInsets(top: 0, leading: spec.hPadding,
                                                                     bottom: 0, trailing: spec.hPadding)
        rootStack.addArrangedSubview(countryButton)
        rootStack.addArrangedSubview(field)
        addSubview(rootStack)

        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        jd.layout {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        layer.cornerCurve = .continuous
        applyCountry()
        applyValue()
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

    /// 국제 표기 — 웹 fullNumber 게터 동형 (규칙은 Core)
    public var fullNumber: String {
        JdPhoneMask.fullNumber(value, country: country)
    }

    // MARK: - 구성

    /// 선택 상태를 담아 매번 다시 만든다 — 체크 표시가 곧 현재 국가다
    private func applyCountry() {
        countryButton.setTitle(country.dialCode, for: .normal)
        let actions = JdPhoneCountry.allCases.map { item in
            UIAction(title: item.dialCode,
                     state: item == country ? .on : .off) { [weak self] _ in
                guard let self, self.country != item else { return }
                self.country = item
                self.onCountryChange?(item)
            }
        }
        countryButton.menu = UIMenu(title: "국가 선택", children: actions)
    }

    /// 표시만 마스킹한다 — 저장은 숫자, 규칙은 Core
    private func applyValue() {
        let masked = JdPhoneMask.format(value, country: country)
        if field.text != masked { field.text = masked }
        // 낭독 값은 국제 표기 — 국가번호가 빠진 채 읽히지 않게 한다
        field.accessibilityValue = fullNumber
    }

    private func applyStyle() {
        field.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                             weight: JdToken.FontWeight.normal,
                                             compatibleWith: traitCollection)
        field.textColor = JdToken.Color.foreground.uiColor
        countryButton.titleLabel?.adjustsFontForContentSizeCategory = true
        countryButton.titleLabel?.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                                                 weight: JdToken.FontWeight.medium,
                                                                 compatibleWith: traitCollection)
        countryButton.setTitleColor(JdToken.Color.muted.uiColor, for: .normal)
        backgroundColor = JdToken.Color.card.uiColor
        layer.cornerRadius = spec.radius
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

    // MARK: - 입력

    @objc private func editingChanged() {
        // 사용자가 무엇을 치든 숫자만 남기고, 마스킹은 Core가 다시 만든다(didSet → applyValue)
        value = (field.text ?? "").filter(\.isNumber)
        onValueChange?(value)
    }

    @objc private func editingBegan() {
        isEditing = true
        applyBorder()
    }

    @objc private func editingEnded() {
        isEditing = false
        applyBorder()
        onCommit?(value)
    }

    @objc private func returnPressed() {
        _ = field.resignFirstResponder()
    }
}
