import UIKit
import JunDSCore

// 웹 jd-snackbar의 UIKit 번역 (DESIGN-4 §C) — 스택이 아닌 단일 바. 위치 4종.
// present(in:)으로 컨테이너 세이프에어리어의 위치별 코너에 정렬하고, 자동 닫힘을 건다.
// 배경: 웹 기본(default)=surface-overlay, 시맨틱 variant만 색. Core엔 중립 케이스가 없어
// .info를 그 중립 자리로 접는다(SwiftUI JdSnackbar와 동형 규칙, notes 보고분). 흰 글자.
public final class JdSnackbarView: UIView {

    public var message: String {
        didSet { applyContent() }
    }
    public var variant: JdFeedbackVariant {
        didSet { applyStyle() }
    }
    /// 정렬 위치 — present 중 바뀌면 재배치한다
    public var position: JdToastPosition {
        didSet {
            guard position != oldValue, let container = superview else { return }
            installPositionConstraints(in: container)
        }
    }
    public var duration: TimeInterval
    public var actionLabel: String? {
        didSet { applyContent() }
    }
    public var onAction: (() -> Void)?
    /// 자동/수동 닫힘 후 컨테이너에서 제거됐음을 알린다(소비자 상태 동기화용)
    public var onDismiss: (() -> Void)?

    private let contentStack: JdStackView
    private let messageLabel = UILabel()
    private let actionButton = UIButton(type: .system)
    private var dismissTask: Task<Void, Never>?
    private var isShowing = false
    private var isPausedInteractively = false

    // 자동 닫힘 시계 — 테스트가 주입해 결정성을 확보한다(@testable 가시 internal)
    var autoDismissSleep: (TimeInterval) async -> Void = { seconds in
        try? await Task.sleep(nanoseconds: UInt64((seconds * 1_000_000_000).rounded()))
    }

