import JunDSCore
import UIKit

// 웹 jd-status-dot 동형 — 상태 점 + 선택 라벨. A8 명명 규칙 Jd<이름>View.
// 웹은 점을 ::before로 그리고 라벨만 span이라 role·aria가 전무하다 — **라벨이 없으면 AT에
// 아무것도 노출되지 않는다**. iOS는 상태명을 라벨로 노출해 이 결함을 보정한다 (04 §7.1).
public final class JdStatusDotView: UIView {

    public var status: JdStatusKind {
        didSet { resolveAndApply() }
    }

    // nil/빈 문자열이면 점만 — 접근성 라벨은 상태명으로 대체된다
    public var label: String? {
        didSet { applyLabel() }
    }

    public var size: JdDisplaySize {
        didSet { resolveAndApply() }
    }

    // 웹 keyframe `jd-status-pulse 2s` 한 주기. Duration 토큰 램프(최대 slower 0.5) 밖이라
    // 스펙 부재분이다 — notes 보고분.
    static let pulsePeriod: TimeInterval = 2

    private static let pulseKey = "jd.statusDot.pulse"

    private let dot = UIView()
    private let textLabel = UILabel()
    private let contentStack: JdStackView
    private var spec: JdStatusDotSpec

    public init(
        _ status: JdStatusKind = .neutral,
        label: String? = nil,
        size: JdDisplaySize = .md
    ) {
        self.status = status
        self.label = label
        self.size = size
        self.spec = JdStatusDotSpec.resolve(status: status, size: size)
        // 웹 gap: var(--jd-space-1-5) — named JdGap에 없는 값이라 custom + 스펙 참조
        self.contentStack = JdStackView(
            axis: .horizontal,
            gap: .custom(spec.gap),
            alignment: .center)
        super.init(frame: .zero)

        dot.isUserInteractionEnabled = false
        textLabel.adjustsFontForContentSizeCategory = true
        textLabel.numberOfLines = 1  // 웹 인라인 라벨 동형

        contentStack.addArrangedSubview(dot)
        contentStack.addArrangedSubview(textLabel)
        addSubview(contentStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.edges.equalToSuperview()
        }
        dot.jd.layout {
            $0.size.equal(CGSize(width: spec.dotSize, height: spec.dotSize))
        }

        // 점+라벨을 요소 1개로 합친다 — 자식 UILabel은 컨테이너 승격으로 트리에서 빠진다
        isAccessibilityElement = true

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(reduceMotionDidChange),
            name: UIAccessibility.reduceMotionStatusDidChangeNotification,
            object: nil
        )

        applyStyle()
        applyLabel()
        applyPulse()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 레이어 애니메이션은 창에서 떨어질 때 제거되므로 재부착 시 다시 태운다
    public override func didMoveToWindow() {
        super.didMoveToWindow()
        applyPulse()
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
    }

    // MARK: 내부

    private func resolveAndApply() {
        spec = JdStatusDotSpec.resolve(status: status, size: size)
        contentStack.gap = .custom(spec.gap)
        dot.jd.update {
            $0.size.equal(CGSize(width: spec.dotSize, height: spec.dotSize))
        }
        applyStyle()
        applyLabel()
        applyPulse()
    }

    private func applyStyle() {
        dot.backgroundColor = spec.color.uiColor
        dot.layer.cornerRadius = spec.dotSize / 2
        dot.layer.cornerCurve = .continuous
        textLabel.font = JdFontBridge.scaledFont(
            size: spec.labelFontSize,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        textLabel.textColor = JdToken.Color.foreground.uiColor
    }

    private func applyLabel() {
        let text = label ?? ""
        textLabel.text = text
        textLabel.isHidden = text.isEmpty
        // 웹은 라벨 없으면 AT 무노출 — 상태명으로 보정한다
        accessibilityLabel = text.isEmpty ? JdStatusDotView.statusName(status) : text
        invalidateIntrinsicContentSize()
    }

    // 웹 `animation: jd-status-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite` 동형.
    // 왕복 애니메이션이라 duration은 한 주기의 절반이다.
    private func applyPulse() {
        dot.layer.removeAnimation(forKey: JdStatusDotView.pulseKey)
        let period = JdMotion.duration(JdStatusDotView.pulsePeriod)
        guard spec.pulses, period > 0, !UIAccessibility.isReduceMotionEnabled else { return }

        let animation = CABasicAnimation(keyPath: "opacity")
        animation.fromValue = JdToken.Opacity.o100
        animation.toValue = JdToken.Opacity.o50
        animation.duration = period / 2
        animation.autoreverses = true
        animation.repeatCount = .infinity
        let easing = JdToken.Easing.easeInOut  // 웹 cubic-bezier(0.4, 0, 0.6, 1)의 토큰 대응분
        animation.timingFunction = CAMediaTimingFunction(
            controlPoints: Float(easing.0),
            Float(easing.1),
            Float(easing.2),
            Float(easing.3))
        dot.layer.add(animation, forKey: JdStatusDotView.pulseKey)
    }

    @objc private func reduceMotionDidChange() {
        applyPulse()
    }

    /// 상태명 사전 — SwiftUI 계층(JdStatusDot)에 동형 사본이 있다(DEC-010으로 공유 불가).
    /// 웹엔 대응 리터럴이 없다: 라벨 없는 점의 AT 무노출을 메우려 iOS가 신설한 어휘다.
    static func statusName(_ status: JdStatusKind) -> String {
        switch status {
        case .neutral: return "중립"
        case .success: return "정상"
        case .warning: return "경고"
        case .danger: return "위험"
        case .info: return "정보"
        case .pulse: return "활성"
        }
    }
}
