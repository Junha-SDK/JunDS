import JunDSCore
import UIKit

// 웹 jd-empty-state의 UIKit 번역 — 중앙 배치 빈 상태 (DESIGN-4 §B). A8 명명 규칙 Jd<이름>View.
// ContentUnavailableView는 iOS17+라 iOS16 하한에서 자체 구현이 정본. 아이콘 칩(cardHover 배경,
// muted 아이콘) + 제목 + 설명 + 액션. a11y: 제목·설명은 하나로 합치고 액션 버튼만 독립 포커스.
public final class JdEmptyStateView: UIView {

    private let systemImage: String
    private let onAction: (() -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let textElement = UIStackView()  // 제목·설명을 합친 단일 접근성 요소
    private(set) var actionButton: JdFeedbackActionButton?

    private let iconChip = UIView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let descriptionLabel = UILabel()
    private let bodyStack = UIStackView()

    // 원형 아이콘 칩 지름 — 웹 고정 px의 토큰 번역(하드코딩 금지)
    private let chipDiameter = JdToken.Space.s16

    public init(
        title: String,
        description: String? = nil,
        systemImage: String = "tray",
        actionLabel: String? = nil,
        onAction: (() -> Void)? = nil
    ) {
        self.systemImage = systemImage
        self.onAction = onAction
        super.init(frame: .zero)

        iconView.contentMode = .center
        iconChip.addSubview(iconView)
        iconChip.isUserInteractionEnabled = false
        iconChip.isAccessibilityElement = false  // 아이콘은 장식

        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.numberOfLines = 0
        titleLabel.textAlignment = .center
        titleLabel.text = title

        descriptionLabel.adjustsFontForContentSizeCategory = true
        descriptionLabel.numberOfLines = 0
        descriptionLabel.textAlignment = .center
        descriptionLabel.text = description
        descriptionLabel.isHidden = (description == nil)

        textElement.axis = .vertical
        textElement.alignment = .fill
        textElement.spacing = JdToken.Space.s2
        textElement.addArrangedSubview(titleLabel)
        textElement.addArrangedSubview(descriptionLabel)
        // 제목·설명을 하나의 요소로 합친다(스택이 요소가 되면 자식 라벨은 트리에서 빠진다)
        textElement.isAccessibilityElement = true
        textElement.accessibilityLabel = [title, description].compactMap { $0 }.joined(
            separator: ", ")

        let chipContainer = UIView()
        chipContainer.addSubview(iconChip)

        bodyStack.axis = .vertical
        bodyStack.alignment = .fill
        bodyStack.spacing = JdToken.Space.s4
        bodyStack.addArrangedSubview(chipContainer)
        bodyStack.addArrangedSubview(textElement)

        if let actionLabel, let onAction {
            let button = JdEmptyStateView.makeActionButton(actionLabel) { onAction() }
            actionButton = button
            let actionContainer = UIView()
            actionContainer.addSubview(button)
            button.jd.layout {
                $0.top.equalToSuperview()
                $0.bottom.equalToSuperview()
                $0.centerX.equalToSuperview()
                $0.leading.greaterThanOrEqualToSuperview()
            }
            bodyStack.addArrangedSubview(actionContainer)
        }

        addSubview(bodyStack)

        iconChip.jd.layout {
            $0.size.equal(CGSize(width: chipDiameter, height: chipDiameter))
            $0.centerX.equalToSuperview()
            $0.top.equalToSuperview()
            $0.bottom.equalToSuperview()
        }
        iconView.jd.layout {
            $0.center.equalToSuperview()
        }
        bodyStack.jd.layout {
            $0.top.equalToSuperview().inset(JdToken.Space.s6)
            $0.bottom.equalToSuperview().inset(JdToken.Space.s6)
            $0.leading.equalToSuperview().inset(JdToken.Space.s6)
            $0.trailing.equalToSuperview().inset(JdToken.Space.s6)
        }

        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        iconChip.layer.cornerRadius = chipDiameter / 2
        iconChip.layer.cornerCurve = .continuous
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // MARK: 내부

    private func applyStyle() {
        iconChip.backgroundColor = JdToken.Color.cardHover.uiColor
        iconView.tintColor = JdToken.Color.muted.uiColor
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(
            font: JdFontBridge.scaledFont(
                size: JdToken.FontSize.xl3,
                weight: JdToken.FontWeight.normal,
                compatibleWith: traitCollection))
        iconView.image = UIImage(systemName: systemImage)

        titleLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.lg,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        titleLabel.textColor = JdToken.Color.foreground.uiColor

        descriptionLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.md,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        descriptionLabel.textColor = JdToken.Color.muted.uiColor

        actionButton?.titleLabel?.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.md,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
    }

    private static func makeActionButton(
        _ title: String, onTap: @escaping () -> Void
    ) -> JdFeedbackActionButton {
        let button = JdFeedbackActionButton(type: .system)
        button.setTitle(title, for: .normal)
        button.tintColor = JdToken.Color.primary.uiColor
        button.titleLabel?.adjustsFontForContentSizeCategory = true
        button.accessibilityLabel = title
        button.onTapForward = onTap
        button.addTarget(
            button, action: #selector(JdFeedbackActionButton.jdHandleTap), for: .touchUpInside)
        return button
    }
}
