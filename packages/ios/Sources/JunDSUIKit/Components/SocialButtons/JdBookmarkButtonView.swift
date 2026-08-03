import JunDSCore
import UIKit

// 웹 jd-bookmark-button 동형 — 심볼 토글 (DESIGN-3 §B). A8 명명 규칙 Jd<이름>View.
// 기하(변·모서리·아이콘 크기)는 JdIconButtonSpec(ghost) 재사용이고 색만 상태로 갈아끼운다.
//
// ⚠️ 상태 프로퍼티 이름은 isBookmarked다 — UIControl이 isSelected/isHighlighted/isEnabled를
//    이미 점유하고 있어(JdCheckboxView의 isSelectedState와 같은 충돌 회피 계보) 재사용 금지.
public final class JdBookmarkButtonView: UIControl {

    /// 프로그램 변경은 onChange를 발화시키지 않는다 — 웹 jd-change는 사용자 조작 전용
    public var isBookmarked: Bool {
        didSet { applyState() }
    }

    public var onChange: ((Bool) -> Void)?

    private let iconView = UIImageView()
    private let spec: JdIconButtonSpec

    public init(isBookmarked: Bool = false, size: JdIconButtonSize = .md) {
        self.isBookmarked = isBookmarked
        self.spec = JdIconButtonSpec.resolve(variant: .ghost, size: size)
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

        // 카드 아닌 단일 컨트롤 — 요소 1개로 노출 (04 §7.1)
        isAccessibilityElement = true
        accessibilityTraits = .button

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 정사각 — 변은 Dynamic Type 스케일치 (04 §7.2)
    public override var intrinsicContentSize: CGSize {
        let side = UIFontMetrics(forTextStyle: JdFontBridge.textStyle(forSize: spec.iconSize))
            .scaledValue(for: spec.side, compatibleWith: traitCollection)
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
        // 다이나믹 컬러는 자동 갱신되나 스케일 심볼은 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: - 내부

    private func applyStyle() {
        backgroundColor = (isHighlighted ? spec.pressedBackground : spec.background).uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        alpha = isEnabled ? 1 : CGFloat(JdToken.Opacity.o50)
        applyState()
    }

    private func applyState() {
        // SF Symbol은 폰트에 묶여 스케일된다 (04 §7.2)
        let font = JdFontBridge.scaledFont(
            size: spec.iconSize,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(font: font)
        iconView.image = UIImage(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
        // 켜짐 = warning 토큰, 꺼짐 = 스펙 기본 전경(muted)
        iconView.tintColor = (isBookmarked ? JdToken.Color.warning : spec.foreground).uiColor

        // 웹 aria-pressed + 라벨 교체 동형 — 라벨은 "다음 동작", 상태는 트레이트 (04 §7.1)
        accessibilityLabel = isBookmarked ? "북마크 해제" : "북마크"
        if isBookmarked {
            accessibilityTraits.insert(.selected)
        } else {
            accessibilityTraits.remove(.selected)
        }
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
        isBookmarked.toggle()
        onChange?(isBookmarked)
    }
}
