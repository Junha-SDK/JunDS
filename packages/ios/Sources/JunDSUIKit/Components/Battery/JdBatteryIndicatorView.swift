import JunDSCore
import UIKit

// 웹 jd-battery-indicator 동형 — 배터리형 레벨 표시. A8 명명 규칙 Jd<이름>View.
// 웹은 div 3개(body/fill/cap)뿐이라 role·aria가 전무하다 — 값이 **폭으로만** 전달된다.
// iOS는 요소 1개로 합치고 accessibilityValue로 퍼센트를 노출해 보정한다 (04 §7.1).
// 채움 전환은 JdMotion.duration 경유 — Reduce Motion 시 즉시 반영 (04 §7.3).
public final class JdBatteryIndicatorView: UIView {

    // 클램프는 Core가 한다 — 표면은 원값을 보관하고 그리기만 클램프값을 쓴다 (04 §4.2 규칙 3)
    public var value: Double {
        didSet { applyValue(animated: true) }
    }

    public var size: JdDisplaySize {
        didSet { resolveAndApply() }
    }

    public var label: String? {
        didSet { applyLabel() }
    }

    public var autoColor: Bool {
        didSet { applyFillColor() }
    }

    public var color: JdBatteryColor {
        didSet { applyFillColor() }
    }

    // 웹은 label이 없어도 요소가 존재한다 — AT에 이름이 필요해 iOS가 신설한 기본 이름
    static let defaultAccessibilityLabel = "배터리"

    private let textLabel = UILabel()
    private let bodyView = UIView()
    private let fillView = UIView()
    private let percentLabel = UILabel()
    private let capView = UIView()
    private let contentStack: JdStackView
    private var spec: JdBatterySpec

