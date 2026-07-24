import UIKit
import JunDSCore

// 웹 jd-toast 스택의 UIKit 호스트 (DESIGN-4 §C, §4.1 UIKit 브리지 패턴).
// SwiftUI JdToastCenter는 DEC-010(계층 상호 import 금지) 때문에 여기서 참조하지 못한다 —
// 그래서 이 뷰가 Core JdToastQueue를 직접 소유하고, "큐 변경 → 스택 재렌더"를 닫는
// 클로저 하나(onQueueChange)로 잇는다. 앱 루트/윈도우에 1회 얹어 corner에 정렬한다.
//
// 빈 공간은 터치를 통과시키고(point(inside:) 오버라이드) 카드만 상호작용한다.
public final class JdToastHostView: UIView {

    /// 정렬 위치 — 바뀌면 스택을 재배치·재정렬한다
    public var position: JdToastPosition {
        didSet {
            guard position != oldValue else { return }
            relayout()
        }
    }

    // Core 상태머신 — 테스트는 읽기만(내부 가시). 변이는 mutateQueue 경유.
    private(set) var queue: JdToastQueue

    private let stackView: JdStackView
    private var dismissTasks: [JdToast.ID: Task<Void, Never>] = [:]
    private var isPausedInteractively = false

    // 큐 변경 → 스택 재렌더. 명령형 큐를 렌더로 잇는 유일한 클로저(§4.1 브리지).
    private var onQueueChange: ((JdToastQueue) -> Void)?

    // 자동 닫힘 시계 — 테스트가 주입해 결정성을 확보한다(@testable 가시 internal)
    var autoDismissSleep: (TimeInterval) async -> Void = { seconds in
        try? await Task.sleep(nanoseconds: UInt64((seconds * 1_000_000_000).rounded()))
    }

    public init(position: JdToastPosition = .topRight, maxVisible: Int = 4) {
        self.position = position
        self.queue = JdToastQueue(maxVisible: maxVisible)
        self.stackView = JdStackView(axis: .vertical, gap: .sm, alignment: .fill)
        super.init(frame: .zero)

        addSubview(stackView)
        installStackConstraints()
        installInteractionPause()

        // §4.1: 큐가 바뀌면 이 클로저가 스택을 다시 그린다(구독형 재렌더)
        onQueueChange = { [weak self] _ in self?.renderStack() }
        renderStack()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    // 빈 공간은 통과 — 카드(스택 내 배치 뷰) 위에서만 터치를 받는다
    public override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        for card in stackView.arrangedSubviews where !card.isHidden {
            if card.convert(card.bounds, to: self).contains(point) { return true }
        }
        return false
    }

    // MARK: - 공개 API (웹 toast() 동형)

    /// 토스트를 큐에 넣고(초과분은 Core가 축출) 자동 닫힘 타이머를 관리한다.
    @discardableResult
    public func show(_ toast: JdToast) -> JdToast.ID {
        mutateQueue { $0.add(toast) }
        reconcileTasks()
        if toast.duration > 0 && !isPausedInteractively {
            scheduleAutoDismiss(toast.id, after: toast.duration)
        }
        announce(toast)
        return toast.id
    }

    public func dismiss(_ id: JdToast.ID) {
        dismissTasks[id]?.cancel()
        dismissTasks[id] = nil
        mutateQueue { $0.dismiss(id) }
    }

    public func clear() {
        for task in dismissTasks.values { task.cancel() }
        dismissTasks.removeAll()
        mutateQueue { $0.clear() }
    }

    /// hover/드래그 정지(WCAG 2.2.1) — 정지 시 대기 타이머를 멈추고, 해제 시 처음부터 재예약.
    public func setPaused(_ paused: Bool) {
        guard paused != isPausedInteractively else { return }
        isPausedInteractively = paused
        if paused {
            for task in dismissTasks.values { task.cancel() }
            dismissTasks.removeAll()
        } else {
            for toast in queue.visible where toast.duration > 0 {
                scheduleAutoDismiss(toast.id, after: toast.duration)
            }
        }
    }

    // MARK: - 테스트 표면 (04 §8.2)

    var visibleToasts: [JdToast] { queue.visible }
    func hasPendingAutoDismiss(_ id: JdToast.ID) -> Bool { dismissTasks[id] != nil }
    var isPausedForTests: Bool { isPausedInteractively }

    // MARK: - 큐 변이 → 재렌더

    private func mutateQueue(_ block: (inout JdToastQueue) -> Void) {
        block(&queue)
        onQueueChange?(queue)
    }

