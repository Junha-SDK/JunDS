import UIKit
import JunDSCore

// 웹 jd-disclosure-tone-badge 동형 — DART 공시 톤 라벨. (DEC-047)
public final class JdDisclosureToneBadgeView: UIView {

    public var tone: JdDisclosureTone { didSet { resolveAndApply() } }
    public var category: JdDisclosureCategory { didSet { applyContent() } }
    public var confidence: Double { didSet { applyContent() } }
    public var compact: Bool { didSet { resolveAndApply() } }

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let toneLabel = UILabel()
    let categoryLabel = UILabel()
    let confidenceLabel = UILabel()

    private let stack: JdStackView
    private var spec: JdDisclosureToneBadgeSpec

    public init(tone: JdDisclosureTone,
                category: JdDisclosureCategory = .other,
                confidence: Double = 0,
                compact: Bool = false) {
        self.tone = tone
        self.category = category
        self.confidence = confidence
        self.compact = compact
        self.spec = JdDisclosureToneBadgeSpec.resolve(tone: tone, compact: compact)
        self.stack = JdStackView(axis: .horizontal, gap: .custom(spec.gap), alignment: .center)
        super.init(frame: .zero)

        for label in [toneLabel, categoryLabel, confidenceLabel] {
            label.adjustsFontForContentSizeCategory = true
            label.numberOfLines = 1
            stack.addArrangedSubview(label)
        }
        addSubview(stack)
        stack.jd.layout {
            $0.top.greaterThanOrEqual(to: self.jd.top)
            $0.centerY.equalToSuperview()
            $0.leading.equalToSuperview().inset(spec.hPadding)
            $0.trailing.equalToSuperview().inset(spec.hPadding)
        }
        layer.masksToBounds = true
        resolveAndApply()
    }

    required public init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    /// 고정 height 금지 — Dynamic Type에서 자란다 (04 §7.2). 스펙 높이는 하한이다.
    public override var intrinsicContentSize: CGSize {
        let content = stack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        return CGSize(width: content.width + spec.hPadding * 2,
                      height: max(spec.height, content.height))
    }

    public override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        layer.cornerRadius = spec.cornerRadius
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    // MARK: 내부

    private func resolveAndApply() {
        spec = JdDisclosureToneBadgeSpec.resolve(tone: tone, compact: compact)
        stack.gap = .custom(spec.gap)
        applyStyle()
        applyContent()
        invalidateIntrinsicContentSize()
        setNeedsLayout()
    }

    private func applyStyle() {
        backgroundColor = spec.background.uiColor
        let fg = spec.foreground.uiColor
        toneLabel.textColor = fg
        // 투명도는 알파가 아니라 색에 실어 둔다 — 배경 위에서 예측 가능하다
        categoryLabel.textColor = fg.withAlphaComponent(CGFloat(spec.categoryOpacity))
        confidenceLabel.textColor = fg.withAlphaComponent(CGFloat(spec.confidenceOpacity))

        toneLabel.font = JdFontBridge.scaledFont(size: spec.toneFontSize,
                                                weight: JdToken.FontWeight.bold,
                                                compatibleWith: traitCollection)
        categoryLabel.font = JdFontBridge.scaledFont(size: spec.categoryFontSize,
                                                    weight: JdToken.FontWeight.bold,
                                                    compatibleWith: traitCollection)
        confidenceLabel.font = JdFontBridge.scaledDigitFont(size: spec.confidenceFontSize,
                                                           weight: JdToken.FontWeight.bold,
                                                           compatibleWith: traitCollection)
    }

    private func applyContent() {
        toneLabel.text = tone.label
        categoryLabel.text = category.label
        let conf = JdDisclosureToneBadgeSpec.confidenceText(confidence)
        confidenceLabel.text = conf
        categoryLabel.isHidden = !spec.showsDetail
        confidenceLabel.isHidden = !spec.showsDetail || conf == nil
        accessibilityLabel = JdDisclosureToneBadgeSpec.accessibilityText(
            tone: tone, category: category, confidence: confidence)
        invalidateIntrinsicContentSize()
    }
}
