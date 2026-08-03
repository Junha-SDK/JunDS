import JunDSCore
import SwiftUI

// 웹 jd-action-sheet의 SwiftUI 번역: 시스템 .confirmationDialog 위임 (04 §10.1).
// Core JdActionItem 배열 → Button(role:). isDestructive → .destructive.
// confirmationDialog는 취소 버튼을 자동 제공하므로 별도 cancel 축을 두지 않는다(웹 판정 승계).
public struct JdActionSheet: View {

    @Binding private var isPresented: Bool
    private let title: String?
    private let message: String?
    private let actions: [JdActionItem]
    private let onSelect: (JdActionItem) -> Void

    public init(
        isPresented: Binding<Bool>,
        title: String? = nil,
        message: String? = nil,
        actions: [JdActionItem],
        onSelect: @escaping (JdActionItem) -> Void
    ) {
        self._isPresented = isPresented
        self.title = title
        self.message = message
        self.actions = actions
        self.onSelect = onSelect
    }

    public var body: some View {
        Color.clear
            .confirmationDialog(
                title ?? "",
                isPresented: $isPresented,
                titleVisibility: title == nil ? .hidden : .visible
            ) {
                ForEach(actions) { item in
                    Button(role: item.isDestructive ? .destructive : nil) {
                        onSelect(item)
                    } label: {
                        Text(item.label)
                    }
                }
            } message: {
                if let message {
                    Text(message)
                }
            }
    }
}