    private func renderStack() {
        // 재렌더(diff 아님) — 큐를 통째로 다시 그린다
        for card in stackView.arrangedSubviews {
            stackView.removeArrangedSubview(card)
            card.removeFromSuperview()
        }
        // 하단 정렬이면 최신 토스트가 가장자리(아래)에 오도록 뒤집는다
        let toasts = position.isTop ? queue.visible : Array(queue.visible.reversed())
        for toast in toasts {
            let card = JdToastCardView(toast: toast)
            let id = toast.id
            card.onClose = { [weak self] in self?.dismiss(id) }
            stackView.addArrangedSubview(card)
        }
    }

    // MARK: - 자동 닫힘

    private func scheduleAutoDismiss(_ id: JdToast.ID, after duration: TimeInterval) {
        dismissTasks[id]?.cancel()
        dismissTasks[id] = Task { @MainActor [weak self] in
            guard let sleep = self?.autoDismissSleep else { return }
            await sleep(duration)
            guard !Task.isCancelled, let self else { return }
            self.dismiss(id)
        }
    }

    private func reconcileTasks() {
        let liveIDs = Set(queue.visible.map { $0.id })
        for (id, task) in dismissTasks where !liveIDs.contains(id) {
            task.cancel()
            dismissTasks[id] = nil
        }
    }

    private func announce(_ toast: JdToast) {
        let message = [toast.title, toast.message]
            .compactMap { $0 }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        guard !message.isEmpty else { return }
        JdAnnouncer.announce(message, priority: toast.variant.announcePriority)
    }

    // MARK: - 레이아웃

    private func relayout() {
        installStackConstraints()
        renderStack()
    }

    private func installStackConstraints() {
        let pad = JdGap.md.value
        // 토스트 폭 상한 — 전용 토큰이 없어 오버레이 sm 폭(320)을 재사용(notes 보고분)
        let cap = JdOverlaySize.sm.drawerWidth
        stackView.jd.remake {
            // 세로 — 상단/하단 코너
            if position.isTop {
                $0.top.equal(to: self.jd.safeArea.top, offset: pad)
            } else {
                $0.bottom.equal(to: self.jd.safeArea.bottom, offset: -pad)
            }
            // 폭 상한(넓은 화면=320, 좁은 화면=세이프에어리어 안으로 축소)
            $0.width.lessThanOrEqual(cap)
            $0.width.equal(cap).priority(UILayoutPriority.defaultHigh)
            // 가로 — 위치별 정렬
            if position.isCentered {
                $0.centerX.equal(to: self.jd.safeArea.centerX)
                $0.leading.greaterThanOrEqual(to: self.jd.safeArea.leading, offset: pad)
                $0.trailing.lessThanOrEqual(to: self.jd.safeArea.trailing, offset: -pad)
            } else if position.isLeading {
                $0.leading.equal(to: self.jd.safeArea.leading, offset: pad)
                $0.trailing.lessThanOrEqual(to: self.jd.safeArea.trailing, offset: -pad)
            } else {
                $0.trailing.equal(to: self.jd.safeArea.trailing, offset: -pad)
                $0.leading.greaterThanOrEqual(to: self.jd.safeArea.leading, offset: pad)
            }
        }
    }

