import JunDSCore
import UIKit

// 웹 jd-result의 UIKit 번역 — EmptyState 파생, 결과 화면 (DESIGN-4 §B). A8 명명 규칙 Jd<이름>View.
// status별 심볼·색은 Core JdResultStatus가 단일 소스. 웹의 정보 없는 일러스트 대신 64pt 시맨틱
// 심볼로 상태를 크게 알린다(장식 제거 판단 승계).
public final class JdResultView: UIView {

    private let status: JdResultStatus
    private let onAction: (() -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let textElement = UIStackView()  // 제목·설명을 합친 단일 접근성 요소
    let iconView = UIImageView()
    var symbolName: String { status.systemImage }  // Core 심볼 매핑을 그대로 노출
    private(set) var actionButton: JdFeedbackActionButton?

    private let titleLabel = UILabel()
    private let descriptionLabel = UILabel()
    private let bodyStack = UIStackView()

    // 대형 심볼 크기 — 웹 고정 px의 토큰 번역(하드코딩 금지)
    private let symbolSize = JdToken.Space.s16

    public init(
        status: JdResultStatus,
        title: String,
        description: String? = nil,
        actionLabel: String? = nil,
        onAction: (() -> Void)? = nil
    ) {
        self.status = status
        self.onAction = onAction
        super.init(frame: .zero)

        iconView.contentMode = .center
        iconView.isAccessibilityElement = false  // 상태는 제목/설명이 말한다 — 심볼은 장식
        iconView.setContentHuggingPriority(.required, for: .vertical)

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
        textElement.isAccessibilityElement = true
        textElement.accessibilityLabel = [title, description].compactMap { $0 }.joined(
            separator: ", ")

        let iconContainer = UIView()
        iconContainer.addSubview(iconView)

        bodyStack.axis = .vertical
        bodyStack.alignment = .fill
        bodyStack.spacing = JdToken.Space.s4
        bodyStack.addArrangedSubview(iconContainer)
        bodyStack.addArrangedSubview(textElement)

        if let actionLabel, let onAction {
            let button = JdResultView.makeActionButton(actionLabel) { onAction() }
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

        iconView.jd.layout {
            $0.centerX.equalToSuperview()
            $0.top.equalToSuperview()
            $0.bottom.equalToSuperview()
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

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // MARK: 내부

    private func applyStyle() {
        iconView.tintColor = status.color.uiColor
        iconView.preferredSymbolConfiguration = UIImage.SymbolConfiguration(
            font: JdFontBridge.scaledFont(
                size: symbolSize,
                weight: JdToken.FontWeight.normal,
                compatibleWith: traitCollection))
        iconView.image = UIImage(systemName: status.systemImage)

        titleLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.xl,
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
