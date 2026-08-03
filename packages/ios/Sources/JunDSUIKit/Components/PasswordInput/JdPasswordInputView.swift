import JunDSCore
import UIKit

// 웹 jd-password-input 동형 — 표시 토글 + 강도 게이지 + 규칙 체크리스트 (DESIGN-3 §A).
//
// 강도·규칙 판정은 전부 JdPasswordStrength.evaluate다(점수·라벨·tone 포함) — 렌더는
// 결과만 그린다. 막대 색은 tone(JdSeverity)을 JdSeverityBadgeSpec에 넘겨 재사용한다
// (색 어휘를 새로 만들지 않는다 — 04 §4.2 규칙 1).
public final class JdPasswordInputView: UIView {

    public var text: String {
        get { field.text ?? "" }
        set {
            // IME 안전: 실제로 다를 때만 되쓴다 (웹 update()와 동일 계약)
            if field.text != newValue { field.text = newValue }
            applyStrength()
        }
    }

    public var placeholder: String {
        didSet { applyPlaceholder() }
    }

    public var isError: Bool {
        didSet { applyError() }
    }

    public var showsStrength: Bool {
        didSet { applyStrength() }
    }

    public var showsRules: Bool {
        didSet { applyStrength() }
    }

    public var isEnabled: Bool = true {
        didSet {
            field.isEnabled = isEnabled
            revealButton.isEnabled = isEnabled
            alpha = isEnabled ? 1 : spec.disabledOpacity
        }
    }

    public var onTextChange: ((String) -> Void)?
    public var onCommit: ((String) -> Void)?

    /// 현재 값의 강도 — 웹 strength 게터 동형(판정은 Core, 여기선 파생만)
    public var strength: JdPasswordStrength {
        JdPasswordStrength.evaluate(text)
    }

    /// 편집 중 여부 — isFirstResponder 대신 편집 이벤트로 추적한다(창 없는 환경에서도
    /// 같은 판정이 나오고, 되쓰기 가드·포커스 테두리가 한 소스를 본다)
    private var isEditing = false

    private let field = UITextField()
    private let revealButton = UIButton(type: .system)
    /// 필드 + 토글을 담는 상자 — 배경·테두리는 이 행이 그린다(웹 relative 래퍼 동형)
    private let fieldRow = UIStackView()
    private let strengthStack = UIStackView()
    private let strengthLabel = UILabel()
    private var bars: [UIView] = []
    private let rulesStack = UIStackView()
    private var ruleRows:
        [(row: UIStackView, icon: UIImageView, label: UILabel, rule: JdPasswordRule)] = []
    private let rootStack = UIStackView()
    private let spec: JdTextFieldSpec

