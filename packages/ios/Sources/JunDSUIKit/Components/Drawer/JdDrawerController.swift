import JunDSCore
import UIKit

// 웹 jd-drawer의 iOS 번역 (04 §10.1):
//  • bottom → UISheetPresentationController detent(sheetHeight 기반).
//  • left/right → iOS 관용이 약해 커스텀 전환(딤 + 가장자리 슬라이드, JdMotion.duration).
// title 있으면 헤더 행(제목 + 닫기 버튼, JdIconButtonView 재사용).
// persistent → 인터랙티브 닫기 차단. cancelable veto는 onDismissAttempt.
public final class JdDrawerController: UIViewController,
    UIAdaptivePresentationControllerDelegate,
    UIViewControllerTransitioningDelegate
{

    public let contentView = UIView()

    private let side: JdDrawerSide
    private let size: JdOverlaySize
    private let drawerTitle: String?  // UIViewController.title 충돌 회피(선례: zoneDescription)

    public var persistent: Bool {
        didSet {
            isModalInPresentation = persistent
            sheetPresentationController?.prefersGrabberVisible = !persistent
        }
    }

    public var onDismissAttempt: ((JdDismissReason) -> Bool)?
    public var onClose: (() -> Void)?

    // 테스트 표면 (@testable)
    private let rootStack = UIStackView()
    private(set) var titleLabel: UILabel?
    private(set) var closeButton: JdIconButtonView?

    public init(
        side: JdDrawerSide = .right,
        size: JdOverlaySize = .md,
        title: String? = nil,
        persistent: Bool = false
    ) {
        self.side = side
        self.size = size
        self.drawerTitle = title
        self.persistent = persistent
        super.init(nibName: nil, bundle: nil)
        switch side {
        case .bottom:
            modalPresentationStyle = .pageSheet
        case .left, .right:
            // 커스텀 전환 — 딤 + 슬라이드를 직접 소유 (시스템 시트가 없는 축)
            modalPresentationStyle = .custom
            transitioningDelegate = self
        }
        isModalInPresentation = persistent
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = JdToken.Color.card.uiColor

        rootStack.axis = .vertical
        rootStack.spacing = JdToken.Space.s4
        view.addSubview(rootStack)
        rootStack.jd.layout {
            $0.top.equal(to: view.jd.safeArea.top, offset: JdToken.Space.s4)
            $0.leading.equal(to: view.jd.safeArea.leading, offset: JdToken.Space.s5)
            $0.trailing.equal(to: view.jd.safeArea.trailing, offset: -JdToken.Space.s5)
            $0.bottom.lessThanOrEqual(to: view.jd.safeArea.bottom, offset: -JdToken.Space.s5)
        }

        if let drawerTitle {
            rootStack.addArrangedSubview(makeHeader(drawerTitle))
        }
        rootStack.addArrangedSubview(contentView)

        configureSheetIfNeeded()
    }

    public override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        UIAccessibility.post(notification: .screenChanged, argument: contentView)
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        // 스케일 폰트는 트레이트 변화에 수동 재적용 (04 §6)
        titleLabel?.font = headerFont
    }

    public func present(from presenter: UIViewController, animated: Bool = true) {
        if side == .bottom {
            presentationController?.delegate = self
        }
        presenter.present(self, animated: animated)
    }

    // 명시적 닫기(헤더 버튼/메서드) — persistent와 무관, 게이트만 통과하면 닫힌다
    public func requestClose(_ reason: JdDismissReason = .close) {
        // 인터랙티브 사유(백드롭/스와이프)는 persistent면 차단, 명시적 close는 허용
        if reason != .close && persistent { return }
        if let handler = onDismissAttempt, handler(reason) == false { return }
        dismiss(animated: true) { [weak self] in self?.onClose?() }
    }

    // MARK: 헤더

    private var headerFont: UIFont {
        JdFontBridge.scaledFont(
            size: JdToken.FontSize.lg,
            weight: JdToken.FontWeight.semibold,
            compatibleWith: traitCollection)
    }

    private func makeHeader(_ text: String) -> UIView {
        let row = UIStackView()
        row.axis = .horizontal
        row.alignment = .center
        row.spacing = JdToken.Space.s3
        row.distribution = .fill

        let label = UILabel()
        label.text = text
        label.numberOfLines = 1
        label.adjustsFontForContentSizeCategory = true
        label.font = headerFont
        label.textColor = JdToken.Color.foreground.uiColor
        label.setContentHuggingPriority(.defaultLow, for: .horizontal)
        label.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let close = JdIconButtonView(
            systemImage: "xmark",
            accessibilityLabel: "닫기",
            variant: .ghost,
            size: .md)
        close.setContentHuggingPriority(.required, for: .horizontal)
        close.setContentCompressionResistancePriority(.required, for: .horizontal)
        close.onTap = { [weak self] in self?.requestClose(.close) }

        row.addArrangedSubview(label)
        row.addArrangedSubview(close)

        self.titleLabel = label
        self.closeButton = close
        return row
    }

    // MARK: bottom 시트 detent

    private func configureSheetIfNeeded() {
        guard side == .bottom, let sheet = sheetPresentationController else { return }
        if size == .full {
            sheet.detents = [.large()]
        } else {
            // height만 캡처 — self 캡처 시 sheet→detent→self 순환 참조
            let height = size.sheetHeight
            sheet.detents = [.custom { _ in height }]
        }
        sheet.prefersGrabberVisible = !persistent
    }

    // MARK: UIAdaptivePresentationControllerDelegate (bottom 시트 스와이프)

    public func presentationControllerShouldDismiss(
        _ presentationController: UIPresentationController
    ) -> Bool {
        if persistent { return false }
        if let handler = onDismissAttempt { return handler(.backdrop) }
        return true
    }

    public func presentationControllerDidDismiss(_ presentationController: UIPresentationController)
    {
        onClose?()
    }

    // MARK: UIViewControllerTransitioningDelegate (left/right 커스텀)

    public func presentationController(
        forPresented presented: UIViewController,
        presenting: UIViewController?,
        source: UIViewController
    ) -> UIPresentationController? {
        JdDrawerPresentationController(
            presentedViewController: presented,
            presenting: presenting,
            side: side,
            size: size,
            onBackdropTap: { [weak self] in self?.requestClose(.backdrop) })
    }

    public func animationController(
        forPresented presented: UIViewController,
        presenting: UIViewController,
        source: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        JdDrawerSlideAnimator(side: side, isPresenting: true)
    }

    public func animationController(
        forDismissed dismissed: UIViewController
    ) -> UIViewControllerAnimatedTransitioning? {
        JdDrawerSlideAnimator(side: side, isPresenting: false)
    }
}

