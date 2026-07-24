import UIKit
import JunDSCore

// 웹 jd-follow-button 동형 — 두 변형 캡슐 버튼 (DESIGN-3 §B).
// 미팔로우 = primary 채움 / 팔로잉 = secondary 외곽선. 두 변형 모두 JdButtonSpec 재사용이고
// 모서리만 캡슐이다(웹 border-radius: 9999px = JdToken.Radius.full).
// iOS엔 호버가 없으므로 웹의 호버 문구 교체("언팔로우")는 이식하지 않는다 — 눌림만.
public final class JdFollowButtonView: UIControl {

    /// 프로그램 변경은 onChange를 발화시키지 않는다 — 웹 jd-change는 사용자 조작 전용
    public var isFollowing: Bool {
        didSet { resolveAndApply() }
    }

    public var size: JdControlSize {
        didSet { resolveAndApply() }
    }

    public var followLabel: String {
        didSet { applyTitle() }
    }

    public var followingLabel: String {
        didSet { applyTitle() }
    }

    public var onChange: ((Bool) -> Void)?

    private let titleLabel = UILabel()
    private var spec: JdButtonSpec

    public init(isFollowing: Bool = false,
                size: JdControlSize = .md,
                followLabel: String = "팔로우",
                followingLabel: String = "팔로잉") {
        self.isFollowing = isFollowing
        self.size = size
        self.followLabel = followLabel
        self.followingLabel = followingLabel
        self.spec = JdButtonSpec.resolve(variant: isFollowing ? .secondary : .primary, size: size)
        super.init(frame: .zero)

        titleLabel.textAlignment = .center
        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.isUserInteractionEnabled = false
        addSubview(titleLabel)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        titleLabel.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
            $0.top.greaterThanOrEqualToSuperview().inset(JdToken.Space.s1)
        }
        jd.layout {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        // 카드 아닌 단일 컨트롤 — 요소 1개로 노출 (04 §7.1)
        isAccessibilityElement = true
        accessibilityTraits = .button

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyTitle()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        let content = titleLabel.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        return CGSize(width: content.width + spec.hPadding * 2,
                      height: max(spec.minHeight, content.height + JdToken.Space.s1 * 2))
    }

    public override var isHighlighted: Bool {
        didSet { applyStyle() }
    }

    public override var isEnabled: Bool {
        didSet { applyStyle() }
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 캡슐 — Radius.full(9999)의 기하 번역은 "높이의 절반"이다
        layer.cornerRadius = min(JdToken.Radius.full, bounds.height / 2)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: - 내부

    private func resolveAndApply() {
        spec = JdButtonSpec.resolve(variant: isFollowing ? .secondary : .primary, size: size)
        jd.update {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }
        titleLabel.jd.update {
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
        }
        applyTitle()
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func applyTitle() {
        let title = isFollowing ? followingLabel : followLabel
        titleLabel.text = title
        // 라벨 교체가 곧 상태 표기다 — 트레이트로 눌림 상태를 함께 준다(웹 aria-pressed 동형)
        accessibilityLabel = title
        if isFollowing {
            accessibilityTraits.insert(.selected)
        } else {
            accessibilityTraits.remove(.selected)
        }
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        titleLabel.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                                  weight: spec.fontWeight,
                                                  compatibleWith: traitCollection)
        titleLabel.textColor = spec.foreground.uiColor
        backgroundColor = (isHighlighted ? spec.pressedBackground : spec.background).uiColor
        layer.cornerCurve = .continuous
        if let border = spec.border {
            layer.borderWidth = JdToken.Border.thin
            layer.borderColor = border.uiColor.resolvedColor(with: traitCollection).cgColor
        } else {
            layer.borderWidth = 0
            layer.borderColor = nil
        }
        alpha = isEnabled ? 1 : spec.disabledOpacity
        setNeedsLayout()
    }

    @objc private func didTap() {
        isFollowing.toggle()
        onChange?(isFollowing)
    }
}