    public init(
        text: String = "",
        placeholder: String = "",
        size: JdControlSize = .md,
        isError: Bool = false,
        showsStrength: Bool = false,
        showsRules: Bool = false,
        accessibilityLabel: String? = nil
    ) {
        self.placeholder = placeholder
        self.spec = JdTextFieldSpec.resolve(size: size)
        self.isError = isError
        self.showsStrength = showsStrength
        self.showsRules = showsRules
        super.init(frame: .zero)

        field.adjustsFontForContentSizeCategory = true
        field.isSecureTextEntry = true
        field.textContentType = .password
        field.autocapitalizationType = .none
        field.autocorrectionType = .no
        field.text = text
        field.accessibilityLabel = accessibilityLabel ?? placeholder
        field.addTarget(self, action: #selector(editingChanged), for: .editingChanged)
        field.addTarget(self, action: #selector(editingBegan), for: .editingDidBegin)
        field.addTarget(self, action: #selector(editingEnded), for: .editingDidEnd)
        field.addTarget(self, action: #selector(returnPressed), for: .editingDidEndOnExit)

        revealButton.tintColor = JdToken.Color.muted.uiColor
        revealButton.setContentHuggingPriority(.required, for: .horizontal)
        revealButton.addTarget(self, action: #selector(didTapReveal), for: .touchUpInside)

        fieldRow.axis = .horizontal
        fieldRow.alignment = .center
        fieldRow.spacing = JdToken.Space.s2
        fieldRow.isLayoutMarginsRelativeArrangement = true
        fieldRow.directionalLayoutMargins = NSDirectionalEdgeInsets(
            top: 0, leading: spec.hPadding,
            bottom: 0, trailing: spec.hPadding)
        fieldRow.addArrangedSubview(field)
        fieldRow.addArrangedSubview(revealButton)

        buildStrengthRow()
        buildRulesList()

        rootStack.axis = .vertical
        rootStack.alignment = .fill
        rootStack.spacing = JdToken.Space.s2
        rootStack.addArrangedSubview(fieldRow)
        rootStack.addArrangedSubview(strengthStack)
        rootStack.addArrangedSubview(rulesStack)
        addSubview(rootStack)

        rootStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        fieldRow.jd.layout {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        fieldRow.layer.cornerCurve = .continuous
        applyPlaceholder()
        applyStyle()
        applyStrength()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트·심볼은 수동 재적용
        applyStyle()
        applyStrength()
    }

    public override func becomeFirstResponder() -> Bool {
        return field.becomeFirstResponder()
    }

    public override func resignFirstResponder() -> Bool {
        return field.resignFirstResponder()
    }

    // MARK: - 구성

    private func buildStrengthRow() {
        strengthStack.axis = .horizontal
        strengthStack.alignment = .center
        strengthStack.spacing = JdToken.Space.s1
        // 막대는 장식이고 문구가 상태를 말한다 — 요소 하나로 합친다 (04 §7.1)
        strengthStack.isAccessibilityElement = true
        strengthStack.accessibilityLabel = "비밀번호 강도"

        // 막대 수 = 규칙 수(점수 상한) — 숫자를 따로 정하지 않는다
        for _ in JdPasswordRule.allCases {
            let bar = UIView()
            bar.layer.cornerCurve = .continuous
            bar.jd.layout {
                $0.height.equal(JdToken.Space.s1)  // 웹 height: var(--jd-space-1)
            }
            bars.append(bar)
            // ⚠️ 등폭 제약은 **스택에 넣은 뒤에** 건다 — 넣기 전이면 두 막대에 공통 조상이 없어
            //    "Unable to activate constraint … no common ancestor"로 즉시 예외가 난다(실측).
            strengthStack.addArrangedSubview(bar)
            // 웹 flex:1 동형 — 남는 폭을 막대끼리 균등 분배한다
            if let first = bars.first, first !== bar {
                bar.jd.layout {
                    $0.width.equal(to: first.jd.width)
                }
            }
        }
        strengthLabel.adjustsFontForContentSizeCategory = true
        strengthLabel.setContentHuggingPriority(.required, for: .horizontal)
        strengthStack.addArrangedSubview(strengthLabel)
    }

    private func buildRulesList() {
        rulesStack.axis = .vertical
        rulesStack.alignment = .fill
        rulesStack.spacing = JdToken.Space.s1

        for rule in JdPasswordRule.allCases {
            let icon = UIImageView()
            icon.setContentHuggingPriority(.required, for: .horizontal)
            let label = UILabel()
            label.adjustsFontForContentSizeCategory = true
            label.numberOfLines = 0
            label.text = rule.label

            let row = UIStackView(arrangedSubviews: [icon, label])
            row.axis = .horizontal
            row.alignment = .center
            row.spacing = JdToken.Space.s1_5
            row.isAccessibilityElement = true
            row.accessibilityLabel = rule.label
            rulesStack.addArrangedSubview(row)
            ruleRows.append((row: row, icon: icon, label: label, rule: rule))
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
            size: spec.fontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        field.textColor = JdToken.Color.foreground.uiColor
        fieldRow.backgroundColor = JdToken.Color.card.uiColor
        fieldRow.layer.cornerRadius = spec.radius
        applyRevealIcon()

        let captionFont = JdFontBridge.scaledFont(
            size: JdToken.FontSize.xs,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        strengthLabel.font = captionFont
        let ruleFont = JdFontBridge.scaledFont(
            size: JdToken.FontSize.xs,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        let ruleSymbol = UIImage.SymbolConfiguration(font: ruleFont)
        for row in ruleRows {
            row.label.font = ruleFont
            row.icon.preferredSymbolConfiguration = ruleSymbol
        }
        applyError()
    }

    private func applyRevealIcon() {
        let symbolFont = JdFontBridge.scaledFont(
            size: spec.fontSize,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        let name = field.isSecureTextEntry ? "eye" : "eye.slash"
        revealButton.setImage(
            UIImage(
                systemName: name,
                withConfiguration: UIImage.SymbolConfiguration(font: symbolFont)),
            for: .normal)
        revealButton.accessibilityLabel = field.isSecureTextEntry ? "비밀번호 표시" : "비밀번호 숨기기"
        revealButton.sizeToFit()
    }

    private func applyError() {
        let color: JdDynamicColor
        if isError {
            color = JdToken.Color.danger
        } else if isEditing {
            color = JdToken.Color.primary
        } else {
            color = JdToken.Color.border
        }
        fieldRow.layer.borderWidth = JdToken.Border.thin
        fieldRow.layer.borderColor = color.uiColor.resolvedColor(with: traitCollection).cgColor
        // 웹은 aria-invalid를 달지 않아 AT가 오류를 알 수 없다 — iOS는 값으로 보정한다
        field.accessibilityValue = isError ? "오류" : nil
    }

    /// 게이지·체크리스트 갱신 — 점수·라벨·색 판정은 전부 Core다
    private func applyStrength() {
        let current = strength
        // 빈 값에는 강도를 매기지 않는다(웹 level "none" 동형) — Core 점수는 0이지만
        // 라벨은 "약함"이라 빈 필드에 경고를 띄우게 되므로 행 자체를 감춘다
        strengthStack.isHidden = !showsStrength || text.isEmpty
        rulesStack.isHidden = !showsRules

        let tone = JdSeverityBadgeSpec.resolve(severity: current.tone, size: .md)
        for (index, bar) in bars.enumerated() {
            // 막대는 그래픽이라 도트 색(원색), 글자는 텍스트 대비용 전경색을 쓴다
            bar.backgroundColor =
                index < current.score
                ? tone.dotColor.uiColor
                : JdToken.Color.border.uiColor
            bar.layer.cornerRadius = JdToken.Space.s1 / 2  // 알약(웹 radius-full)
        }
        strengthLabel.text = current.label
        strengthLabel.textColor = tone.foreground.uiColor
        strengthStack.accessibilityValue = current.label

        for row in ruleRows {
            let passed = current.isSatisfied(row.rule)
            row.icon.image = UIImage(systemName: passed ? "checkmark.circle.fill" : "circle")
            row.icon.tintColor =
                passed
                ? JdToken.Color.success.uiColor
                : JdToken.Color.mutedLight.uiColor
            row.label.textColor =
                passed
                ? JdToken.Color.success.uiColor
                : JdToken.Color.muted.uiColor
            row.row.accessibilityValue = passed ? "충족" : "미충족"
        }
    }

    // MARK: - 입력

    @objc private func editingChanged() {
        applyStrength()
        onTextChange?(text)
    }

    @objc private func editingBegan() {
        isEditing = true
        applyError()
    }

    @objc private func editingEnded() {
        isEditing = false
        applyError()
        onCommit?(text)
    }

    @objc private func returnPressed() {
        _ = field.resignFirstResponder()
    }

    /// 표시/숨김 — 웹 type 전환 동형. 되쓰기로 캐럿이 튀지 않게 텍스트를 복원한다
    @objc private func didTapReveal() {
        let cached = field.text
        field.isSecureTextEntry.toggle()
        field.text = cached
        applyRevealIcon()
    }
}
