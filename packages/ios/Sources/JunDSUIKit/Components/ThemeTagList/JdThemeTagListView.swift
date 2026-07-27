import UIKit
import JunDSCore

// 웹 jd-theme-tag-list 동형 — 해시태그 칩 줄. (DEC-047)
//
// JdWrapView의 실제 사용처다: 칩 개수가 런타임에 정해지고 폭에 맞춰 흘러야 한다.
// 이전에는 이런 배치가 UIKit에서 컬렉션 뷰 한 채였다(DEC-041).
public final class JdThemeTagListView: UIView {

    public var themes: [String] {
        didSet { rebuild() }
    }

    /// 칩을 눌렀을 때. nil이면 표시 전용이다.
    public var onSelect: ((String) -> Void)? {
        didSet { rebuild() }
    }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let wrap: JdWrapView

    public init(themes: [String],
                spacing: CGFloat = JdToken.Space.s1_5,
                onSelect: ((String) -> Void)? = nil) {
        self.themes = themes
        self.onSelect = onSelect
        self.wrap = JdWrapView(itemSpacing: spacing)
        super.init(frame: .zero)
        wrap.jdFill(self)
        rebuild()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        CGSize(width: UIView.noIntrinsicMetric, height: wrap.sizeThatFits(bounds.size).height)
    }

    public override func sizeThatFits(_ size: CGSize) -> CGSize {
        CGSize(width: size.width, height: wrap.sizeThatFits(size).height)
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        invalidateIntrinsicContentSize()
    }

    private func rebuild() {
        wrap.setItems(themes.enumerated().map { index, theme in
            let chip = JdThemeChipView(theme: theme, index: index)
            if let onSelect {
                chip.onTap = { onSelect(theme) }
            }
            return chip
        })
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }
}

/// 칩 하나. 목록 밖에서 단독으로도 쓸 수 있게 public이다.
public final class JdThemeChipView: UIView {

    public var theme: String { didSet { applyContent() } }

    /// 있으면 탭 가능해지고 접근성 트레이트도 링크가 된다
    public var onTap: (() -> Void)? {
        didSet { applyInteraction() }
    }

    let label = UILabel()
    private let spec: JdThemeChipSpec

    public init(theme: String, index: Int = 0) {
        self.theme = theme
        self.spec = JdThemeChipSpec.resolve(index: index)
        super.init(frame: .zero)

        label.adjustsFontForContentSizeCategory = true
        label.numberOfLines = 1
        addSubview(label)
        label.jd.layout {
            $0.top.equalToSuperview().inset(spec.vPadding)
            $0.bottom.equalToSuperview().inset(spec.vPadding)
            $0.leading.equalToSuperview().inset(spec.hPadding)
            $0.trailing.equalToSuperview().inset(spec.hPadding)
        }
        layer.masksToBounds = true
        backgroundColor = spec.background.uiColor
        applyStyle()
        applyContent()
        applyInteraction()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        // 알약 — 높이 기준이라 Dynamic Type에서 자라도 모양이 유지된다
        layer.cornerRadius = bounds.height / 2
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    public override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }

    private func applyStyle() {
        label.font = JdFontBridge.scaledFont(size: spec.fontSize,
                                             weight: spec.fontWeight,
                                             compatibleWith: traitCollection)
        label.textColor = spec.foreground.uiColor
    }

    private func applyContent() {
        // "#"는 장식이라 옅게 — attributed로 앞머리만 알파를 낮춘다
        let text = NSMutableAttributedString(
            string: "#",
            attributes: [.foregroundColor: spec.foreground.uiColor
                .withAlphaComponent(CGFloat(spec.prefixOpacity))]
        )
        text.append(NSAttributedString(string: theme))
        label.attributedText = text
        // 낭독에서 "샵"은 뺀다 — 장식이다
        accessibilityLabel = theme
    }

    private func applyInteraction() {
        gestureRecognizers?.forEach(removeGestureRecognizer)
        guard onTap != nil else {
            accessibilityTraits.remove(.link)
            return
        }
        accessibilityTraits.insert(.link)
        addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTap)))
    }

    @objc private func didTap() { onTap?() }
}
