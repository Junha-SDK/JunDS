import UIKit
import JunDSCore

// 웹 jd-like-button 동형 — 하트 토글 + 선택적 카운트 (DESIGN-3 §B).
// 카운트 표기는 **JdNumberFormat.compactCount** 단일 소스다(자리수 축약 재구현 금지 — 04 §4.2).
//
// ⚠️ 상태 프로퍼티 이름은 isLiked다 — UIControl이 isSelected/isHighlighted/isEnabled를
//    점유하고 있어 재사용 금지(JdBookmarkButtonView와 같은 계보).
public final class JdLikeButtonView: UIControl {

    /// 프로그램 변경은 onChange를 발화시키지 않는다 — 웹 jd-change는 사용자 조작 전용
    public var isLiked: Bool {
        didSet { applyState() }
    }

    /// nil이면 카운트 슬롯을 감춘다(웹 count 미지정 동형)
    public var count: Int? {
        didSet { applyCount() }
    }

    public var onChange: ((Bool) -> Void)?

    private let iconView = UIImageView()
    private let countLabel = UILabel()
    private let contentStack = UIStackView()
    private let spec: JdIconButtonSpec

    public init(isLiked: Bool = false, count: Int? = nil, size: JdIconButtonSize = .md) {
        self.isLiked = isLiked
        self.count = count
        self.spec = JdIconButtonSpec.resolve(variant: .ghost, size: size)
        super.init(frame: .zero)

        iconView.contentMode = .center
        countLabel.adjustsFontForContentSizeCategory = true
        countLabel.numberOfLines = 1

        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = JdToken.Space.s1
        contentStack.isUserInteractionEnabled = false
        contentStack.addArrangedSubview(iconView)
        contentStack.addArrangedSubview(countLabel)
        addSubview(contentStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(JdToken.Space.s1)
        }
        jd.layout {
            // 고정 크기 금지 — 하한만 두고 Dynamic Type에서 intrinsic이 자란다 (04 §7.2)
            $0.width.greaterThanOrEqual(spec.side)
            $0.height.greaterThanOrEqual(spec.side)
        }

        // 하트 + 카운트는 한 컨트롤 = 접근성 요소 1개 (04 §7.1)
        isAccessibilityElement = true
        accessibilityTraits = .button

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        let content = contentStack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        let side = UIFontMetrics(forTextStyle: JdFontBridge.textStyle(forSize: spec.iconSize))
            .scaledValue(for: spec.side, compatibleWith: traitCollection)
        return CGSize(width: max(side, content.width + JdToken.Space.s1 * 2),
                      height: max(side, content.height))
    }

    public override var isHighlighted: Bool {
        didSet { animateStyle() }
    }

    public override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 심볼·폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: - 내부

    private func applyStyle() {
        backgroundColor = (isHighlighted ? spec.pressedBackground : spec.background).uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50)
        countLabel.font = JdFontBridge.scaledFont(size: JdTextSpec.resolve(size: .xs).fontSize,
                                                  weight: JdToken.FontWeight.medium,
                                                  compatibleWith: traitCollection)
        applyState()
        applyCount()
    }

    private func applyState() {
        // SF Symbol은 폰트에 묶여 스케일된다 (04 §7.2)
        let font = JdFontBridge.scaledFont(size: spec.iconSize,
                                           weight: JdToken.FontWeight.medium,
                                           compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: font)
        iconView.image = UIImage(systemName: isLiked ? "heart.fill" : "heart")
        // 켜짐 = danger 토큰, 꺼짐 = 스펙 기본 전경(muted)
        let tint = (isLiked ? JdToken.Color.danger : spec.foreground).uiColor
        iconView.tintColor = tint
        countLabel.textColor = tint

        // 웹 aria-pressed + 라벨 교체 동형 (04 §7.1)
        accessibilityLabel = isLiked ? "좋아요 취소" : "좋아요"
        if isLiked {
            accessibilityTraits.insert(.selected)
        } else {
            accessibilityTraits.remove(.selected)
        }
    }

    private func applyCount() {
        // 축약 규칙은 Core 소유 — 여기서 자리수를 다시 세지 않는다
        let text = count.map { JdNumberFormat.compactCount($0) }
        countLabel.text = text
        countLabel.isHidden = (text == nil)
        accessibilityValue = text
        invalidateIntrinsicContentSize()
    }

    // 웹 transition 동형 — Reduce Motion 시 즉시 전환 (04 §7.3, JdMotion 경유)
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
        isLiked.toggle()
        onChange?(isLiked)
    }
}