    public init(
        value: Double,
        size: JdDisplaySize = .md,
        label: String? = nil,
        autoColor: Bool = false,
        color: JdBatteryColor = .primary
    ) {
        self.value = value
        self.size = size
        self.label = label
        self.autoColor = autoColor
        self.color = color
        self.spec = JdBatterySpec.resolve(size: size)
        // 웹 gap: var(--jd-space-1-5) — 스펙에 gap 필드가 없어 같은 값의 토큰을 직접 읽는다
        self.contentStack = JdStackView(
            axis: .horizontal,
            gap: .custom(JdToken.Space.s1_5),
            alignment: .center)
        super.init(frame: .zero)

        textLabel.adjustsFontForContentSizeCategory = true
        textLabel.numberOfLines = 1

        percentLabel.adjustsFontForContentSizeCategory = true
        percentLabel.textAlignment = .center

        bodyView.clipsToBounds = true  // 웹 overflow: hidden
        bodyView.addSubview(fillView)
        bodyView.addSubview(percentLabel)

        contentStack.addArrangedSubview(textLabel)
        contentStack.addArrangedSubview(bodyView)
        contentStack.addArrangedSubview(capView)
        addSubview(contentStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        bodyView.jd.layout {
            $0.size.equal(CGSize(width: spec.bodyWidth, height: spec.bodyHeight))
        }
        capView.jd.layout {
            $0.size.equal(CGSize(width: spec.capWidth, height: spec.capHeight))
        }
        // 채움은 테두리 안쪽(padding-box)에서 시작한다 — 웹 inset-block: 0; left: 0 동형
        fillView.jd.layout {
            $0.leading.equalToSuperview().inset(spec.borderWidth)
            $0.top.bottom.equalToSuperview().inset(spec.borderWidth)
            $0.width.equal(fillWidth)
        }
        percentLabel.jd.layout {
            $0.center.equalToSuperview()
        }

        // 배터리 1개 = 요소 1개 — 자식 UILabel은 컨테이너 승격으로 트리에서 빠진다
        isAccessibilityElement = true

        applyStyle()
        applyLabel()
        applyFillColor()
        applyValue(animated: false)
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        applyCapCorners()
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyStyle()
        applyCapCorners()
        invalidateIntrinsicContentSize()
    }

    // 테스트 표면 — 채움 비율(0…1) (04 §8.2)
    var fillFraction: Double { JdBatterySpec.clamp(value) / 100 }

    // MARK: 내부

    private var innerWidth: CGFloat { max(spec.bodyWidth - spec.borderWidth * 2, 0) }
    private var fillWidth: CGFloat { innerWidth * CGFloat(fillFraction) }

    private func resolveAndApply() {
        spec = JdBatterySpec.resolve(size: size)
        bodyView.jd.update {
            $0.size.equal(CGSize(width: spec.bodyWidth, height: spec.bodyHeight))
        }
        capView.jd.update {
            $0.size.equal(CGSize(width: spec.capWidth, height: spec.capHeight))
        }
        applyStyle()
        applyValue(animated: false)
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        textLabel.font = JdFontBridge.scaledFont(
            size: spec.labelFontSize,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        // 웹 라벨색 #4b5563/#9ca3af는 스펙 부재분 — 시맨틱 등가인 muted로 번역
        textLabel.textColor = JdToken.Color.muted.uiColor

        bodyView.layer.cornerRadius = spec.radius
        bodyView.layer.cornerCurve = .continuous
        bodyView.layer.borderWidth = spec.borderWidth
        bodyView.layer.borderColor =
            JdBatterySpec.outlineColor.uiColor
            .resolvedColor(with: traitCollection).cgColor
        capView.backgroundColor = JdBatterySpec.outlineColor.uiColor

        // 웹은 lg에서만 % 텍스트를 노출한다 — 임의 채움색 위 판독성은 흰 글자+다크 헤일로 (DEC-027-7).
        // 스펙에 % 전경색·헤일로 필드가 없다 — 시스템 흰색 + 검정 헤일로(notes 보고분).
        percentLabel.isHidden = !spec.showsPercentText
        percentLabel.font = JdFontBridge.scaledFont(
            size: spec.percentFontSize,
            weight: JdToken.FontWeight.bold,
            compatibleWith: traitCollection)
        percentLabel.textColor = .white
        percentLabel.layer.shadowColor = UIColor.black.cgColor
        percentLabel.layer.shadowOpacity = Float(JdToken.Opacity.o95)
        percentLabel.layer.shadowOffset = .zero
        // blur 2는 웹 text-shadow 2px에 대응하는 토큰 값을 빌려 쓴다
        percentLabel.layer.shadowRadius = JdToken.Space.s0_5
        percentLabel.layer.masksToBounds = false
    }

    private func applyLabel() {
        let text = label ?? ""
        textLabel.text = text
        textLabel.isHidden = text.isEmpty
        accessibilityLabel =
            text.isEmpty
            ? JdBatteryIndicatorView.defaultAccessibilityLabel
            : text
        invalidateIntrinsicContentSize()
    }

    // 자동 색 판정도 Core의 순수 함수 — 렌더는 결과 색만 받는다 (04 §4.2 규칙 3)
    private func applyFillColor() {
        let resolved = autoColor ? JdBatterySpec.autoColor(for: value) : color
        fillView.backgroundColor = JdBatterySpec.fillColor(resolved).uiColor
    }

    private func applyValue(animated: Bool) {
        let clamped = JdBatterySpec.clamp(value)
        percentLabel.text = "\(Int(clamped.rounded()))%"
        // 폭으로만 전달되던 값을 퍼센트로 노출한다(웹 결함 보정).
        // VoiceOver는 "%"를 기호로 읽어 넘기는 경우가 있어 단어로 발음시킨다.
        accessibilityValue = "\(Int(clamped.rounded())) 퍼센트"
        applyFillColor()  // autoColor면 값에 따라 색도 함께 바뀐다

        fillView.jd.update {
            $0.width.equal(fillWidth)
        }

        // 웹 transition: all var(--jd-duration-slower) var(--jd-easing-ease-out)
        let duration = JdMotion.duration(JdToken.Duration.slower)
        guard animated, duration > 0, !UIAccessibility.isReduceMotionEnabled else { return }
        let easing = JdToken.Easing.easeOut
        let animator = UIViewPropertyAnimator(
            duration: duration,
            controlPoint1: CGPoint(x: easing.0, y: easing.1),
            controlPoint2: CGPoint(x: easing.2, y: easing.3)
        ) { [weak self] in
            self?.layoutIfNeeded()
        }
        animator.startAnimation()
    }

    // 캡은 바깥쪽 두 모서리만 둥글다 (웹 border-start-end-radius / border-end-end-radius).
    // maskedCorners는 절대 좌표라 RTL에서 직접 뒤집는다.
    private func applyCapCorners() {
        capView.layer.cornerRadius = spec.radius
        capView.layer.cornerCurve = .continuous
        capView.layer.maskedCorners =
            effectiveUserInterfaceLayoutDirection == .rightToLeft
            ? [.layerMinXMinYCorner, .layerMinXMaxYCorner]
            : [.layerMaxXMinYCorner, .layerMaxXMaxYCorner]
    }
}
