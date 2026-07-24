import SwiftUI
import JunDSCore

// 웹 jd-alert-dialog(+ ConfirmDialog 별칭)의 SwiftUI 번역: 시스템 .alert 위임 (04 §10.1).
// 확인/취소 2버튼. isDestructive면 확인 버튼이 .destructive(빨강). cancelLabel nil이면 확인 단일.
// 별칭 ConfirmDialog는 신규 타입 없이 이 표면(제목·설명·확인/취소·danger)으로 표현한다.
public struct JdAlertDialog: View {

    @Binding private var isPresented: Bool
    private let title: String
    private let message: String?
    private let confirmLabel: String
    private let cancelLabel: String?
    private let isDestructive: Bool
    private let onConfirm: () -> Void
    private let onCancel: (() -> Void)?

    public init(isPresented: Binding<Bool>,
                title: String,
                message: String? = nil,
                confirmLabel: String = "확인",
                cancelLabel: String? = "취소",
                isDestructive: Bool = false,
                onConfirm: @escaping () -> Void,
                onCancel: (() -> Void)? = nil) {
        self._isPresented = isPresented
        self.title = title
        self.message = message
        self.confirmLabel = confirmLabel
        self.cancelLabel = cancelLabel
        self.isDestructive = isDestructive
        self.onConfirm = onConfirm
        self.onCancel = onCancel
    }

    public var body: some View {
        Color.clear
            .alert(title, isPresented: $isPresented) {
                Button(confirmLabel, role: isDestructive ? .destructive : nil) {
                    onConfirm()
                }
                if let cancelLabel {
                    Button(cancelLabel, role: .cancel) {
                        onCancel?()
                    }
                }
            } message: {
                if let message {
                    Text(message)
                }
            }
    }
}
