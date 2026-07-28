import JunDSCore
import UIKit

// 웹 jd-toggle · jd-switch 동형 — UISwitch + 라벨(gap 8, 웹 --jd-space-2) (DESIGN-2 §B1).
// 04 §10.1 "시스템 컨트롤 스킨 우선": JdToggleSpec의 트랙/썸 기하는 참고치일 뿐이고
// UIKit엔 SwiftUI의 ControlSize 같은 크기 축 API가 없다 → size는 라벨 폰트에만 반영된다
// (스위치 자체 치수는 플랫폼 고정. 스펙 값으로 transform 스케일하는 것은 픽셀 재현이라 금지).
public final class JdToggleView: UIView {

    // 웹 label attribute 동형 — 빈 값이면 텍스트 슬롯을 감춘다
    public var label: String? {
        didSet { applyLabel() }
    }

    // 프로그램 변경은 UIControl 액션을 발화시키지 않는다 → onChange 미발화 (웹 jd-change 계약)
    public var isOn: Bool {
        get { switchControl.isOn }
        set {
            guard switchControl.isOn != newValue else { return }
            switchControl.setOn(newValue, animated: isAnimated)
            applyAccessibility()
        }
    }

    public var size: JdToggleSize {
        didSet { resolveAndApply() }
    }

    // 웹 disabled attribute 동형 — 입력 차단 + 50% 불투명도
    public var isEnabled: Bool = true {
        didSet { applyEnabled() }
    }

    // 웹 jd-change 등가 — **사용자 조작 시에만** 발화한다
    public var onChange: ((Bool) -> Void)?

    private let switchControl = UISwitch()
    private let labelView = UILabel()
    private let contentStack = UIStackView()
    private var spec: JdToggleSpec

    public init(
        label: String? = nil,
        isOn: Bool = false,
        size: JdToggleSize = .md
    ) {
        self.label = label
        self.size = size
        self.spec = JdToggleSpec.resolve(size: size)
        super.init(frame: .zero)

        switchControl.onTintColor = JdToken.Color.primary.uiColor
        switchControl.setOn(isOn, animated: false)
        switchControl.setContentHuggingPriority(.required, for: .horizontal)
        switchControl.addTarget(self, action: #selector(switchValueChanged), for: .valueChanged)

        labelView.adjustsFontForContentSizeCategory = true
        labelView.numberOfLines = 0
        // 웹은 <label> 래핑이라 텍스트 클릭 토글이 공짜 — iOS는 탭 제스처로 같은 계약을 만든다
        labelView.isUserInteractionEnabled = true
        labelView.addGestureRecognizer(
            UITapGestureRecognizer(target: self, action: #selector(labelTapped)))

        // 웹 DOM 순서와 동일: 트랙 → 텍스트
        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = JdToken.Space.s2
        contentStack.addArrangedSubview(switchControl)
        contentStack.addArrangedSubview(labelView)
        addSubview(contentStack)

        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        // 라벨은 스위치의 accessibilityLabel로 합류 — 요소 2개로 쪼개지 않는다 (04 §7.1)
        labelView.isAccessibilityElement = false

        applyLabel()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
    }

    // Reduce Motion이면 duration 0 → 즉시 전환 (04 §7.3, JdMotion 경유)
    private var isAnimated: Bool {
        JdMotion.duration(JdToken.Duration.fast) > 0
    }

    private func resolveAndApply() {
        spec = JdToggleSpec.resolve(size: size)
        applyStyle()
    }

    private func applyLabel() {
        let text = label ?? ""
        labelView.text = text
        labelView.isHidden = text.isEmpty
        switchControl.accessibilityLabel = text.isEmpty ? nil : text
        applyAccessibility()
    }

    // 켬/끔은 UISwitch가 스스로 accessibilityValue로 노출한다 — 문자열 조합 금지 (04 §7.1).
    // 여기서는 라벨 동기화만 책임진다.
    private func applyAccessibility() {
        switchControl.accessibilityLabel = (label?.isEmpty == false) ? label : nil
    }

    private func applyStyle() {
        labelView.font = JdFontBridge.scaledFont(
            size: spec.labelFontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        labelView.textColor = JdToken.Color.foreground.uiColor
        switchControl.onTintColor = JdToken.Color.primary.uiColor
        applyEnabled()
    }

    private func applyEnabled() {
        switchControl.isEnabled = isEnabled
        labelView.isUserInteractionEnabled = isEnabled
        alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50)
    }

    @objc private func switchValueChanged() {
        onChange?(switchControl.isOn)
    }

    @objc private func labelTapped() {
        guard isEnabled else { return }
        // 라벨 탭도 사용자 조작이다 — 상태 반영 후 onChange 발화
        switchControl.setOn(!switchControl.isOn, animated: isAnimated)
        onChange?(switchControl.isOn)
    }
}

/// 웹 `<jd-switch>` 동형 — UIKit도 같은 시스템 컨트롤이라 별칭 한 줄 (R12).
public typealias JdSwitchView = JdToggleView
