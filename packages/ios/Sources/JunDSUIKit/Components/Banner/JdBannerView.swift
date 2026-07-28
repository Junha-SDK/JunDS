import JunDSCore
import UIKit

// 웹 jd-banner의 UIKit 번역 — 폭 꽉 찬 알림 바 (DESIGN-4 §B). A8 명명 규칙 Jd<이름>View.
// 배경 = variant.color, 흰 글자. variant.color(info 등)는 밝아 흰 글자 대비가 약하므로
// resolvedColor 후 foreground 20%를 혼합해 눌러준다(대비 확보).
// ⚠️ Core에 온-액센트(흰) 전경 토큰이 없어 흰 글자는 시스템 상수 UIColor.white를 쓴다(notes 참조).
public final class JdBannerView: UIView {

    private let variant: JdFeedbackVariant
    private let onAction: (() -> Void)?
    private let onDismiss: (() -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let messageLabel = UILabel()
    private(set) var actionButton: JdFeedbackActionButton?
    private(set) var dismissButton: JdFeedbackActionButton?
    private let bodyStack = UIStackView()

    public init(
        _ message: String,
        variant: JdFeedbackVariant = .info,
        actionLabel: String? = nil,
        onAction: (() -> Void)? = nil,
        isDismissible: Bool = false,
        onDismiss: (() -> Void)? = nil
    ) {
        self.variant = variant
        self.onAction = onAction
        self.onDismiss = onDismiss
        super.init(frame: .zero)

        messageLabel.adjustsFontForContentSizeCategory = true
        messageLabel.numberOfLines = 0
        messageLabel.text = message
        // 메시지가 남는 폭을 차지하고 버튼은 오른쪽으로 붙는다
        messageLabel.setContentHuggingPriority(.defaultLow, for: .horizontal)

        bodyStack.axis = .horizontal
        bodyStack.alignment = .center
        bodyStack.spacing = JdToken.Space.s3
        bodyStack.isLayoutMarginsRelativeArrangement = true
        bodyStack.directionalLayoutMargins = NSDirectionalEdgeInsets(
            top: JdToken.Space.s3, leading: JdToken.Space.s4,
            bottom: JdToken.Space.s3, trailing: JdToken.Space.s4)
        bodyStack.addArrangedSubview(messageLabel)
        addSubview(bodyStack)

        bodyStack.jd.layout {
            $0.edges.equalToSuperview()
        }

        if let actionLabel, let onAction {
            let button = JdBannerView.makeActionButton(actionLabel) { onAction() }
            actionButton = button
            bodyStack.addArrangedSubview(button)
        }

        if isDismissible {
            let button = JdFeedbackDismissButton.make(tint: .white) { [weak self] in
                self?.onDismiss?()
            }
            dismissButton = button
            bodyStack.addArrangedSubview(button)
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

    // MARK: 내부

    private func applyStyle() {
        backgroundColor = JdBannerPalette.background(variant)

        messageLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.md,
            weight: JdToken.FontWeight.medium,
            compatibleWith: traitCollection)
        messageLabel.textColor = .white

        if let actionButton {
            actionButton.titleLabel?.font = JdFontBridge.scaledFont(
                size: JdToken.FontSize.md,
                weight: JdToken.FontWeight.semibold,
                compatibleWith: traitCollection)
        }
        dismissButton?.setPreferredSymbolConfiguration(
            JdFeedbackDismissButton.symbolConfig(compatibleWith: traitCollection),
            forImageIn: .normal)
    }

    private static func makeActionButton(
        _ title: String, onTap: @escaping () -> Void
    ) -> JdFeedbackActionButton {
        let button = JdFeedbackActionButton(type: .system)
        button.setTitle(title, for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.adjustsFontForContentSizeCategory = true
        button.accessibilityLabel = title
        button.setContentHuggingPriority(.required, for: .horizontal)
        button.setContentCompressionResistancePriority(.required, for: .horizontal)
        button.onTapForward = onTap
        button.addTarget(
            button, action: #selector(JdFeedbackActionButton.jdHandleTap), for: .touchUpInside)
        return button
    }
}

// resolvedColor 후 혼합 — SwiftUI 계층(JdBanner)에 동형 사본이 있다(DEC-010으로 공유 불가).
enum JdBannerPalette {
    static func background(_ variant: JdFeedbackVariant) -> UIColor {
        UIColor { trait in
            let base = variant.color.uiColor.resolvedColor(with: trait)
            let fg = JdToken.Color.foreground.uiColor.resolvedColor(with: trait)
            return mix(base, fg, ratio: CGFloat(JdToken.Opacity.o20))
        }
    }

    static func mix(_ base: UIColor, _ overlay: UIColor, ratio: CGFloat) -> UIColor {
        var r1: CGFloat = 0
        var g1: CGFloat = 0
        var b1: CGFloat = 0
        var a1: CGFloat = 0
        var r2: CGFloat = 0
        var g2: CGFloat = 0
        var b2: CGFloat = 0
        var a2: CGFloat = 0
        base.getRed(&r1, green: &g1, blue: &b1, alpha: &a1)
        overlay.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)
        let t = ratio
        return UIColor(
            red: r1 * (1 - t) + r2 * t,
            green: g1 * (1 - t) + g2 * t,
            blue: b1 * (1 - t) + b2 * t,
            alpha: a1 * (1 - t) + a2 * t)
    }
}
