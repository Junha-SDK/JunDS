import JunDSCore
import UIKit

// 웹 jd-alert-dialog(+ ConfirmDialog 별칭)의 iOS 번역: UIAlertController(.alert) 위임 (04 §10.1).
// 확인/취소 2버튼. isDestructive면 확인 버튼이 .destructive(빨강). cancelLabel nil이면 확인 단일.
// UIViewController 서브클래스가 아니라 프레젠테이션을 얇게 위임하는 코디네이터다.
public final class JdAlertDialogController {

    private let alertTitle: String
    private let message: String?
    private let confirmLabel: String
    private let cancelLabel: String?
    private let isDestructive: Bool
    private let onConfirm: () -> Void
    private let onCancel: (() -> Void)?

    public init(
        title: String,
        message: String? = nil,
        confirmLabel: String = "확인",
        cancelLabel: String? = "취소",
        isDestructive: Bool = false,
        onConfirm: @escaping () -> Void,
        onCancel: (() -> Void)? = nil
    ) {
        self.alertTitle = title
        self.message = message
        self.confirmLabel = confirmLabel
        self.cancelLabel = cancelLabel
        self.isDestructive = isDestructive
        self.onConfirm = onConfirm
        self.onCancel = onCancel
    }

    // 테스트 표면 (@testable) — present 없이 확인/취소·destructive 매핑을 검증 (04 §8.2)
    func makeAlertController() -> UIAlertController {
        let alert = UIAlertController(title: alertTitle, message: message, preferredStyle: .alert)
        if let cancelLabel {
            alert.addAction(
                UIAlertAction(title: cancelLabel, style: .cancel) { [weak self] _ in
                    self?.cancel()
                })
        }
        let confirmStyle: UIAlertAction.Style = isDestructive ? .destructive : .default
        let confirm = UIAlertAction(title: confirmLabel, style: confirmStyle) { [weak self] _ in
            self?.confirm()
        }
        alert.addAction(confirm)
        // 파괴적 확인은 강조(bold)하지 않는다 — 취소가 기본 강조가 되도록(웹 danger 패턴)
        alert.preferredAction = isDestructive ? nil : confirm
        return alert
    }

    // 액션 핸들러 단일 경로 — 테스트도 이 경로로 콜백 발화를 확인
    func confirm() { onConfirm() }
    func cancel() { onCancel?() }

    public func present(from presenter: UIViewController, animated: Bool = true) {
        presenter.present(makeAlertController(), animated: animated)
    }
}