// MARK: - 커스텀 프레젠테이션(딤 + 패널 프레임)

final class JdDrawerPresentationController: UIPresentationController {

    private let side: JdDrawerSide
    private let size: JdOverlaySize
    private let onBackdropTap: () -> Void
    private let dimmingView = UIView()

    init(
        presentedViewController: UIViewController,
        presenting presentingViewController: UIViewController?,
        side: JdDrawerSide,
        size: JdOverlaySize,
        onBackdropTap: @escaping () -> Void
    ) {
        self.side = side
        self.size = size
        self.onBackdropTap = onBackdropTap
        super.init(
            presentedViewController: presentedViewController,
            presenting: presentingViewController)
    }

    override var frameOfPresentedViewInContainerView: CGRect {
        guard let container = containerView else { return .zero }
        let bounds = container.bounds
        let width = size == .full ? bounds.width : min(size.drawerWidth, bounds.width)
        switch side {
        case .left:
            return CGRect(x: 0, y: 0, width: width, height: bounds.height)
        case .right:
            return CGRect(x: bounds.width - width, y: 0, width: width, height: bounds.height)
        case .bottom:
            return bounds  // 커스텀 경로 미사용(bottom은 시트)
        }
    }

    override func presentationTransitionWillBegin() {
        guard let container = containerView else { return }
        dimmingView.frame = container.bounds
        dimmingView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        // 딤 스크림: 웹 rgba(0,0,0,.3) 승계. 전용 색 토큰이 없어 black + Opacity.o30.
        dimmingView.backgroundColor = UIColor.black.withAlphaComponent(JdToken.Opacity.o30)
        dimmingView.alpha = 0
        dimmingView.isAccessibilityElement = false
        let tap = UITapGestureRecognizer(target: self, action: #selector(didTapDim))
        dimmingView.addGestureRecognizer(tap)
        container.insertSubview(dimmingView, at: 0)

        if let coordinator = presentedViewController.transitionCoordinator {
            coordinator.animate(alongsideTransition: { _ in self.dimmingView.alpha = 1 })
        } else {
            dimmingView.alpha = 1
        }
    }

    override func dismissalTransitionWillBegin() {
        if let coordinator = presentedViewController.transitionCoordinator {
            coordinator.animate(alongsideTransition: { _ in self.dimmingView.alpha = 0 })
        } else {
            dimmingView.alpha = 0
        }
    }

    override func containerViewWillLayoutSubviews() {
        super.containerViewWillLayoutSubviews()
        presentedView?.frame = frameOfPresentedViewInContainerView
        dimmingView.frame = containerView?.bounds ?? .zero
    }

    @objc private func didTapDim() {
        onBackdropTap()
    }
}

// MARK: - 커스텀 슬라이드 애니메이터(가장자리 진입/퇴장)

final class JdDrawerSlideAnimator: NSObject, UIViewControllerAnimatedTransitioning {

