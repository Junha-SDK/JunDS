import JunDSCore
import UIKit

// 웹 jd-bottom-sheet의 iOS 번역: UISheetPresentationController detent 위임 (04 §10.1).
// draggable=true(웹 Sheet 별칭의 실체)면 그래버 표시 + 인터랙티브 닫기 허용.
// persistent || !draggable → isModalInPresentation으로 인터랙티브 닫기 차단.
// onDismissAttempt(cancelable veto)는 UIAdaptivePresentationControllerDelegate 게이트.
public final class JdBottomSheetController: UIViewController,
    UIAdaptivePresentationControllerDelegate
{

    public let contentView = UIView()

    private let size: JdOverlaySize
    private let draggable: Bool

    public var persistent: Bool {
        didSet { applyInteractiveDismiss() }
    }

    // 웹 jd-request-close(cancelable) 등가 — false 반환 시 닫기 중단
    public var onDismissAttempt: ((JdDismissReason) -> Bool)?

    // 웹 jd-close 등가 — 닫힘 후 사후 통지
    public var onClose: (() -> Void)?

    // 테스트 표면 (@testable) — detent/그래버 의도를 present 없이 검증 (04 §8.2)
    enum DetentKind: Equatable {
        case fixedHeight(CGFloat)
        case large
    }
    var detentKind: DetentKind {
        size == .full ? .large : .fixedHeight(size.sheetHeight)
    }
    var prefersGrabber: Bool { draggable }

    public init(size: JdOverlaySize = .md, draggable: Bool = true, persistent: Bool = false) {
        self.size = size
        self.draggable = draggable
        self.persistent = persistent
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .pageSheet
        applyInteractiveDismiss()
    }

    required init?(coder: NSCoder) {
        fatalError("코드 생성 전용")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = JdToken.Color.card.uiColor
        view.addSubview(contentView)
        contentView.jd.layout {
            $0.top.equal(to: view.jd.safeArea.top, offset: JdToken.Space.s6)
            $0.leading.equal(to: view.jd.safeArea.leading, offset: JdToken.Space.s5)
            $0.trailing.equal(to: view.jd.safeArea.trailing, offset: -JdToken.Space.s5)
            $0.bottom.lessThanOrEqual(to: view.jd.safeArea.bottom, offset: -JdToken.Space.s6)
        }
        if let sheet = sheetPresentationController {
            sheet.detents = resolvedDetents()
            sheet.prefersGrabberVisible = prefersGrabber
        }
    }

    public override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        UIAccessibility.post(notification: .screenChanged, argument: contentView)
    }

    public func present(from presenter: UIViewController, animated: Bool = true) {
        presentationController?.delegate = self
        presenter.present(self, animated: animated)
    }

    // 명시적 닫기 — 게이트 통과 시 닫힌다(웹 close() 동형)
    public func requestClose(_ reason: JdDismissReason = .close) {
        if let handler = onDismissAttempt, handler(reason) == false { return }
        dismiss(animated: true) { [weak self] in self?.onClose?() }
    }

    // MARK: 내부

    func resolvedDetents() -> [UISheetPresentationController.Detent] {
        switch detentKind {
        case .large:
            return [.large()]
        case .fixedHeight(let height):
            // iOS16 커스텀 detent — sheetHeight(px 참고치)를 그대로 높이로 (04 §10.1)
            return [.custom { _ in height }]
        }
    }

    private func applyInteractiveDismiss() {
        // 끌어 닫기 불가(!draggable)거나 persistent면 시스템 스와이프 차단
        isModalInPresentation = persistent || !draggable
    }

    // MARK: UIAdaptivePresentationControllerDelegate — 스와이프 다운 = 웹 백드롭 경로

    public func presentationControllerShouldDismiss(
        _ presentationController: UIPresentationController
    ) -> Bool {
        if persistent || !draggable { return false }
        if let handler = onDismissAttempt { return handler(.backdrop) }
        return true
    }

    public func presentationControllerDidDismiss(_ presentationController: UIPresentationController)
    {
        onClose?()
    }
}