    private func installInteractionPause() {
        // 터치 유지(드래그)·포인터 hover 동안 자동 닫힘 정지(WCAG 2.2.1).
        // 카드 위에서만 터치가 전달되므로(point(inside:)) 제스처도 카드 상호작용에서만 발화한다.
        let press = UILongPressGestureRecognizer(target: self, action: #selector(handlePress(_:)))
        press.minimumPressDuration = 0
        press.cancelsTouchesInView = false
        press.delaysTouchesBegan = false
        press.delaysTouchesEnded = false
        press.delegate = nil
        addGestureRecognizer(press)

        let hover = UIHoverGestureRecognizer(target: self, action: #selector(handleHover(_:)))
        addGestureRecognizer(hover)
    }

    @objc private func handlePress(_ gesture: UILongPressGestureRecognizer) {
        switch gesture.state {
        case .began, .changed:
            setPaused(true)
        case .ended, .cancelled, .failed:
            setPaused(false)
        default:
            break
        }
    }

    @objc private func handleHover(_ gesture: UIHoverGestureRecognizer) {
        switch gesture.state {
        case .began, .changed:
            setPaused(true)
        case .ended, .cancelled, .failed:
            setPaused(false)
        default:
            break
        }
    }
}

// 개별 토스트 카드 — card 배경 + 좌측 variant 강조선 + 닫기 버튼 + shadow.
final class JdToastCardView: UIView {

    var onClose: (() -> Void)?

    private let accentBar = UIView()
    private let titleLabel = UILabel()
    private let messageLabel = UILabel()
    private let closeButton = UIButton(type: .system)
    private let textStack: JdStackView
    private let toast: JdToast

    init(toast: JdToast) {
        self.toast = toast
        self.textStack = JdStackView(axis: .vertical, gap: .xs, alignment: .fill)
        super.init(frame: .zero)

        accentBar.backgroundColor = toast.variant.color.uiColor
        accentBar.layer.cornerCurve = .continuous
        accentBar.isUserInteractionEnabled = false
        accentBar.isAccessibilityElement = false

        titleLabel.numberOfLines = 0
        titleLabel.adjustsFontForContentSizeCategory = true
        titleLabel.textColor = JdToken.Color.foreground.uiColor
        messageLabel.numberOfLines = 0
        messageLabel.adjustsFontForContentSizeCategory = true
        messageLabel.textColor = JdToken.Color.muted.uiColor

        if let title = toast.title, !title.isEmpty {
            titleLabel.text = title
            textStack.addArrangedSubview(titleLabel)
        }
        if let message = toast.message, !message.isEmpty {
            messageLabel.text = message
            textStack.addArrangedSubview(messageLabel)
        }

        closeButton.setImage(UIImage(systemName: "xmark"), for: .normal)
        closeButton.tintColor = JdToken.Color.muted.uiColor
        closeButton.accessibilityLabel = "닫기"
        closeButton.setContentHuggingPriority(.required, for: .horizontal)
        closeButton.setContentCompressionResistancePriority(.required, for: .horizontal)
        closeButton.addTarget(self, action: #selector(didTapClose), for: .touchUpInside)

        addSubview(accentBar)
        addSubview(textStack)
        addSubview(closeButton)

        let pad = JdGap.md.value
        let gap = JdGap.sm.value
        accentBar.jd.layout {
            $0.leading.equalToSuperview().inset(pad)
            $0.top.equalToSuperview().inset(pad)
            $0.bottom.equalToSuperview().inset(pad)
            $0.width.equal(JdToken.Border.thick)
        }
        textStack.jd.layout {
            $0.leading.equal(to: accentBar.jd.trailing, offset: gap)
            $0.top.equalToSuperview().inset(pad)
            $0.bottom.lessThanOrEqual(to: self.jd.bottom, offset: -pad)
        }
        closeButton.jd.layout {
            $0.leading.equal(to: textStack.jd.trailing, offset: gap)
            $0.trailing.equalToSuperview().inset(pad)
            $0.top.equalToSuperview().inset(pad)
        }

        layer.cornerRadius = JdToken.Radius.xl
        layer.cornerCurve = .continuous
        layer.borderWidth = JdToken.Border.thin
        isAccessibilityElement = false

        applyStyle()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 다이나믹 컬러는 자동 갱신되나 스케일 폰트·CGColor(border/shadow)는 수동 재적용
        applyStyle()
    }

    private func applyStyle() {
        titleLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.md,
                                                  weight: JdToken.FontWeight.semibold,
                                                  compatibleWith: traitCollection)
        messageLabel.font = JdFontBridge.scaledFont(size: JdToken.FontSize.sm,
                                                    weight: JdToken.FontWeight.normal,
                                                    compatibleWith: traitCollection)
        let iconFont = JdFontBridge.scaledFont(size: JdToken.FontSize.xs,
                                               weight: JdToken.FontWeight.semibold,
                                               compatibleWith: traitCollection)
        closeButton.setPreferredSymbolConfiguration(UIImage.SymbolConfiguration(font: iconFont),
                                                    forImageIn: .normal)
        backgroundColor = JdToken.Color.card.uiColor
        layer.borderColor = JdToken.Color.border.uiColor.resolvedColor(with: traitCollection).cgColor
        applyShadow()
    }

    // 웹 box-shadow: var(--jd-shadow-lg) — 알파는 토큰 색이 들고 있어 레이어 첫 장만 쓴다
    private func applyShadow() {
        guard let geometry = JdToken.Shadow.lg.light.first else {
            layer.shadowOpacity = 0
            return
        }
        let ink = JdDynamicColor(light: JdToken.Shadow.lg.light.first?.color ?? 0,
                                 dark: JdToken.Shadow.lg.dark.first?.color ?? 0)
        layer.shadowColor = ink.uiColor.resolvedColor(with: traitCollection).cgColor
        layer.shadowOpacity = 1
        layer.shadowOffset = CGSize(width: geometry.x, height: geometry.y)
        layer.shadowRadius = geometry.blur / 2 // CSS blur = 2 × 렌더 반경
    }

    @objc private func didTapClose() {
        onClose?()
    }
}
