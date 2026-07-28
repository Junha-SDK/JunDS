import JunDSCore
import UIKit

// 웹 jd-alert의 UIKit 번역 — 좌측 강조선 + 5% 틴트의 인라인 피드백 (DESIGN-4 §B).
// A8 명명 규칙 Jd<이름>View. UIView 서브클래스(컨트롤 아님) — 닫기 버튼만 내부 UIControl.
// role은 danger/warning만 라이브 리전으로 낭독한다(웹 판정 승계, Core announcePriority가 단일 소스).
public final class JdAlertView: UIView {

    private let title: String
    private let variant: JdFeedbackVariant
    private let onDismiss: (() -> Void)?

    // 테스트 표면 (@testable) — 공개 API는 아니다 (04 §8.2)
    let accentBar = UIView()
    let titleLabel = UILabel()
    private let messageLabel = UILabel()
    private let textStack = UIStackView()
    private let bodyStack = UIStackView()
    private var dismissButton: UIButton?
    private var didAnnounce = false

    public init(
        _ title: String,
        message: String? = nil,
        variant: JdFeedbackVariant = .info,
        isDismissible: Bool = false,
        onDismiss: (() -> Void)? = nil
    ) {
        self.title = title
        self.variant = variant
        self.onDismiss = onDismiss
        super.init(frame: .zero)

        accentBar.isUserInteractionEnabled = false

        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.numberOfLines = 0
        titleLabel.text = title
        // danger/warning는 정적 텍스트로 표식(라이브 리전 낭독은 didMoveToWindow)
        if isAssertiveRole {
            titleLabel.accessibilityTraits.insert(.staticText)
        }

        messageLabel.adjustsFontForContentSizeCategory = true
        messageLabel.numberOfLines = 0
        messageLabel.text = message
        messageLabel.isHidden = (message == nil)

        textStack.axis = .vertical
        textStack.spacing = JdToken.Space.s2
        textStack.addArrangedSubview(titleLabel)
        textStack.addArrangedSubview(messageLabel)

        bodyStack.axis = .horizontal
        bodyStack.alignment = .top
        bodyStack.spacing = JdToken.Space.s3
        bodyStack.addArrangedSubview(textStack)

        addSubview(accentBar)
        addSubview(bodyStack)

        // 자체 레이아웃 DSL 사용 (04 §5 — 내부 표준)
        accentBar.jd.layout {
            $0.leading.equalToSuperview()
            $0.top.equalToSuperview()
            $0.bottom.equalToSuperview()
            $0.width.equal(JdToken.Border.thick)  // 3pt 강조선
        }
        bodyStack.jd.layout {
            $0.leading.equal(to: accentBar.jd.trailing, offset: JdToken.Space.s4)
            $0.top.equalToSuperview().inset(JdToken.Space.s4)
            $0.bottom.equalToSuperview().inset(JdToken.Space.s4)
            $0.trailing.equalToSuperview().inset(JdToken.Space.s4)
        }

        if isDismissible {
            let button = JdFeedbackDismissButton.make { [weak self] in self?.onDismiss?() }
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

    private var isAssertiveRole: Bool {
        variant == .danger || variant == .warning
    }

    public override func didMoveToWindow() {
        super.didMoveToWindow()
        // 시각 신호만으로는 AT에 닿지 않는다 — danger/warning만 라이브 리전으로 1회 낭독 (04 §7.1)
        guard window != nil, isAssertiveRole, !didAnnounce else { return }
        didAnnounce = true
        JdAnnouncer.announce(title, priority: variant.announcePriority)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트/심볼은 수동 재적용
        applyStyle()
    }

    // MARK: 내부

    private func applyStyle() {
        accentBar.backgroundColor = variant.color.uiColor
        backgroundColor = JdFeedbackTint.tint(variant.color)

        titleLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.lg,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
        titleLabel.textColor = JdToken.Color.foreground.uiColor

        messageLabel.font = JdFontBridge.scaledFont(
            size: JdToken.FontSize.md,
            weight: JdToken.FontWeight.normal,
            compatibleWith: traitCollection)
        messageLabel.textColor = JdToken.Color.muted.uiColor

        dismissButton?.setPreferredSymbolConfiguration(
            JdFeedbackDismissButton.symbolConfig(compatibleWith: traitCollection),
            forImageIn: .normal)
    }
}

// MARK: - 피드백 공용 UIKit 헬퍼 (같은 타겟 내 공유 — DEC-010은 타겟 간 의존만 금지)

/// variant.color 위 5% 틴트 배경 — 다이나믹 프로바이더 안에서 트레이트별로 풀어 라이트/다크를 함께 지킨다.
enum JdFeedbackTint {
    static func tint(_ color: JdDynamicColor) -> UIColor {
        UIColor { trait in
            color.uiColor.resolvedColor(with: trait).withAlphaComponent(CGFloat(JdToken.Opacity.o5))
        }
    }
}

/// 닫기/액션 버튼 — 클로저를 target-action으로 잇는다.
/// UIAction 대신 실제 셀렉터를 등록해야 앱 호스트 없는 xctest에서 `jdSendActions(for:)`로 발화 검증이 된다.
final class JdFeedbackActionButton: UIButton {
    var onTapForward: (() -> Void)?
    @objc func jdHandleTap() { onTapForward?() }
}

enum JdFeedbackDismissButton {
    static func symbolConfig(
        compatibleWith traits: UITraitCollection?
    ) -> UIImage.SymbolConfiguration {
        UIImage.SymbolConfiguration(
            font: JdFontBridge.scaledFont(
                size: JdToken.FontSize.sm,
                weight: JdToken.FontWeight.medium,
                compatibleWith: traits))
    }

    static func make(
        tint: UIColor = JdToken.Color.muted.uiColor,
        onTap: @escaping () -> Void
    ) -> JdFeedbackActionButton {
        let button = JdFeedbackActionButton(type: .system)
        button.setImage(UIImage(systemName: "xmark"), for: .normal)
        button.tintColor = tint
        button.accessibilityLabel = "닫기"
        button.setContentHuggingPriority(.required, for: .horizontal)
        button.setContentCompressionResistancePriority(.required, for: .horizontal)
        button.onTapForward = onTap
        button.addTarget(
            button, action: #selector(JdFeedbackActionButton.jdHandleTap), for: .touchUpInside)
        return button
    }
}
