import UIKit
import JunDSCore

public final class JdButtonView: UIControl {

    public var title: String {
        didSet {
            titleLabel.text = title
            accessibilityLabel = title
            invalidateIntrinsicContentSize()
        }
    }

    public var variant: JdButtonVariant {
        didSet { resolveAndApply() }
    }

    public var size: JdControlSize {
        didSet { resolveAndApply() }
    }

    // 웹 loading과 동일 의미론: 입력 차단 + 스피너 + aria-busy 등가(a11y value)
    public var isLoading: Bool = false {
        didSet { applyLoading() }
    }

    public var onTap: (() -> Void)?

    private let titleLabel = UILabel()
    private let spinner = UIActivityIndicatorView(style: .medium)
    private let contentStack = UIStackView()
    private var spec: JdButtonSpec

    public init(title: String,
                variant: JdButtonVariant = .primary,
                size: JdControlSize = .md) {
        self.title = title
        self.variant = variant
        self.size = size
        self.spec = JdButtonSpec.resolve(variant: variant, size: size)
        super.init(frame: .zero)

        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = JdToken.Space.s2
        contentStack.isUserInteractionEnabled = false

        titleLabel.text = title
        titleLabel.textAlignment = .center
        titleLabel.adjustsFontForContentSizeCategory = true

        spinner.hidesWhenStopped = true

        contentStack.addArrangedSubview(spinner)
        contentStack.addArrangedSubview(titleLabel)
        addSubview(contentStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        contentStack.jd.layout {
            $0.center.equalToSuperview()
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
            $0.top.greaterThanOrEqualToSuperview().inset(JdToken.Space.s1)
        }
        jd.layout {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }

        isAccessibilityElement = true
        accessibilityTraits = .button
        accessibilityLabel = title

        addTarget(self, action: #selector(didTap), for: .touchUpInside)
        applyStyle()
        applyLoading()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override var intrinsicContentSize: CGSize {
        let content = contentStack.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        let width = content.width + spec.hPadding * 2
        let height = max(spec.minHeight, content.height + JdToken.Space.s1 * 2)
        return CGSize(width: width, height: height)
    }

    public override var isHighlighted: Bool {
        didSet { applyStyle() }
    }

    public override var isEnabled: Bool {
        didSet {
            applyStyle()
            applyLoading()
        }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 CGColor(border)와 스케일 폰트는 수동 재적용
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func resolveAndApply() {
        spec = JdButtonSpec.resolve(variant: variant, size: size)
        jd.update {
            $0.height.greaterThanOrEqual(spec.minHeight)
        }
        contentStack.jd.update {
            $0.leading.greaterThanOrEqualToSuperview().inset(spec.hPadding)
        }
        applyStyle()
        invalidateIntrinsicContentSize()
    }

    private func applyStyle() {
        titleLabel.font = JdFontBridge.scaledFont(size: spec.fontSize, weight: spec.fontWeight, compatibleWith: traitCollection)
        titleLabel.textColor = spec.foreground.uiColor
        spinner.color = spec.foreground.uiColor
        let bg = isHighlighted ? spec.pressedBackground : spec.background
        backgroundColor = bg.uiColor
        layer.cornerRadius = spec.radius
        layer.cornerCurve = .continuous
        if let border = spec.border {
            layer.borderWidth = JdToken.Border.thin
            layer.borderColor = border.uiColor.resolvedColor(with: traitCollection).cgColor
        } else {
            layer.borderWidth = 0
            layer.borderColor = nil
        }
        alpha = isEnabled ? 1 : spec.disabledOpacity
    }

    private func applyLoading() {
        if isLoading {
            spinner.startAnimating()
            isUserInteractionEnabled = false
            accessibilityValue = "로딩 중"
        } else {
            spinner.stopAnimating()
            isUserInteractionEnabled = isEnabled
            accessibilityValue = nil
        }
        invalidateIntrinsicContentSize()
    }

    @objc private func didTap() {
        onTap?()
    }
}
