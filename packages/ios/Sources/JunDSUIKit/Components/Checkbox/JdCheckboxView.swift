import UIKit
import JunDSCore

// 웹 jd-checkbox 동형 — iOS 관용구 부재로 SF Symbols 자체 드로잉 (04 §10.1 primitives).
// UIControl 서브클래스라 isSelected가 이미 점유돼 있어 상태 프로퍼티는 isSelectedState다
// (JdTextView의 textSize와 같은 충돌 회피 규칙, DESIGN §2.3 계보).
public final class JdCheckboxView: UIControl {

    public var label: String? {
        didSet { applyLabel() }
    }

    // 프로그램 변경은 onChange를 발화시키지 않는다 — 웹 jd-change는 사용자 조작 전용
    public var isSelectedState: JdCheckboxState {
        didSet { applyState() }
    }

    public var size: JdToggleSize {
        didSet { resolveAndApply() }
    }

    // true면 3상태 순환(off → on → indeterminate → off), false면 2상태
    public var indeterminateAllowed: Bool

    public var onChange: ((JdCheckboxState) -> Void)?

    private let boxView = UIImageView()
    private let labelView = UILabel()
    private let contentStack = UIStackView()
    private var spec: JdChoiceSpec

    public init(label: String? = nil,
                state: JdCheckboxState = .off,
                size: JdToggleSize = .md,
                indeterminateAllowed: Bool = false) {
        self.label = label
        self.isSelectedState = state
        self.size = size
        self.indeterminateAllowed = indeterminateAllowed
        self.spec = JdChoiceSpec.resolve(size: size)
        super.init(frame: .zero)

        boxView.setContentHuggingPriority(.required, for: .horizontal)
        boxView.setContentCompressionResistancePriority(.required, for: .horizontal)

        labelView.adjustsFontForContentSizeCategory = true
        labelView.numberOfLines = 0

        // 웹 gap 8(--jd-space-2) = JdChoiceSpec.gap. 터치는 컨트롤이 전부 받는다
        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = spec.gap
        contentStack.isUserInteractionEnabled = false
        contentStack.addArrangedSubview(boxView)
        contentStack.addArrangedSubview(labelView)
        addSubview(contentStack)

        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        // 카드 아닌 단일 컨트롤 — 요소 1개로 노출 (04 §7.1)
        isAccessibilityElement = true

        addTarget(self, action: #selector(didTap), for: .touchUpInside)

        applyLabel()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var isEnabled: Bool {
        didSet { alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50) }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 심볼 설정과 스케일 폰트는 수동 재적용
        applyStyle()
    }

    private func resolveAndApply() {
        spec = JdChoiceSpec.resolve(size: size)
        contentStack.spacing = spec.gap
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func applyLabel() {
        let text = label ?? ""
        labelView.text = text
        labelView.isHidden = text.isEmpty
        accessibilityLabel = text.isEmpty ? nil : text
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        labelView.font = JdFontBridge.scaledFont(size: spec.labelFontSize,
                                                 weight: JdToken.FontWeight.normal,
                                                 compatibleWith: traitCollection)
        labelView.textColor = JdToken.Color.foreground.uiColor
        applyState()
    }

    private func applyState() {
        // 심볼 크기 = 스펙 boxSize. 폰트 설정 경유라 Dynamic Type에 함께 자란다 (04 §7.2)
        let symbolFont = JdFontBridge.scaledFont(size: spec.boxSize,
                                                 weight: JdToken.FontWeight.normal,
                                                 compatibleWith: traitCollection)
        boxView.image = UIImage(systemName: JdCheckboxView.symbolName(isSelectedState),
                                withConfiguration: UIImage.SymbolConfiguration(font: symbolFont))
        boxView.tintColor = JdCheckboxView.symbolColor(isSelectedState).uiColor
        // 상태는 문자열 조합이 아니라 트레이트 + 값으로 (04 §7.1)
        if isSelectedState == .on {
            accessibilityTraits.insert(.selected)
        } else {
            accessibilityTraits.remove(.selected)
        }
        accessibilityValue = JdCheckboxView.accessibilityValue(isSelectedState)
    }

    @objc private func didTap() {
        isSelectedState = JdCheckboxView.next(isSelectedState, indeterminateAllowed: indeterminateAllowed)
        onChange?(isSelectedState)
    }

    // MARK: - 상태 규칙
    //
    // 웹 #onChange 동형: 사용자 조작은 mixed를 해제한다(네이티브 input 동작과 정합).
    // ⚠️ JdCheckbox(SwiftUI)와 문자 단위로 같은 규칙이며 DEC-010으로 공유가 불가해 각 계층에
    //    복제돼 있다. JdCheckboxState의 Core 멤버로 승격할 후보 — DECISIONS 기록감.
    private static func next(_ state: JdCheckboxState, indeterminateAllowed: Bool) -> JdCheckboxState {
        switch state {
        case .off:
            return .on
        case .on:
            return indeterminateAllowed ? .indeterminate : .off
        case .indeterminate:
            return indeterminateAllowed ? .off : .on
        }
    }

    // DESIGN-2 §B1 지정 심볼
    private static func symbolName(_ state: JdCheckboxState) -> String {
        switch state {
        case .on: return "checkmark.square.fill"
        case .indeterminate: return "minus.square.fill"
        case .off: return "square"
        }
    }

    // 웹 accent-color: primary / 미선택 테두리: border
    private static func symbolColor(_ state: JdCheckboxState) -> JdDynamicColor {
        switch state {
        case .on, .indeterminate: return JdToken.Color.primary
        case .off: return JdToken.Color.border
        }
    }

    private static func accessibilityValue(_ state: JdCheckboxState) -> String {
        switch state {
        case .on: return "선택됨"
        case .off: return "선택 안 됨"
        case .indeterminate: return "부분 선택"
        }
    }
}
