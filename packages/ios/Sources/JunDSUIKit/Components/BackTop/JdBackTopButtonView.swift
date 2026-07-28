import JunDSCore
import UIKit

// 웹 jd-back-top 동형 — 버튼만 컴포넌트다 (DESIGN-3 §B).
// 스크롤 자체는 시스템(UIScrollView.setContentOffset)이 하고, 가시성 판정은 소비자가
// JdBackTop.shouldShow(scrollY:threshold:)로 한다 — 여기서 임계값을 다시 계산하지 않는다.
public final class JdBackTopButtonView: UIControl {

    public var onTap: (() -> Void)?

    private let iconView = UIImageView()
    /// 40pt·아이콘 20pt는 아이콘 버튼 lg 스펙에서 그대로 가져오고 형태만 원형으로 바꾼다
    private let spec = JdIconButtonSpec.resolve(variant: .outline, size: .lg)

    public init(label: String = JdBackTop.defaultLabel) {
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
        accessibilityLabel = label

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        let side = UIFontMetrics(forTextStyle: JdFontBridge.textStyle(forSize: spec.iconSize))
            .scaledValue(for: spec.side, compatibleWith: traitCollection)
        return CGSize(width: side, height: side)
    }

    public override var isHighlighted: Bool {
        didSet { applyStyle() }
    }

    public override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 원형 — 지름의 절반
        layer.cornerRadius = bounds.height / 2
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border/shadow)와 스케일 심볼은 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: - 내부

    private func applyStyle() {
        // SF Symbol은 폰트에 묶여 스케일된다 (04 §7.2)
        let font = JdFontBridge.scaledFont(
            size: spec.iconSize,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: font)
        iconView.image = UIImage(systemName: "arrow.up")
        iconView.tintColor = JdToken.Color.foreground.uiColor

        backgroundColor = (isHighlighted ? spec.pressedBackground : JdToken.Color.card).uiColor
        layer.cornerCurve = .continuous
        layer.borderWidth = JdToken.Border.thin
        layer.borderColor =
            JdToken.Color.border.uiColor.resolvedColor(with: traitCollection).cgColor
        alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50)
        applyShadow()
        setNeedsLayout()
    }

    // 웹 box-shadow: var(--jd-shadow-lg) — 알파는 토큰 색이 이미 들고 있으므로
    // opacity는 1로 둔다. CALayer는 그림자 한 장뿐이라 blur가 가장 큰 겹(주변광)을
    // 고른다 — `.first`(접지 겹, 다크에서는 헤어라인 링)는 두 모드 모두 틀린 장이다 (DEC-039).
    private func applyShadow() {
        guard let (ink, geometry) = JdToken.Shadow.lg.dominant else {
            layer.shadowOpacity = 0
            return
        }
        layer.shadowColor = ink.uiColor.resolvedColor(with: traitCollection).cgColor
        layer.shadowOpacity = 1
        layer.shadowOffset = CGSize(width: geometry.x, height: geometry.y)
        layer.shadowRadius = geometry.blur / 2  // CSS blur = 2 × 렌더 반경
    }

    @objc private func didTap() {
        onTap?()
    }
}
