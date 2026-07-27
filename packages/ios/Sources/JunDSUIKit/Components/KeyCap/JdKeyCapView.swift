import UIKit
import JunDSCore

// 웹 jd-key-cap 동형 — 키 한 개 모양 칩. A8 명명 규칙 Jd<이름>View(UILabel 서브클래스).
// 치수·색·눌림 오프셋은 전부 JdKeyCapSpec. 눌림 = 아래로 1pt 이동 + 그림자 제거
// (웹 translateY(1px) + box-shadow:none), 전환은 JdMotion 경유라 Reduce Motion에서 즉시 반영된다.
public final class JdKeyCapView: UILabel {

    // 웹 pressed attribute 동형 — 눌림 상태는 소비자가 소유한다(자체 터치 처리 없음)
    public var isPressed: Bool {
        didSet {
            guard isPressed != oldValue else { return }
            applyPressed(animated: true)
        }
    }

    public let variant: JdKeyCapVariant
    public let keyCapSize: JdDisplaySize

    private let spec: JdKeyCapSpec

    public init(_ key: String,
                variant: JdKeyCapVariant = .default,
                size: JdDisplaySize = .md,
                isPressed: Bool = false) {
        self.variant = variant
        self.keyCapSize = size
        self.isPressed = isPressed
        self.spec = JdKeyCapSpec.resolve(variant: variant, size: size)
        super.init(frame: .zero)

        text = key
        textAlignment = .center
        adjustsFontForContentSizeCategory = true

        backgroundColor = spec.background.uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        layer.borderWidth = JdToken.Border.thin
        // 그림자는 모서리 밖으로 나가야 한다 — 클리핑 금지
        clipsToBounds = false

        applyStyle()
        applyPressed(animated: false)
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 웹 height/min-width 동형 — 단 고정이 아니라 하한이다(XXXL에서 자란다, 04 §7.2)
    public override var intrinsicContentSize: CGSize {
        let base = super.intrinsicContentSize
        return CGSize(width: max(spec.minWidth, base.width + spec.hPadding * 2),
                      height: max(spec.height, base.height))
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(테두리·그림자)와 스케일 폰트는 수동 재적용
        applyStyle()
        applyShadow()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private func applyStyle() {
        font = JdFontBridge.scaledMonoFont(size: spec.fontSize,
                                           weight: JdToken.FontWeight.medium,
                                           compatibleWith: traitCollection)
        textColor = spec.foreground.uiColor
        layer.borderColor = spec.border.uiColor
            .resolvedColor(with: traitCollection).cgColor
    }

    private func applyPressed(animated: Bool) {
        let target: CGAffineTransform = isPressed
            ? CGAffineTransform(translationX: 0, y: JdKeyCapSpec.pressedOffset)
            : .identity
        let apply = { [weak self] in
            self?.transform = target
            self?.applyShadow()
        }
        // Reduce Motion이면 JdMotion.duration이 0을 돌려준다 → 즉시 적용 (04 §7.3)
        let duration = JdMotion.duration(JdToken.Duration.fast)
        if animated && duration > 0 {
            UIView.animate(withDuration: duration, animations: apply)
        } else {
            apply()
        }
    }

    // 웹 .jd-key-cap의 미세 바닥 그림자 — 토큰 사다리의 xs를 승계한다(기하는 라이트/다크 동일).
    private func applyShadow() {
        // CALayer는 그림자 한 장뿐 → blur가 가장 큰 겹(주변광)을 고른다 (DEC-039)
        guard spec.hasKeyShadow, !isPressed,
              let (ink, geometry) = JdToken.Shadow.xs.dominant else {
            layer.shadowOpacity = 0
            return
        }
        layer.shadowColor = ink.uiColor.resolvedColor(with: traitCollection).cgColor
        // 알파는 색이 이미 들고 있다 — opacity는 1로 두고 토큰 값을 그대로 살린다
        layer.shadowOpacity = 1
        layer.shadowOffset = CGSize(width: geometry.x, height: geometry.y)
        layer.shadowRadius = geometry.blur / 2 // CSS blur = 2 × 렌더 반경
    }
}
