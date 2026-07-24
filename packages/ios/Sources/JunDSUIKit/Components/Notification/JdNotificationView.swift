import UIKit
import JunDSCore

// 웹 jd-notification의 UIKit 번역 — 인라인 카드(아이콘+제목+설명+액션+닫기) (DESIGN-4 §B).
// A8 명명 규칙 Jd<이름>View. 30% 테두리 + 5% 틴트로 variant를 색만이 아니라 형태로도 구분한다.
// 색은 Core variant.color가 단일 소스.
public final class JdNotificationView: UIView {

    private let variant: JdFeedbackVariant
    private let systemImage: String?
    private let onAction: (() -> Void)?
    private let onDismiss: (() -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    private(set) var dismissButton: JdFeedbackActionButton?
    private(set) var actionButton: JdFeedbackActionButton?

    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let descriptionLabel = UILabel()
    private let textStack = UIStackView()
    private let bodyStack = UIStackView()

    public init(title: String? = nil,
                description: String? = nil,
                variant: JdFeedbackVariant = .info,
                systemImage: String? = nil,
                actionLabel: String? = nil,
                onAction: (() -> Void)? = nil,
                isDismissible: Bool = false,
                onDismiss: (() -> Void)? = nil) {
        self.variant = variant
        self.systemImage = systemImage
        self.onAction = onAction
        self.onDismiss = onDismiss
        super.init(frame: .zero)

        iconView.contentMode = .center
        iconView.isAccessibilityElement = false // 아이콘은 장식 — 제목/설명이 표면
        iconView.setContentHuggingPriority(.required, for: .horizontal)
        iconView.isHidden = (systemImage == nil)

        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.numberOfLines = 0
        titleLabel.text = title
        titleLabel.isHidden = (title == nil)

        descriptionLabel.adjustsFontForContentSizeCategory = true
        descriptionLabel.numberOfLines = 0
        descriptionLabel.text = description
        descriptionLabel.isHidden = (description == nil)

        textStack.axis = .vertical
        textStack.spacing = JdToken.Space.s2
        textStack.addArrangedSubview(titleLabel)
        textStack.addArrangedSubview(descriptionLabel)

        if let actionLabel, let onAction {
            let button = JdNotificationView.makeActionButton(actionLabel,
                                                             tint: variant.color.uiColor) { onAction() }
            actionButton = button
            let row = UIStackView(arrangedSubviews: [button, UIView()])
            row.axis = .horizontal
            textStack.addArrangedSubview(row)
        }

        bodyStack.axis = .horizontal
        bodyStack.alignment = .top
        bodyStack.spacing = JdToken.Space.s3
        bodyStack.isLayoutMarginsRelativeArrangement = true
        bodyStack.directionalLayoutMargins = NSDirectionalEdgeInsets(
            top: JdToken.Space.s4, leading: JdToken.Space.s4,
            bottom: JdToken.Space.s4, trailing: JdToken.Space.s4)
        if systemImage != nil {
            bodyStack.addArrangedSubview(iconView)
        }
        bodyStack.addArrangedSubview(textStack)

        addSubview(bodyStack)
        bodyStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        if isDismissible {
            let button = JdFeedbackDismissButton.make { [weak self] in self?.onDismiss?() }
            dismissButton = button
            bodyStack.addArrangedSubview(button)
        }

        layer.cornerCurve = .continuous
        layer.cornerRadius = JdToken.Radius.xl
        layer.borderWidth = JdToken.Border.thin

        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // MARK: 내부

    private func applyStyle() {
        backgroundColor = JdFeedbackTint.tint(variant.color)
        // CGColor는 다이나믹 자동 갱신이 안 돼 트레이트마다 수동 재적용 (30% 테두리)
        layer.borderColor = variant.color.uiColor
            .resolvedColor(with: traitCollection)
            .withAlphaComponent(CGFloat(JdToken.Opacity.o30))
            .cgColor

        titleLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.lg,
                                                  weight: JdToken.FontWeight.semibold,
                                                  compatibleWith: traitCollection)
        titleLabel.textColor = JdToken.Color.foreground.uiColor

        descriptionLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                        weight: JdToken.FontWeight.normal,
                                                        compatibleWith: traitCollection)
        descriptionLabel.textColor = JdToken.Color.muted.uiColor

        if let systemImage {
            iconView.tintColor = variant.color.uiColor
            iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(
                font: JdFontBridge.scaledFont(size: JdToken.FontSize.lg,
                                              weight: JdToken.FontWeight.semibold,
                                              compatibleWith: traitCollection))
            iconView.image = UIImage(systemName: systemImage)
        }

        if let actionButton {
            actionButton.tintColor = variant.color.uiColor
            actionButton.titleLabel?.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                                    weight: JdToken.FontWeight.semibold,
                                                                    compatibleWith: traitCollection)
        }
        dismissButton?.setPreferredSymbolConfiguration(
            JdFeedbackDismissButton.symbolConfig(compatibleWith: traitCollection), forImageIn: .normal)
    }

    private static func makeActionButton(_ title: String, tint: UIColor,
                                         onTap: @escaping () -> Void) -> JdFeedbackActionButton {
        let button = JdFeedbackActionButton(type: .system)
        button.setTitle(title, for: .normal)
        button.tintColor = tint
        button.titleLabel?.adjustsFontForContentSizeCategory = true
        button.accessibilityLabel = title
        button.contentHorizontalAlignment = .leading
        button.onTapForward = onTap
        button.addTarget(button, action: #selector(JdFeedbackActionButton.jdHandleTap), for: .touchUpInside)
        return button
    }
}
