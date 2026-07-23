import UIKit
import JunDSCore

// 웹 jd-modal의 iOS 번역: 시스템 시트 프레젠테이션 위임 (04 §10 — 포커스 격리 공짜).
// persistent = 인터랙티브 dismiss 차단 (웹: 백드롭 클릭 무시와 동일 의미론, DEC-012-4)
public final class JdModalViewController: UIViewController, UIAdaptivePresentationControllerDelegate {

    public let contentView = UIView()

    public var persistent: Bool {
        didSet {
            isModalInPresentation = persistent
            sheetPresentationController?.prefersGrabberVisible = !persistent
        }
    }

    // 웹 jd-request-close(cancelable) 등가 — false 반환 시 닫기 중단
    public var onRequestClose: ((JdModalCloseReason) -> Bool)?

    // 웹 jd-close 등가 — 상태 변화 후 사후 통지
    public var onClose: (() -> Void)?

    private let modalSize: JdModalSize

    public init(size: JdModalSize = .md, persistent: Bool = false) {
        self.modalSize = size
        self.persistent = persistent
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .pageSheet
        isModalInPresentation = persistent
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
            switch modalSize {
            case .sm, .md:
                sheet.detents = [.medium(), .large()]
            case .lg:
                sheet.detents = [.large()]
            }
            sheet.prefersGrabberVisible = !persistent
        }
    }

    public override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // 웹 focus trap의 initialFocus 등가 — VoiceOver 포커스를 콘텐츠로
        UIAccessibility.post(notification: .screenChanged, argument: contentView)
    }

    public func present(from presenter: UIViewController, animated: Bool = true) {
        presentationController?.delegate = self
        presenter.present(self, animated: animated)
    }

    // 닫기 요청 — onRequestClose가 false를 반환하지 않으면 닫힌다 (웹 close()와 동형)
    public func requestClose(_ reason: JdModalCloseReason = .close) {
        if let handler = onRequestClose, handler(reason) == false { return }
        dismiss(animated: true) { [weak self] in
            self?.onClose?()
        }
    }

    // MARK: UIAdaptivePresentationControllerDelegate — 스와이프 다운 = 웹 백드롭 경로

    public func presentationControllerShouldDismiss(_ presentationController: UIPresentationController) -> Bool {
        if persistent { return false }
        if let handler = onRequestClose { return handler(.backdrop) }
        return true
    }

    public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        onClose?()
    }
}