    private let side: JdDrawerSide
    private let isPresenting: Bool

    init(side: JdDrawerSide, isPresenting: Bool) {
        self.side = side
        self.isPresenting = isPresenting
    }

    func transitionDuration(
        using transitionContext: UIViewControllerContextTransitioning?
    ) -> TimeInterval {
        JdMotion.duration(JdToken.Duration.normal)
    }

    func animateTransition(using ctx: UIViewControllerContextTransitioning) {
        let container = ctx.containerView
        let duration = transitionDuration(using: ctx)

        if isPresenting {
            guard let toVC = ctx.viewController(forKey: .to),
                let toView = ctx.view(forKey: .to)
            else {
                ctx.completeTransition(false)
                return
            }
            let finalFrame = ctx.finalFrame(for: toVC)
            toView.frame = finalFrame.offsetBy(
                dx: offscreenDX(for: finalFrame, container: container), dy: 0)
            container.addSubview(toView)
            let settle = { toView.frame = finalFrame }
            run(settle, duration: duration, ctx: ctx)
        } else {
            guard let fromView = ctx.view(forKey: .from) else {
                ctx.completeTransition(false)
                return
            }
            let startFrame = fromView.frame
            let slideOut = {
                fromView.frame = startFrame.offsetBy(
                    dx: self.offscreenDX(for: startFrame, container: container), dy: 0)
            }
            run(slideOut, duration: duration, ctx: ctx)
        }
    }

    private func run(
        _ animations: @escaping () -> Void,
        duration: TimeInterval,
        ctx: UIViewControllerContextTransitioning
    ) {
        guard duration > 0 else {
            animations()
            ctx.completeTransition(!ctx.transitionWasCancelled)
            return
        }
        UIView.animate(
            withDuration: duration, delay: 0, options: .curveEaseOut,
            animations: animations
        ) { _ in
            ctx.completeTransition(!ctx.transitionWasCancelled)
        }
    }

    // 화면 밖으로 완전히 빼는 수평 오프셋(진입 시작/퇴장 끝 위치)
    private func offscreenDX(for frame: CGRect, container: UIView) -> CGFloat {
        switch side {
        case .left:
            return -frame.maxX
        case .right:
            return container.bounds.width - frame.minX
        case .bottom:
            return 0
        }
    }
}
