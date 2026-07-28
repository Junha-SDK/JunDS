import JunDSCore
import UIKit

// 웹 jd-action-sheet의 iOS 번역: UIAlertController(.actionSheet) 위임 (04 §10.1).
// Core JdActionItem 배열 → UIAlertAction. isDestructive → .destructive.
// 취소 축은 시스템 관용대로 .cancel 액션 1개(confirmationDialog 자동 취소와 동형).
// UIViewController 서브클래스가 아니라 프레젠테이션을 얇게 위임하는 코디네이터다.
public final class JdActionSheetController {

    private let sheetTitle: String?
    private let message: String?
    private let actions: [JdActionItem]
    private let cancelLabel: String
    private let onSelect: (JdActionItem) -> Void

    public init(
        title: String? = nil,
        message: String? = nil,
        actions: [JdActionItem],
        cancelLabel: String = "취소",
        onSelect: @escaping (JdActionItem) -> Void
    ) {
        self.sheetTitle = title
        self.message = message
        self.actions = actions
        self.cancelLabel = cancelLabel
        self.onSelect = onSelect
    }

    // 테스트 표면 (@testable) — present 없이 JdActionItem→UIAlertAction 변환을 검증 (04 §8.2)
    func makeAlertController() -> UIAlertController {
        let alert = UIAlertController(
            title: sheetTitle, message: message, preferredStyle: .actionSheet)
        for item in actions {
            let style: UIAlertAction.Style = item.isDestructive ? .destructive : .default
            alert.addAction(
                UIAlertAction(title: item.label, style: style) { [weak self] _ in
                    self?.select(item)
                })
        }
        alert.addAction(UIAlertAction(title: cancelLabel, style: .cancel))
        return alert
    }

    // 각 액션 핸들러가 부르는 단일 경로 — 테스트도 이 경로로 onSelect 발화를 확인
    func select(_ item: JdActionItem) {
        onSelect(item)
    }

    public func present(
        from presenter: UIViewController,
        animated: Bool = true,
        sourceView: UIView? = nil
    ) {
        let alert = makeAlertController()
        // iPad: actionSheet는 popover라 앵커 필수(없으면 크래시)
        if let popover = alert.popoverPresentationController {
            let anchor = sourceView ?? presenter.view
            popover.sourceView = anchor
            if let anchor {
                popover.sourceRect = anchor.bounds
            }
        }
        presenter.present(alert, animated: animated)
    }
}
