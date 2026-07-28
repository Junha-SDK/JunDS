import JunDSCore
import UIKit

// 웹 jd-icon-button 동형 — 아이콘 전용 버튼. A8 명명 규칙 Jd<이름>View(UIControl 서브클래스).
// 웹은 네이티브 <button>에 위임하지만 iOS엔 대응 컨테이너가 없어 UIControl이 정본이다
// (JdButtonView와 동일 계보).
//
// ⚠️ 접근성 각주(히트 타깃): 웹 크기(xs 24 · sm 28 · md 32 · lg 40) 승계라 **네 크기 모두
//    HIG 최소 44pt에 미달한다**. 표면은 3플랫폼 패리티 때문에 유지하며, 단독 배치되는 주요
//    액션에는 lg + 소비자 측 터치 영역 확장을 권한다. Dynamic Type에서는 intrinsic이
//    UIFontMetrics로 자라므로(04 §7.2) 큰 카테고리에서는 실질 타깃도 함께 커진다.
public final class JdIconButtonView: UIControl {

    public var onTap: (() -> Void)?

    private let iconView = UIImageView()
    private let systemImage: String
    private let spec: JdIconButtonSpec

    // 라벨 없는 init을 제공하지 않는다 — 아이콘 전용 컨트롤의 컴파일 타임 강제 (04 §7.1)
    public init(
        systemImage: String,
        accessibilityLabel: String,
        variant: JdIconButtonVariant = .ghost,
        size: JdIconButtonSize = .md
    ) {
        self.systemImage = systemImage
        self.spec = JdIconButtonSpec.resolve(variant: variant, size: size)
        super.init(frame: .zero)

        iconView.contentMode = .center
        iconView.isUserInteractionEnabled = false
        addSubview(iconView)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        iconView.jd.layout {
            $0.center.equalToSuperview()
        }
        jd.layout {
            // 고정 크기 금지 — 하한만 두고 Dynamic Type에서 intrinsic이 자란다 (04 §7.2)
            $0.width.greaterThanOrEqual(spec.side)
            $0.height.greaterThanOrEqual(spec.side)
        }

        isAccessibilityElement = true
        accessibilityTraits = .button
        // 아이콘은 표시 텍스트가 없으므로 인자 라벨이 유일한 VoiceOver 표면
        self.accessibilityLabel = accessibilityLabel

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyIcon()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 정사각 — 변은 Dynamic Type 스케일치(웹 고정 px의 iOS 번역, 04 §7.2)
    public override var intrinsicContentSize: CGSize {
        let side = scaledSide
        return CGSize(width: side, height: side)
    }

    public override var isHighlighted: Bool {
        didSet { animateStyle() }
    }

    public override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 심볼은 수동 재적용
        applyIcon()
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private var scaledSide: CGFloat {
        UIFontMetrics(forTextStyle: JdFontBridge.textStyle(forSize: spec.iconSize))
            .scaledValue(for: spec.side, compatibleWith: traitCollection)
    }

    private func applyIcon() {
        // SF Symbol은 폰트에 묶여 스케일된다 — 웹 아이콘 크기(변 0.5배)를 스케일 폰트로 싣는다
        let font = JdFontBridge.scaledFont(
            size: spec.iconSize,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: font)
        iconView.image = UIImage(systemName: systemImage)
        iconView.tintColor = spec.foreground.uiColor
    }

    private func applyStyle() {
        let background = isHighlighted ? spec.pressedBackground : spec.background
        backgroundColor = background.uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        if let border = spec.border {
            layer.borderWidth = JdToken.Border.thin
            layer.borderColor = border.uiColor.resolvedColor(with: traitCollection).cgColor
        } else {
            layer.borderWidth = 0
            layer.borderColor = nil
        }
        alpha = isEnabled ? 1 : JdToken.Opacity.o50  // 웹 :disabled opacity-50
    }

    // 웹 transition: all var(--jd-duration-fast) 동형 — Reduce Motion 시 즉시 전환 (04 §7.3)
    private func animateStyle() {
        let duration = JdMotion.duration(JdToken.Duration.fast)
        guard duration > 0 else {
            applyStyle()
            return
        }
        UIView.animate(withDuration: duration) { [weak self] in
            self?.applyStyle()
        }
    }

    @objc private func didTap() {
        onTap?()
    }
}