    public init(message: String,
                variant: JdFeedbackVariant = .info,
                position: JdToastPosition = .bottom,
                duration: TimeInterval = 4,
                actionLabel: String? = nil,
                onAction: (() -> Void)? = nil) {
        self.message = message
        self.variant = variant
        self.position = position
        self.duration = duration
        self.actionLabel = actionLabel
        self.onAction = onAction
        self.contentStack = JdStackView(axis: .horizontal, gap: .md, alignment: .center)
        super.init(frame: .zero)

        messageLabel.numberOfLines = 0
        messageLabel.adjustsFontForContentSizeCategory = true
        messageLabel.textColor = .white // 웹 color:#fff — 전용 토큰 없음(notes 보고분)
        messageLabel.setContentHuggingPriority(.defaultLow, for: .horizontal)
        messageLabel.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        actionButton.setTitleColor(.white, for: .normal)
        actionButton.adjustsImageSizeForAccessibilityContentSizeCategory = false
        actionButton.titleLabel?.adjustsFontForContentSizeCategory = true
        actionButton.setContentHuggingPriority(.required, for: .horizontal)
        actionButton.setContentCompressionResistancePriority(.required, for: .horizontal)
        actionButton.addTarget(self, action: #selector(didTapAction), for: .touchUpInside)

        contentStack.addArrangedSubview(messageLabel)
        addSubview(contentStack)
        contentStack.jd.layout {
            $0.top.equalToSuperview().inset(JdGap.sm.value)
            $0.bottom.equalToSuperview().inset(JdGap.sm.value)
            $0.leading.equalToSuperview().inset(JdGap.md.value)
            $0.trailing.equalToSuperview().inset(JdGap.md.value)
        }

        layer.cornerRadius = JdToken.Radius.lg
        layer.cornerCurve = .continuous
        isAccessibilityElement = false

        installInteractionPause()
        applyContent()
        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // MARK: - 표시/닫기

    /// 컨테이너에 얹고 위치별 정렬 + 자동 닫힘을 건다.
    public func present(in container: UIView) {
        if superview !== container {
            container.addSubview(self)
        }
        installPositionConstraints(in: container)
        isShowing = true
        // 화면 변화 없이 뜬 상태 알림 — danger만 assertive(Core 판정 승계)
        JdAnnouncer.announce(message, priority: variant.announcePriority)
        scheduleAutoDismissIfNeeded()
    }

    /// 수동/자동 공통 닫기 — 타이머 취소 후 컨테이너에서 제거.
    public func dismiss() {
        dismissTask?.cancel()
        dismissTask = nil
        isShowing = false
        removeFromSuperview()
        onDismiss?()
    }

    /// hover/focus/드래그 정지(WCAG 2.2.1) — 정지 시 타이머를 멈추고, 해제 시 처음부터 재예약.
    public func setPaused(_ paused: Bool) {
        guard paused != isPausedInteractively else { return }
        isPausedInteractively = paused
        if paused {
            dismissTask?.cancel()
            dismissTask = nil
        } else {
            scheduleAutoDismissIfNeeded()
        }
    }

    // MARK: - 테스트 표면 (04 §8.2)

    enum VerticalEdge: Equatable { case top, bottom }
    enum HorizontalPlacement: Equatable { case leading, trailing, center }

    var verticalEdge: VerticalEdge { position.isTop ? .top : .bottom }
    var horizontalPlacement: HorizontalPlacement {
        if position.isCentered { return .center }
        return position.isLeading ? .leading : .trailing
    }
    var hasPendingAutoDismiss: Bool { dismissTask != nil }
    var isPausedForTests: Bool { isPausedInteractively }
    var isShowingForTests: Bool { isShowing }

    // MARK: - 자동 닫힘

    private func scheduleAutoDismissIfNeeded() {
        guard isShowing, duration > 0, !isPausedInteractively else { return }
        dismissTask?.cancel()
        dismissTask = Task { @MainActor [weak self] in
            guard let sleep = self?.autoDismissSleep else { return }
            await sleep(self?.duration ?? 0)
            guard !Task.isCancelled, let self else { return }
            self.dismiss()
        }
    }

    // MARK: - 레이아웃

    private func installPositionConstraints(in container: UIView) {
        let pad = JdGap.md.value
        // 스낵바 폭 상한 — 전용 토큰이 없어 오버레이 lg 폭(560)을 재사용(notes 보고분)
        let cap = JdOverlaySize.lg.drawerWidth
        jd.remake {
            if position.isTop {
                $0.top.equal(to: container.jd.safeArea.top, offset: pad)
            } else {
                $0.bottom.equal(to: container.jd.safeArea.bottom, offset: -pad)
            }
            $0.width.lessThanOrEqual(cap)
            $0.width.equal(cap).priority(UILayoutPriority.defaultHigh)
            if position.isCentered {
                $0.centerX.equal(to: container.jd.safeArea.centerX)
                $0.leading.greaterThanOrEqual(to: container.jd.safeArea.leading, offset: pad)
                $0.trailing.lessThanOrEqual(to: container.jd.safeArea.trailing, offset: -pad)
            } else if position.isLeading {
                $0.leading.equal(to: container.jd.safeArea.leading, offset: pad)
                $0.trailing.lessThanOrEqual(to: container.jd.safeArea.trailing, offset: -pad)
            } else {
                $0.trailing.equal(to: container.jd.safeArea.trailing, offset: -pad)
                $0.leading.greaterThanOrEqual(to: container.jd.safeArea.leading, offset: pad)
            }
        }
    }

    private func installInteractionPause() {
        let press = UILongPressGestureRecognizer(target: self, action: #selector(handlePress(_:)))
        press.minimumPressDuration = 0
        press.cancelsTouchesInView = false
        press.delaysTouchesBegan = false
        press.delaysTouchesEnded = false
        addGestureRecognizer(press)

        let hover = UIHoverGestureRecognizer(target: self, action: #selector(handleHover(_:)))
        addGestureRecognizer(hover)
    }

    @objc private func handlePress(_ gesture: UILongPressGestureRecognizer) {
        switch gesture.state {
        case .began, .changed: setPaused(true)
        case .ended, .cancelled, .failed: setPaused(false)
        default: break
        }
    }

    @objc private func handleHover(_ gesture: UIHoverGestureRecognizer) {
        switch gesture.state {
        case .began, .changed: setPaused(true)
        case .ended, .cancelled, .failed: setPaused(false)
        default: break
        }
    }

    // MARK: - 내용·스타일

    private func applyContent() {
        messageLabel.text = message
        if let actionLabel, !actionLabel.isEmpty {
            actionButton.setTitle(actionLabel, for: .normal)
            if actionButton.superview == nil {
                contentStack.addArrangedSubview(actionButton)
            }
        } else {
            actionButton.removeFromSuperview()
        }
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트는 수동 재적용
        applyStyle()
    }

    private func applyStyle() {
        messageLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                    weight: JdToken.FontWeight.medium,
                                                    compatibleWith: traitCollection)
        actionButton.titleLabel?.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                                weight: JdToken.FontWeight.semibold,
                                                                compatibleWith: traitCollection)
        backgroundColor = backgroundColorToken.uiColor
    }

    // 웹 default(=.info 중립)=surfaceOverlay, success/warning/danger=variant.color
    private var backgroundColorToken: JdDynamicColor {
        switch variant {
        case .info: return JdToken.Color.surfaceOverlay
        case .success, .warning, .danger: return variant.color
        }
    }

    @objc private func didTapAction() {
        onAction?()
        dismiss()
    }
}
