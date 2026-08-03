import JunDSCore
import UIKit

// 웹 jd-radio-group 동형 — 옵션 배열 + 단일 선택. iOS 관용구 부재로 SF Symbols 자체 드로잉
// (04 §10.1 primitives). 행 하나가 접근성 요소 하나이고 그룹 라벨은 소비자 몫이다 (04 §7.1).
//
// ⚠️ 웹의 flex-wrap: wrap은 UIStackView 한계로 가로 축에서 재현되지 않는다
//    (JdStackView의 no-wrap 폴백과 같은 계보 — SwiftUI 쪽은 JdFlowLayout이 담당).
public final class JdRadioGroupView: UIView {

    // 옵션 교체 시 행을 재구축한다 (웹 #rebuild 동형)
    public var options: [JdRadioOption] {
        didSet { rebuildRows() }
    }

    // 프로그램 변경은 onChange를 발화시키지 않는다 — 웹 jd-change는 사용자 조작 전용
    public var selectedValue: String? {
        didSet { applyState() }
    }

    public var axis: JdAxis {
        didSet { applyAxis() }
    }

    public var size: JdToggleSize {
        didSet { resolveAndApply() }
    }

    // 웹 그룹 disabled attribute 동형 — 전 행 비활성
    public var isEnabled: Bool = true {
        didSet { applyState() }
    }

    public var onChange: ((String) -> Void)?

    private let contentStack = UIStackView()
    private var rows: [JdRadioRowView] = []
    private var spec: JdChoiceSpec

    public init(
        options: [JdRadioOption] = [],
        selectedValue: String? = nil,
        axis: JdAxis = .vertical,
        size: JdToggleSize = .md
    ) {
        self.options = options
        self.selectedValue = selectedValue
        self.axis = axis
        self.size = size
        self.spec = JdChoiceSpec.resolve(size: size)
        super.init(frame: .zero)

        // 웹: gap 8(--jd-space-2) = JdChoiceSpec.gap, 세로가 기본
        contentStack.spacing = spec.gap
        contentStack.alignment = .leading
        addSubview(contentStack)

        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        applyAxis()
        rebuildRows()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 심볼 설정과 스케일 폰트는 수동 재적용
        for row in rows {
            row.applyStyle()
        }
    }

    private func applyAxis() {
        switch axis {
        case .vertical:
            contentStack.axis = .vertical
            contentStack.alignment = .leading
        case .horizontal:
            contentStack.axis = .horizontal
            contentStack.alignment = .center
        }
    }

    private func resolveAndApply() {
        spec = JdChoiceSpec.resolve(size: size)
        contentStack.spacing = spec.gap
        for row in rows {
            row.spec = spec
        }
    }

    private func rebuildRows() {
        for row in rows {
            contentStack.removeArrangedSubview(row)
            row.removeFromSuperview()
        }
        rows = options.map { option in
            let row = JdRadioRowView(option: option, spec: spec)
            row.addTarget(self, action: #selector(rowTapped(_:)), for: .touchUpInside)
            contentStack.addArrangedSubview(row)
            return row
        }
        applyState()
    }

    private func applyState() {
        for row in rows {
            row.isChosen = (row.option.value == selectedValue)
            row.isEnabled = isEnabled && !row.option.isDisabled
        }
    }

    @objc private func rowTapped(_ sender: JdRadioRowView) {
        // 비활성 행은 UIControl이 터치를 받지 않지만 계약을 코드로도 못박는다 (웹 update() 동형)
        guard sender.isEnabled else { return }
        let value = sender.option.value
        guard value != selectedValue else { return }
        selectedValue = value
        onChange?(value)
    }
}

// MARK: - 행 1개 (그룹 내부 전용)

// 웹 label.jd-radio-group__item 동형 — 심볼 + 텍스트가 함께 한 개의 탭 타깃/접근성 요소.
// 그룹의 구현 세부라 파일 밖으로 새지 않는다(모듈 심벌 오염 방지).
private final class JdRadioRowView: UIControl {

    let option: JdRadioOption

    var spec: JdChoiceSpec {
        didSet {
            contentStack.spacing = spec.gap
            applyStyle()
        }
    }

    var isChosen: Bool = false {
        didSet { applyStyle() }
    }

    private let markView = UIImageView()
    private let labelView = UILabel()
    private let contentStack = UIStackView()

    init(option: JdRadioOption, spec: JdChoiceSpec) {
        self.option = option
        self.spec = spec
        super.init(frame: .zero)

        markView.setContentHuggingPriority(.required, for: .horizontal)
        markView.setContentCompressionResistancePriority(.required, for: .horizontal)

        labelView.adjustsFontForContentSizeCategory = true
        labelView.numberOfLines = 0
        labelView.text = option.label

        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = spec.gap
        contentStack.isUserInteractionEnabled = false
        contentStack.addArrangedSubview(markView)
        contentStack.addArrangedSubview(labelView)
        addSubview(contentStack)

        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        isAccessibilityElement = true
        accessibilityLabel = option.label

        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    func applyStyle() {
        // 심볼 크기 = 스펙 boxSize. 폰트 설정 경유라 Dynamic Type에 함께 자란다 (04 §7.2)
        let symbolFont = JdFontBridge.scaledFont(
            size: spec.boxSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        // DESIGN-2 §B1 지정 심볼 — 선택 largecircle.fill.circle / 미선택 circle
        markView.image = UIImage(
            systemName: isChosen ? "largecircle.fill.circle" : "circle",
            withConfiguration: UIImage.SymbolConfiguration(font: symbolFont))
        markView.tintColor = (isChosen ? JdToken.Color.primary : JdToken.Color.border).uiColor

        labelView.font = JdFontBridge.scaledFont(
            size: spec.labelFontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        labelView.textColor = JdToken.Color.foreground.uiColor

        // 웹 행 disabled: opacity 50%
        alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50)

        // 상태는 문자열 조합이 아니라 트레이트로 (04 §7.1)
        var traits: UIAccessibilityTraits = .button
        if isChosen { traits.insert(.selected) }
        if !isEnabled { traits.insert(.notEnabled) }
        accessibilityTraits = traits
    }
}
