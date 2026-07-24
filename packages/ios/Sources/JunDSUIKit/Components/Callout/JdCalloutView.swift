import UIKit
import JunDSCore

// 웹 jd-callout의 UIKit 번역 — 문서 강조 블록 (DESIGN-4 §B). A8 명명 규칙 Jd<이름>View.
// 이모지·색은 Core JdCalloutVariant가 단일 소스. collapsible이면 헤더 탭으로 본문을 접는다
// (SwiftUI는 DisclosureGroup에 위임하나 UIKit엔 대응 컨테이너가 없어 자체 토글이 정본).
public final class JdCalloutView: UIView {

    private let variant: JdCalloutVariant
    private let isCollapsible: Bool

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let accentBar = UIView()
    let emojiLabel = UILabel()
    let titleLabel = UILabel()
    let contentContainer = UIView()
    private(set) var headerButton: JdFeedbackActionButton?
    private(set) var isExpanded: Bool

    private let messageLabel = UILabel()
    private let chevronView = UIImageView()
    private let headerRow = UIStackView()
    private let bodyStack = UIStackView()

    public init(_ title: String,
                message: String? = nil,
                variant: JdCalloutVariant = .note,
                isCollapsible: Bool = false,
                initiallyExpanded: Bool = true) {
        self.variant = variant
        self.isCollapsible = isCollapsible
        self.isExpanded = isCollapsible ? initiallyExpanded : true
        super.init(frame: .zero)

        accentBar.isUserInteractionEnabled = false

        emojiLabel.adjustsFontForContentSizeCategory = true
        emojiLabel.text = variant.emoji
        emojiLabel.isAccessibilityElement = false // 이모지는 장식 — 제목이 표면
        emojiLabel.setContentHuggingPriority(.required, for: .horizontal)

        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.numberOfLines = 0
        titleLabel.text = title

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        spacer.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        headerRow.axis = .horizontal
        headerRow.alignment = .center
        headerRow.spacing = JdToken.Space.s2
        headerRow.addArrangedSubview(emojiLabel)
        headerRow.addArrangedSubview(titleLabel)
        if isCollapsible {
            headerRow.addArrangedSubview(spacer)
            chevronView.contentMode = .center
            chevronView.setContentHuggingPriority(.required, for: .horizontal)
            headerRow.addArrangedSubview(chevronView)
        }

        messageLabel.adjustsFontForContentSizeCategory = true
        messageLabel.numberOfLines = 0
        messageLabel.text = message
        contentContainer.addSubview(messageLabel)
        contentContainer.isHidden = !isExpanded
        messageLabel.jd.layout {
            $0.edges.equalToSuperview()
        }

        bodyStack.axis = .vertical
        bodyStack.spacing = JdToken.Space.s2
        bodyStack.addArrangedSubview(headerRow)
        bodyStack.addArrangedSubview(contentContainer)

        addSubview(accentBar)
        addSubview(bodyStack)

        accentBar.jd.layout {
            $0.leading.equalToSuperview()
            $0.top.equalToSuperview()
            $0.bottom.equalToSuperview()
            $0.width.equal(JdToken.Border.thick) // 3pt 강조선
        }
        bodyStack.jd.layout {
            $0.leading.equal(to: accentBar.jd.trailing, offset: JdToken.Space.s4)
            $0.top.equalToSuperview().inset(JdToken.Space.s4)
            $0.bottom.equalToSuperview().inset(JdToken.Space.s4)
            $0.trailing.equalToSuperview().inset(JdToken.Space.s4)
        }

        if isCollapsible {
            // 헤더 위에 투명 버튼을 덮어 탭을 받는다 — 라벨은 버튼이 대표하고 이모지/제목은 트리에서 뺀다
            let button = JdFeedbackActionButton(type: .system)
            button.accessibilityLabel = title
            button.onTapForward = { [weak self] in self?.toggleExpansion() }
            button.addTarget(button, action: #selector(JdFeedbackActionButton.jdHandleTap), for: .touchUpInside)
            addSubview(button)
            button.jd.layout {
                $0.top.equal(to: headerRow.jd.top)
                $0.bottom.equal(to: headerRow.jd.bottom)
                $0.leading.equal(to: headerRow.jd.leading)
                $0.trailing.equal(to: headerRow.jd.trailing)
            }
            headerButton = button
            titleLabel.isAccessibilityElement = false
        }

        layer.cornerCurve = .continuous
        layer.cornerRadius = JdToken.Radius.lg

        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyStyle()
    }

    // 테스트/소비자 진입 — 헤더 탭과 동일 경로
    func toggleExpansion() {
        guard isCollapsible else { return }
        isExpanded.toggle()
        applyChevron()
        UIView.animate(withDuration: JdMotion.duration(JdToken.Duration.fast)) {
            self.contentContainer.isHidden = !self.isExpanded
            self.layoutIfNeeded()
        }
    }

    // MARK: 내부

    private func applyStyle() {
        accentBar.backgroundColor = variant.color.uiColor
        backgroundColor = JdFeedbackTint.tint(variant.color)

        emojiLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                  weight: JdToken.FontWeight.normal,
                                                  compatibleWith: traitCollection)
        titleLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                  weight: JdToken.FontWeight.semibold,
                                                  compatibleWith: traitCollection)
        titleLabel.textColor = JdToken.Color.foreground.uiColor

        messageLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                    weight: JdToken.FontWeight.normal,
                                                    compatibleWith: traitCollection)
        messageLabel.textColor = JdToken.Color.foreground.uiColor

        chevronView.tintColor = JdToken.Color.muted.uiColor
        applyChevron()
    }

    private func applyChevron() {
        guard isCollapsible else { return }
        let config = UIImage.SymbolConfiguration(font: JdFontBridge.scaledFont(size: JdToken.FontSize.sm,
                                                                               weight: JdToken.FontWeight.medium,
                                                                               compatibleWith: traitCollection))
        chevronView.preferredSymbolConfiguration = config
        chevronView.image = UIImage(systemName: isExpanded ? "chevron.down" : "chevron.right")
    }
}
