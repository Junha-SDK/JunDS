import JunDSCore
import UIKit

// 웹 jd-live-status-dot 동형 — 장 세션 라이브 여부 표시. (DEC-040)
//
// 장 세션 판정은 앱의 몫이고 결과만 주입받는다(DEC-019). 펄스는 웹 v3가 JS 타이머에서
// CSS 키프레임으로 옮긴 것을 CAAnimation으로 옮겼고, Reduce Motion이면 붙지 않는다
// (04 §7.3 — JdMotion 단일 진입점 경유).
public final class JdLiveStatusDotView: UIView {

    public var live: Bool {
        didSet { resolveAndApply() }
    }

    /// 라벨 override. 비우면 live→"실시간" / 그 외→"장마감"
    public var label: String? {
        didSet { applyContent() }
    }

    private static let pulseKey = "jd.liveStatusDot.pulse"

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let dot = UIView()
    let textLabel = UILabel()
    /// 확장-소멸 링. 점보다 아래에 깔린다.
    let ring = UIView()

    private let contentStack: JdStackView
    private var spec: JdLiveStatusDotSpec

    public init(live: Bool, label: String? = nil) {
        self.live = live
        self.label = label
        self.spec = JdLiveStatusDotSpec.resolve(live: live)
        self.contentStack = JdStackView(
            axis: .horizontal,
            gap: .custom(spec.gap),
            alignment: .center)
        super.init(frame: .zero)

        dot.isUserInteractionEnabled = false
        ring.isUserInteractionEnabled = false
        textLabel.adjustsFontForContentSizeCategory = true
        textLabel.numberOfLines = 1

        // 링은 점의 형제가 아니라 자식이다 — 점을 기준으로 스케일해야 중심이 맞는다
        dot.addSubview(ring)
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
        ring.jd.layout {
            $0.edges.equalToSuperview()
        }

        // 점·링은 원형 — 반경은 지름의 절반 고정(레이아웃과 무관하게 결정적)
        dot.layer.cornerRadius = spec.dotSize / 2
        ring.layer.cornerRadius = spec.dotSize / 2

        resolveAndApply()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
        // Reduce Motion 토글도 trait 변화로 온다 — 펄스를 다시 판정한다
        applyPulse()
    }

    /// 접근성: 점은 장식이고 상태는 라벨이 낭독한다(웹 aria-hidden 동형).
    /// 요소 하나로 합쳐 점+라벨이 따로 읽히지 않게 한다.
    public override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }

    // MARK: 내부

    private func resolveAndApply() {
        spec = JdLiveStatusDotSpec.resolve(live: live)
        applyStyle()
        applyContent()
        applyPulse()
    }

    private func applyStyle() {
        let color = spec.color.uiColor
        dot.backgroundColor = color
        ring.backgroundColor = JdFinanceSpecMix.wash(spec.color, alpha: 0.45).uiColor
        textLabel.textColor = color
        textLabel.font = JdFontBridge.scaledFont(
            size: spec.fontSize,
            weight: JdToken.FontWeight.bold,
            compatibleWith: traitCollection)
    }

    private func applyContent() {
        let resolved =
            (label?.isEmpty == false)
            ? label!
            : JdLiveStatusDotSpec.defaultLabel(live: live)
        textLabel.text = resolved
        accessibilityLabel = resolved
    }

    /// 확장-소멸 링. 웹 `1.6s ease-out infinite` — autoreverses 없이 처음부터 다시.
    private func applyPulse() {
        ring.layer.removeAnimation(forKey: Self.pulseKey)
        let duration = JdMotion.duration(JdLiveStatusDotSpec.pulsePeriod)
        guard spec.pulses, duration > 0 else {
            // 정지 시 링을 숨긴다 — 멈춘 반투명 원이 남으면 점이 두 겹으로 보인다
            ring.isHidden = true
            return
        }
        ring.isHidden = false

        let scale = CABasicAnimation(keyPath: "transform.scale")
        scale.fromValue = 1
        scale.toValue = 2.25
        let fade = CABasicAnimation(keyPath: "opacity")
        fade.fromValue = 1
        fade.toValue = 0

        let group = CAAnimationGroup()
        group.animations = [scale, fade]
        group.duration = duration
        group.repeatCount = .infinity
        let easing = JdToken.Easing.easeOut
        group.timingFunction = CAMediaTimingFunction(
            controlPoints: Float(easing.0),
            Float(easing.1),
            Float(easing.2),
            Float(easing.3))
        ring.layer.add(group, forKey: Self.pulseKey)
    }
}
